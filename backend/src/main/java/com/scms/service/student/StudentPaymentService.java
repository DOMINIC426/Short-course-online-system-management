package com.scms.service.student;

import com.scms.dto.student.PaymentHistoryResponse;
import com.scms.entity.PaymentTransaction;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentPaymentRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
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
    public List<PaymentHistoryResponse> getMyPayments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        List<PaymentTransaction> payments = paymentRepository.findAllByStudent(student);

        return payments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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