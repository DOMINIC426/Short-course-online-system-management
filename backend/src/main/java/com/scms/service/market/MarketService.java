package com.scms.service.market;

import com.scms.dto.market.CourseStatsResponse;
import com.scms.dto.market.CreateShortCourseDto;
import com.scms.dto.market.ShortCourseResponse;
import com.scms.entity.CourseCategory;
import com.scms.entity.ShortCourse;
import com.scms.entity.Users;
import com.scms.entity.Venue;
import com.scms.entity.enums.CourseStatus;
import com.scms.exception.CourseAlreadyExistException;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.CourseCategoryRepository;
import com.scms.repository.ShortCourseRepository;
import com.scms.repository.UserRepository;
import com.scms.repository.VenueRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Setter
@Getter
@RequiredArgsConstructor
@Service
public class MarketService {

    private final ModelMapper modelMapper;
    private final ShortCourseRepository shortCourseRepository;
    private final CourseCategoryRepository categoryRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    // ************************************************************* CREATE COURSE
    @PreAuthorize("hasRole(' MARKETING_OFFICER')")
    public ShortCourseResponse registerCourse(CreateShortCourseDto request) {
        if (shortCourseRepository.existsByTitle(request.getTitle())) {
            throw new CourseAlreadyExistException("Course with title " + request.getTitle() + " already exists");
        }

        ShortCourse shortCourse = modelMapper.map(request, ShortCourse.class);

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

        if (request.getCreatedById() != null) {
            Users creator = userRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User with ID " + request.getCreatedById() + " not found"));
            shortCourse.setCreatedBy(creator);
        }

        if (shortCourse.getStatus() == null) {
            shortCourse.setStatus(CourseStatus.DRAFT);
        }

        ShortCourse savedCourse = shortCourseRepository.save(shortCourse);
        return modelMapper.map(savedCourse, ShortCourseResponse.class);
    }

    // **************************************** EDIT COURSE
    @PreAuthorize("hasRole(' MARKETING_OFFICER')")
    public ShortCourseResponse editCourse(Long id, CreateShortCourseDto request) {
        ShortCourse shortCourse = shortCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

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

        ShortCourse savedCourse = shortCourseRepository.save(shortCourse);
        return modelMapper.map(savedCourse, ShortCourseResponse.class);
    }

    // ******************************************************** DELETE THE COURSE
    @PreAuthorize("hasRole(' MARKETING_OFFICER')")
    public String deleteCourse(Long id) {
        ShortCourse shortCourse = shortCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        shortCourseRepository.delete(shortCourse);
        return "Courses " + shortCourse.getTitle() + " has been deleted";
    }

    @PreAuthorize("hasRole(' MARKETING_OFFICER')")
    public List<ShortCourseResponse> getAllCourses() {
        List<ShortCourse> courses = shortCourseRepository.findAll();
        return courses.stream()
                .map(c -> modelMapper.map(c, ShortCourseResponse.class))
                .toList();
    }

    @PreAuthorize("hasRole(' MARKETING_OFFICER')")
    public String setCourseAvailable(Long id) {
        ShortCourse shortCourse = shortCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        shortCourse.setStatus(CourseStatus.PUBLISHED);
        shortCourseRepository.save(shortCourse);

        return "Course '" + shortCourse.getTitle() + "' is now available";
    }

    @PreAuthorize("hasRole(' MARKETING_OFFICER')")
    public String setCourseUnavailable(Long id) {
        ShortCourse shortCourse = shortCourseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        shortCourse.setStatus(CourseStatus.CANCELLED);
        shortCourseRepository.save(shortCourse);

        return "Course '" + shortCourse.getTitle() + "' is now unavailable";
    }

    @PreAuthorize("hasRole(' MARKETING_OFFICER')")
    public List<ShortCourseResponse> getVisibleCourse(CourseStatus status) {
        List<ShortCourse> courses = shortCourseRepository.findAllByStatus(status);
        return courses.stream()
                .map(c -> modelMapper.map(c, ShortCourseResponse.class))
                .toList();
    }


    // **************************************** ASSIGN INSTRUCTOR
    @PreAuthorize("hasRole(' MARKETING_OFFICER')")
    public ShortCourseResponse assignInstructor(Long courseId, Long instructorId) {
        ShortCourse shortCourse = shortCourseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        Users instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with ID: " + instructorId));

        // Assign instructor (ensure ShortCourse entity has instructor field/relation)
        // shortCourse.setInstructor(instructor);

        ShortCourse savedCourse = shortCourseRepository.save(shortCourse);
        return modelMapper.map(savedCourse, ShortCourseResponse.class);
    }

    // **************************************** VIEW REGISTRATION STATISTICS
    @PreAuthorize("hasRole(' MARKETING_OFFICER')")
    public CourseStatsResponse getCourseRegistrationStats(Long courseId) {
        ShortCourse shortCourse = shortCourseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        // Query registration count from your Enrollment repository
        // long registeredCount = enrollmentRepository.countByCourseId(courseId);
        long registeredCount = 0;

        return CourseStatsResponse.builder()
                .courseId(shortCourse.getId())
                .courseTitle(shortCourse.getTitle())
                .totalRegisteredStudents(registeredCount)
                .maxStudents(shortCourse.getMaxStudents())
                .build();
    }
}