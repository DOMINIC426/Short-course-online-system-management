package com.scms.service.finance;

import com.scms.entity.Payment;
import com.scms.entity.Receipt;
import com.scms.entity.Student;
import com.scms.entity.enums.PaymentMethod;
import com.scms.entity.enums.PaymentStatus;
import com.scms.entity.enums.ReceiptStatus;
import com.scms.repository.finance.PaymentRepository;
import com.scms.repository.finance.ReceiptRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final ReceiptRepository receiptRepository;

    /**
     * Inner Vault Defense: Secure the core transactional process at the service layer
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public Payment recordPayment(Long studentId, Payment paymentDetails) {

        // 1. Idempotency Check: Prevent duplicate payment recording
        if (paymentRepository.findByPaymentReferenceId(paymentDetails.getPaymentReferenceId()).isPresent()) {
            throw new IllegalArgumentException("Duplicate Transaction: A payment with reference '" +
                    paymentDetails.getPaymentReferenceId() + "' has already been recorded!");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        // 2. Set Up Payment Record using standard setters (No Builder pattern)
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setPaymentReferenceId(paymentDetails.getPaymentReferenceId());
        payment.setPaymentTransactionId(paymentDetails.getPaymentTransactionId());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setAmount(paymentDetails.getAmount());
        payment.setPaymentMethod(paymentDetails.getPaymentMethod());
        payment.setProvider(paymentDetails.getProvider());
        payment.setStatus(PaymentStatus.COMPLETED); // Flag as processed

        Payment savedPayment = paymentRepository.save(payment);

        // 3. Automated Receipt Generation for Confirmed Payments
        Receipt receipt = new Receipt();
        receipt.setPayment(savedPayment);
        receipt.setReceiptNumber("REC-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        receipt.setIssuedAt(LocalDateTime.now());
        receipt.setStatus(ReceiptStatus.ISSUED);

        receiptRepository.save(receipt);

        return savedPayment;
    }
}
