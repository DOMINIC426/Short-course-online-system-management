package com.scms.service.student;

import com.scms.dto.student.EnrollmentResponse;
import com.scms.entity.CourseEnrollment;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.repository.UserRepository;
import com.scms.repository.student.CourseEnrollmentRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentDashboardService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        List<CourseEnrollment> enrollments = enrollmentRepository
                .findByStudentOrderByRegistrationDateDesc(student);

        return enrollments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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