package com.scms.service.market;

import com.scms.dto.market.CourseStatsResponse;
import com.scms.dto.market.CreateShortCourseDto;
import com.scms.dto.market.ShortCourseResponse;
import com.scms.entity.CourseCategory;
import com.scms.entity.CourseInstructor;
import com.scms.entity.Instructor;
import com.scms.entity.ShortCourse;
import com.scms.entity.Users;
import com.scms.entity.Venue;
import com.scms.entity.enums.CourseStatus;
import com.scms.entity.enums.Role;
import com.scms.exception.CourseAlreadyExistException;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.student.CourseEnrollmentRepository;
import com.scms.repository.CourseInstructorRepository;
import com.scms.repository.CourseCategoryRepository;
import com.scms.repository.InstructorRepository;
import com.scms.repository.ShortCourseRepository;
import com.scms.repository.UserRepository;
import com.scms.repository.VenueRepository;
import com.scms.dto.market.UpdateShortCourseDto;
import com.scms.dto.market.CreateCategoryDto;
import com.scms.dto.market.CategoryResponse;
import com.scms.dto.market.InstructorResponse;
import com.scms.dto.market.AssignedCourseResponse;
import com.scms.dto.market.CreateInstructorDto;
import com.scms.entity.enums.UserStatus;
import com.scms.exception.UserAlreadyExistException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDate;

@RequiredArgsConstructor
@Service
public class MarketService {

