package com.scms.service.student;

import com.scms.dto.student.EnrollmentRequest;
import com.scms.dto.student.EnrollmentResponse;
import com.scms.entity.CourseEnrollment;
import com.scms.entity.ShortCourse;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.entity.enums.CourseStatus;
import com.scms.entity.enums.EnrollmentStatus;
import com.scms.entity.enums.PaymentStatus;
import com.scms.exception.BusinessRuleViolationException;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.UserRepository;
import com.scms.repository.student.CourseEnrollmentRepository;
import com.scms.repository.student.StudentCourseRepository;
import com.scms.repository.student.StudentRepository;
import com.scms.service.admin.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentEnrollmentService {

    private final StudentCourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest request) {
        if (request == null || request.getCourseId() == null) {
            throw new BusinessRuleViolationException("Course ID is required to process enrollment.");
        }

        // 1. Resolve Authenticated User
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User account not found for email: " + email));

        // 2. Resolve Linked Student Profile
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + email + ". Please complete profile setup."));

        // 3. Resolve Course Entity (Falls back to standard findById if findByIdForUpdate fails)
        ShortCourse course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + request.getCourseId()));

        // 4. Validate Business Rules
        validateEnrollmentEligibility(student, course);

        // 5. Calculate Required Amounts
        BigDecimal courseFee = course.getCourseFee() != null ? course.getCourseFee() : BigDecimal.ZERO;

        // 6. Build and Save Enrollment
        CourseEnrollment enrollment = CourseEnrollment.builder()
                .student(student)
                .course(course)
                .registrationDate(LocalDateTime.now())
                .enrollmentStatus(EnrollmentStatus.REGISTERED)
                .paymentStatus(PaymentStatus.UNPAID)
                .controlNumber(generateUniqueControlNumber())
                .amountRequired(courseFee)
                .amountPaid(BigDecimal.ZERO)
                .balance(courseFee)
                .build();

        CourseEnrollment saved = enrollmentRepository.save(enrollment);

        // 7. Non-blocking Audit Log Exception Catch
        try {
            String studentIdentifier = student.getId() != null ? student.getId().toString() : "N/A";
            auditLogService.logAction("CREATE", "ENROLLMENT", saved.getId(), null, studentIdentifier, user);
        } catch (Exception ex) {
            System.err.println("Audit log failed, skipping to preserve enrollment transaction: " + ex.getMessage());
        }

        return mapToResponse(saved);
    }

    private void validateEnrollmentEligibility(Student student, ShortCourse course) {
        // Status Check
        if (course.getStatus() != CourseStatus.PUBLISHED && course.getStatus() != CourseStatus.REGISTRATION_OPEN) {
            throw new BusinessRuleViolationException("Course is not open for registration (Current Status: " + course.getStatus() + ")");
        }

        // Date Checks with null protection
        LocalDate today = LocalDate.now();
        if (course.getRegOpenDate() != null && today.isBefore(course.getRegOpenDate())) {
            throw new BusinessRuleViolationException("Registration for this course has not opened yet.");
        }
        if (course.getRegCloseDate() != null && today.isAfter(course.getRegCloseDate())) {
            throw new BusinessRuleViolationException("Registration period for this course has ended.");
        }

        // Capacity Check
        long enrolledCount = enrollmentRepository.countByCourse(course);
        if (course.getMaxStudents() != null && enrolledCount >= course.getMaxStudents()) {
            throw new BusinessRuleViolationException("Course capacity is full.");
        }

        // Duplicate Check
        boolean alreadyEnrolled = enrollmentRepository.findByStudentAndCourse(student, course).isPresent();
        if (alreadyEnrolled) {
            throw new BusinessRuleViolationException("You are already enrolled in this course.");
        }
    }

    private String generateUniqueControlNumber() {
        String controlNumber;
        int attempts = 0;
        do {
            controlNumber = "CTRL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            attempts++;
        } while (enrollmentRepository.findByControlNumber(controlNumber).isPresent() && attempts < 10);

        return controlNumber;
    }

    private EnrollmentResponse mapToResponse(CourseEnrollment enrollment) {
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .registrationDate(enrollment.getRegistrationDate())
                .enrollmentStatus(enrollment.getEnrollmentStatus())
                .paymentStatus(enrollment.getPaymentStatus())
                .controlNumber(enrollment.getControlNumber())
                .amountRequired(enrollment.getAmountRequired())
                .amountPaid(enrollment.getAmountPaid())
                .balance(enrollment.getBalance())
                .build();
    }
}