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
import com.scms.service.admin.AuditLogService;
import com.scms.repository.student.CourseEnrollmentRepository;
import com.scms.repository.student.StudentCourseRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final AuditLogService auditLogService;
    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        ShortCourse course = courseRepository.findByIdForUpdate(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        validateEnrollmentEligibility(student, course);

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .student(student)
                .course(course)
                .registrationDate(LocalDateTime.now())
                .enrollmentStatus(EnrollmentStatus.REGISTERED)
                .paymentStatus(PaymentStatus.UNPAID)
                .controlNumber(generateUniqueControlNumber())
                .amountRequired(course.getCourseFee())
                .amountPaid(BigDecimal.ZERO)
                .balance(course.getCourseFee())
                .build();

        CourseEnrollment saved = enrollmentRepository.save(enrollment);
        auditLogService.logAction("CREATE", "ENROLLMENT", saved.getId(), null, student.getId().toString(), user);
        return mapToResponse(saved);
    }

    private void validateEnrollmentEligibility(Student student, ShortCourse course) {
        if (course.getStatus() != CourseStatus.PUBLISHED &&
            course.getStatus() != CourseStatus.REGISTRATION_OPEN) {
            throw new BusinessRuleViolationException("Course is not open for registration");
        }

        LocalDateTime now = LocalDateTime.now();
        if (course.getRegOpenDate() != null && now.isBefore(course.getRegOpenDate().atStartOfDay())) {
            throw new BusinessRuleViolationException("Registration has not started yet");
        }
        if (course.getRegCloseDate() != null && now.isAfter(course.getRegCloseDate().plusDays(1).atStartOfDay())) {
            throw new BusinessRuleViolationException("Registration has closed");
        }

        long enrolledCount = enrollmentRepository.countByCourse(course);
        if (course.getMaxStudents() != null && enrolledCount >= course.getMaxStudents()) {
            throw new BusinessRuleViolationException("Course is full");
        }

        boolean alreadyEnrolled = enrollmentRepository
                .findByStudentAndCourse(student, course)
                .isPresent();
        if (alreadyEnrolled) {
            throw new BusinessRuleViolationException("Student is already enrolled in this course");
        }
    }

    private String generateUniqueControlNumber() {
        String controlNumber;
        int attempts = 0;
        do {
            controlNumber = "CTRL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            attempts++;
        } while (enrollmentRepository.findByControlNumber(controlNumber).isPresent() && attempts < 5);
        if (attempts >= 5) {
            throw new IllegalStateException("Unable to generate unique control number");
        }
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