package com.scms.service.student;

import com.scms.dto.student.EnrollmentResponse;
import com.scms.dto.student.PaginatedResponse;
import com.scms.entity.CourseEnrollment;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.UserRepository;
import com.scms.repository.student.CourseEnrollmentRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public PaginatedResponse<EnrollmentResponse> getMyEnrollments(int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("registrationDate").descending());
        Page<CourseEnrollment> enrollmentPage =
                enrollmentRepository.findByStudentOrderByRegistrationDateDesc(student, pageable);

        List<EnrollmentResponse> content = enrollmentPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<EnrollmentResponse>builder()
                .content(content)
                .page(enrollmentPage.getNumber())
                .size(enrollmentPage.getSize())
                .totalElements(enrollmentPage.getTotalElements())
                .totalPages(enrollmentPage.getTotalPages())
                .last(enrollmentPage.isLast())
                .first(enrollmentPage.isFirst())
                .build();
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