    private final ModelMapper modelMapper;
    private final ShortCourseRepository shortCourseRepository;
    private final CourseInstructorRepository courseInstructorRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final InstructorRepository instructorRepository;
    private final CourseCategoryRepository categoryRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ************************************************************* CREATE COURSE
    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional
    public ShortCourseResponse registerCourse(CreateShortCourseDto request) {
        validateCourseDates(request.getStartDate(), request.getEndDate(), request.getRegOpenDate(), request.getRegCloseDate());
        validateStudentLimits(request.getMinStudents(), request.getMaxStudents());
        validateUniqueCourseFields(request.getTitle(), request.getCourseCode(), null);

        ShortCourse shortCourse = modelMapper.map(request, ShortCourse.class);
        shortCourse.setId(null); // Explicitly reset ID to prevent ModelMapper ambiguity

        // Automatically resolve authenticated user from SecurityContext
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Users creator = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + currentUserEmail));
        shortCourse.setCreatedBy(creator);

        if (request.getCategoryId() != null) {
            CourseCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category with ID " + request.getCategoryId() + " not found"));
            shortCourse.setCategory(category);
        }

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue with ID " + request.getVenueId() + " not found"));
            shortCourse.setVenue(venue);
        }

        if (shortCourse.getStatus() == null) {
            shortCourse.setStatus(CourseStatus.DRAFT);
        }

        return toResponse(shortCourseRepository.save(shortCourse));
    }

    // **************************************** EDIT COURSE
    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional
    public ShortCourseResponse editCourse(Long id, UpdateShortCourseDto request) {
        ShortCourse shortCourse = shortCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        validateUniqueCourseFields(request.getTitle(), request.getCourseCode(), id);

        if (request.getCourseCode() != null) {
            shortCourse.setCourseCode(request.getCourseCode());
        }
        if (request.getTitle() != null) {
            shortCourse.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            shortCourse.setDescription(request.getDescription());
        }
        if (request.getDuration() != null) {
            shortCourse.setDuration(request.getDuration());
        }
        if (request.getStartDate() != null) {
            shortCourse.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            shortCourse.setEndDate(request.getEndDate());
        }
        if (request.getRegOpenDate() != null) {
            shortCourse.setRegOpenDate(request.getRegOpenDate());
        }
        if (request.getRegCloseDate() != null) {
            shortCourse.setRegCloseDate(request.getRegCloseDate());
        }
        if (request.getCourseFee() != null) {
            shortCourse.setCourseFee(request.getCourseFee());
        }
        if (request.getMaxStudents() != null) {
            shortCourse.setMaxStudents(request.getMaxStudents());
        }
        if (request.getMinStudents() != null) {
            shortCourse.setMinStudents(request.getMinStudents());
        }
        if (request.getStatus() != null) {
            shortCourse.setStatus(request.getStatus());
        }
        if (request.getCategoryId() != null) {
            CourseCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category with ID " + request.getCategoryId() + " not found"));
            shortCourse.setCategory(category);
        }
        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue with ID " + request.getVenueId() + " not found"));
            shortCourse.setVenue(venue);
        }

            validateCourseDates(shortCourse.getStartDate(), shortCourse.getEndDate(),
                shortCourse.getRegOpenDate(), shortCourse.getRegCloseDate());
            validateStudentLimits(shortCourse.getMinStudents(), shortCourse.getMaxStudents());

            return toResponse(shortCourseRepository.save(shortCourse));
    }

    // ******************************************************** DELETE THE COURSE
    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional
    public String deleteCourse(Long id) {
        ShortCourse shortCourse = shortCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        shortCourseRepository.delete(shortCourse);
        return "Course " + shortCourse.getTitle() + " has been deleted";
    }

    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional(readOnly = true)
    public List<ShortCourseResponse> getAllCourses() {
        List<ShortCourse> courses = shortCourseRepository.findAll();
        return courses.stream()
            .map(this::toResponse)
                .toList();
    }

    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional
    public String setCourseAvailable(Long id) {
        ShortCourse shortCourse = shortCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        shortCourse.setStatus(CourseStatus.PUBLISHED);
        shortCourseRepository.save(shortCourse);

        return "Course '" + shortCourse.getTitle() + "' is now available";
    }

    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional
    public String setCourseUnavailable(Long id) {
        ShortCourse shortCourse = shortCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        shortCourse.setStatus(CourseStatus.CANCELLED);
        shortCourseRepository.save(shortCourse);

        return "Course '" + shortCourse.getTitle() + "' is now unavailable";
    }

    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional(readOnly = true)
    public List<ShortCourseResponse> getVisibleCourse(CourseStatus status) {
        List<ShortCourse> courses = shortCourseRepository.findAllByStatus(status);
        return courses.stream()
            .map(this::toResponse)
                .toList();
    }

    // **************************************** ASSIGN INSTRUCTOR
    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional
    public ShortCourseResponse assignInstructor(Long courseId, Long instructorId) {
        ShortCourse shortCourse = shortCourseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course does not exist (ID: " + courseId + ")"));

        Users instructorUser = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with ID: " + instructorId));

        if (instructorUser.getRole() != Role.INSTRUCTOR) {
            throw new ResourceNotFoundException("User with ID " + instructorId + " is not an instructor");
        }

        Instructor instructor = instructorRepository.findByUserId(instructorId)
            .orElseThrow(() -> new ResourceNotFoundException("Instructor profile not found for user ID: " + instructorId));
        if (!courseInstructorRepository.existsByCourseIdAndInstructorUserId(courseId, instructorId)) {
            courseInstructorRepository.save(CourseInstructor.builder()
                .course(shortCourse)
                .instructor(instructor)
                .assignedDate(LocalDate.now())
                .build());
        }

        return toResponse(shortCourse);
    }

    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional
    public InstructorResponse createInstructor(CreateInstructorDto request) {
        ShortCourse course = shortCourseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course does not exist (ID: " + request.getCourseId() + ")"));

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistException("An account with this email already exists");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new UserAlreadyExistException("An account with this phone number already exists");
        }

        Users user = userRepository.save(Users.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode("123456"))
                .role(Role.INSTRUCTOR)
                .status(UserStatus.ACTIVE)
                .build());

        Instructor instructor = instructorRepository.save(Instructor.builder().user(user).build());
        courseInstructorRepository.save(CourseInstructor.builder()
                .course(course)
                .instructor(instructor)
                .assignedDate(LocalDate.now())
                .build());

        return new InstructorResponse(
                instructor.getId(),
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.getStatus().name(),
                List.of(new AssignedCourseResponse(course.getId(), course.getCourseCode(), course.getTitle())));
    }

    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional
    public String removeInstructorFromCourse(Long courseId, Long instructorId) {
        CourseInstructor assignment = courseInstructorRepository.findByCourseIdAndInstructorId(courseId, instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("This instructor is not assigned to the selected course"));

        courseInstructorRepository.delete(assignment);
        return "Instructor removed from course successfully";
    }

        @PreAuthorize("hasRole('MARKETING_OFFICER')")
        @Transactional(readOnly = true)
        public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream()
            .map(category -> new CategoryResponse(category.getId(), category.getCategoryName(), category.getDescription()))
            .toList();
        }

        @PreAuthorize("hasRole('MARKETING_OFFICER')")
        @Transactional
        public CategoryResponse createCategory(CreateCategoryDto request) {
        CourseCategory category = CourseCategory.builder()
            .categoryName(request.getName())
            .description(request.getDescription())
            .build();
        CourseCategory saved = categoryRepository.save(category);
        return new CategoryResponse(saved.getId(), saved.getCategoryName(), saved.getDescription());
        }

        @PreAuthorize("hasRole('MARKETING_OFFICER')")
        @Transactional(readOnly = true)
        public List<InstructorResponse> getInstructors() {
        return instructorRepository.findAll().stream()
            .map(instructor -> {
                List<AssignedCourseResponse> assignedCourses = courseInstructorRepository.findAllByInstructorId(instructor.getId()).stream()
                    .map(assignment -> new AssignedCourseResponse(
                        assignment.getCourse().getId(),
                        assignment.getCourse().getCourseCode(),
                        assignment.getCourse().getTitle()))
                    .toList();
                return new InstructorResponse(
                    instructor.getId(),
                    instructor.getUser().getId(),
                    instructor.getUser().getFirstName() + " " + instructor.getUser().getLastName(),
                    instructor.getUser().getEmail(),
                    instructor.getUser().getStatus().name(),
                    assignedCourses);
            })
            .toList();
        }

    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional
    public String deleteInstructor(Long instructorId) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor does not exist"));

        userRepository.delete(instructor.getUser());
        return "Instructor deleted successfully";
    }

    // **************************************** VIEW REGISTRATION STATISTICS
    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    @Transactional(readOnly = true)
    public CourseStatsResponse getCourseRegistrationStats(Long courseId) {
        ShortCourse shortCourse = shortCourseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        return CourseStatsResponse.builder()
                .courseId(shortCourse.getId())
                .courseTitle(shortCourse.getTitle())
                .totalRegisteredStudents(courseEnrollmentRepository.countByCourseId(courseId))
                .maxStudents(shortCourse.getMaxStudents())
                .build();
    }

    private ShortCourseResponse toResponse(ShortCourse course) {
        ShortCourseResponse response = modelMapper.map(course, ShortCourseResponse.class);
        if (course.getCategory() != null) {
            response.setCategoryId(course.getCategory().getId());
            response.setCategoryName(course.getCategory().getCategoryName());
        }
        if (course.getVenue() != null) {
            response.setVenueId(course.getVenue().getId());
            response.setVenueName(course.getVenue().getVenueName());
        }
        if (course.getCreatedBy() != null) {
            response.setCreatedById(course.getCreatedBy().getId());
            response.setCreatedByUsername(course.getCreatedBy().getUsername());
        }
        return response;
    }

    private void validateUniqueCourseFields(String title, String courseCode, Long id) {
        if (title != null && (id == null
                ? shortCourseRepository.existsByTitle(title)
                : shortCourseRepository.existsByTitleAndIdNot(title, id))) {
            throw new CourseAlreadyExistException("Course with title " + title + " already exists");
        }
        if (courseCode != null && (id == null
                ? shortCourseRepository.existsByCourseCode(courseCode)
                : shortCourseRepository.existsByCourseCodeAndIdNot(courseCode, id))) {
            throw new CourseAlreadyExistException("Course with code " + courseCode + " already exists");
        }
    }

    private void validateCourseDates(LocalDate startDate, LocalDate endDate,
                                     LocalDate registrationOpenDate, LocalDate registrationCloseDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Course end date cannot be before its start date");
        }
        if (registrationOpenDate.isAfter(startDate)) {
            throw new IllegalArgumentException("Registration open date cannot be after the course start date");
        }
        if (!registrationCloseDate.isBefore(endDate)) {
            throw new IllegalArgumentException("Registration close date must be before the course end date");
        }
        if (!registrationOpenDate.isBefore(registrationCloseDate)) {
            throw new IllegalArgumentException("Registration close date must be after the registration open date");
        }
        if (registrationCloseDate.equals(startDate)) {
            throw new IllegalArgumentException("Registration close date cannot be the same as the course start date");
        }
    }

    private void validateStudentLimits(Integer minStudents, Integer maxStudents) {
        if (minStudents > maxStudents) {
            throw new IllegalArgumentException("Minimum students cannot exceed maximum students");
        }
    }
}
