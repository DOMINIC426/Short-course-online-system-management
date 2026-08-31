package com.scms.service.student;

import com.scms.dto.student.PaginatedResponse;
import com.scms.dto.student.PaymentHistoryResponse;
import com.scms.entity.PaymentTransaction;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentPaymentRepository;
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
public class StudentPaymentService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentPaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public PaginatedResponse<PaymentHistoryResponse> getMyPayments(int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("paymentDate").descending());
        Page<PaymentTransaction> paymentPage = paymentRepository.findAllByStudent(student, pageable);

        List<PaymentHistoryResponse> content = paymentPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<PaymentHistoryResponse>builder()
                .content(content)
                .page(paymentPage.getNumber())
                .size(paymentPage.getSize())
                .totalElements(paymentPage.getTotalElements())
                .totalPages(paymentPage.getTotalPages())
                .last(paymentPage.isLast())
                .first(paymentPage.isFirst())
                .build();
    }

    private PaymentHistoryResponse mapToResponse(PaymentTransaction payment) {
        return PaymentHistoryResponse.builder()
                .paymentId(payment.getId())
                .enrollmentId(payment.getEnrollment().getId())
                .courseTitle(payment.getEnrollment().getCourse().getTitle())
                .controlNumber(payment.getControlNumber())
                .transactionReference(payment.getTransactionReference())
                .amount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .externalTransactionId(payment.getExternalTransactionId())
                .build();
    }
}