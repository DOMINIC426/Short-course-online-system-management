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
import com.scms.exception.UserNotFoundException;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentCourseRepository;
import com.scms.repository.student.CourseEnrollmentRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentEnrollmentService {

    private final StudentCourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest request) {
        // Get current authenticated user email
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Ensure the current user is a student
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new UserNotFoundException("Student profile not found"));

        // Fetch course with pessimistic lock to avoid overbooking
        ShortCourse course = courseRepository.findByIdForUpdate(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Business rule checks
        validateEnrollmentEligibility(student, course);

        // Create enrollment
        CourseEnrollment enrollment = CourseEnrollment.builder()
                .student(student)
                .course(course)
                .registrationDate(LocalDateTime.now())
                .enrollmentStatus(EnrollmentStatus.REGISTERED)
                .paymentStatus(PaymentStatus.UNPAID)
                .controlNumber(generateControlNumber())
                .amountRequired(course.getCourseFee())
                .amountPaid(BigDecimal.ZERO)
                .balance(course.getCourseFee())
                .build();

        CourseEnrollment saved = enrollmentRepository.save(enrollment);

        return mapToResponse(saved);
    }

    private void validateEnrollmentEligibility(Student student, ShortCourse course) {
        // Course must be published or registration open
        if (course.getStatus() != CourseStatus.PUBLISHED &&
            course.getStatus() != CourseStatus.REGISTRATION_OPEN) {
            throw new IllegalStateException("Course is not open for registration");
        }

        // Check registration dates
        LocalDateTime now = LocalDateTime.now();
        if (course.getRegOpenDate() != null && now.isBefore(course.getRegOpenDate().atStartOfDay())) {
            throw new IllegalStateException("Registration has not started yet");
        }
        if (course.getRegCloseDate() != null && now.isAfter(course.getRegCloseDate().plusDays(1).atStartOfDay())) {
            throw new IllegalStateException("Registration has closed");
        }

        // Check capacity
        long enrolledCount = enrollmentRepository.countByCourse(course);
        if (course.getMaxStudents() != null && enrolledCount >= course.getMaxStudents()) {
            throw new IllegalStateException("Course is full");
        }

        // Check duplicate enrollment
        boolean alreadyEnrolled = enrollmentRepository
                .findByStudentAndCourse(student, course)
                .isPresent();
        if (alreadyEnrolled) {
            throw new IllegalStateException("Student is already enrolled in this course");
        }
    }

    private String generateControlNumber() {
        // Simple unique control number; can be enhanced with format
        return "CTRL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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