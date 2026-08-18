package com.scms.service.finance;

import com.scms.entity.Payment;
import com.scms.entity.Refund;
import com.scms.entity.Users;
import com.scms.entity.enums.PaymentStatus;
import com.scms.entity.enums.RefundStatus;
import com.scms.repository.UserRepository;
import com.scms.repository.finance.PaymentRepository;
import com.scms.repository.finance.RefundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    /**
     * Inner Vault Defense: Secure initiation of student reimbursement options.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public Refund initiateRefundRequest(Long paymentId, BigDecimal requestAmount, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found with ID: " + paymentId));

        if (payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.PENDING) {
            throw new IllegalStateException("Cannot process a refund against an unconfirmed or failed transaction.");
        }

        // 1. Strict Business Validation Check: Calculate the ceiling baseline
        BigDecimal totalAlreadyRefunded = refundRepository.getExistingRefundTotalForPayment(paymentId);
        BigDecimal maxRefundableLimit = payment.getAmount().subtract(totalAlreadyRefunded);

        if (requestAmount.compareTo(maxRefundableLimit) > 0) {
            throw new IllegalArgumentException(String.format(
                    "Refund Request Denied! Requested amount [%s] exceeds remaining eligible balance limit [%s] for this transaction.",
                    requestAmount, maxRefundableLimit
            ));
        }

        // Fetch current active context user to log the workflow creator entity
        String currentActorEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Users requester = userRepository.findByEmail(currentActorEmail)
                .orElseThrow(() -> new IllegalStateException("Active user session context metadata missing."));

        // 2. Initialize Refund payload using classic setters (No Builder pattern)
        Refund refund = new Refund();
        refund.setPayment(payment);
        refund.setRefundReference("REF-REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        refund.setAmount(requestAmount);
        refund.setReason(reason);
        refund.setStatus(RefundStatus.REQUESTED);
        refund.setRequestedAt(LocalDateTime.now());
        refund.setRequestedBy(requester);

        return refundRepository.save(refund);
    }

    /**
     * Completes and finalizes an initiated refund request transaction lifecycle.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public Refund updateRefundStatus(Long refundId, RefundStatus targetStatus, String auditNotes) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("Refund tracking envelope not found with ID: " + refundId));

        if (refund.getStatus() == RefundStatus.PROCESSED || refund.getStatus() == RefundStatus.REJECTED) {
            throw new IllegalStateException("Cannot update a refund record that has already been finalized or rejected.");
        }

        String currentActorEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Users approver = userRepository.findByEmail(currentActorEmail)
                .orElseThrow(() -> new IllegalStateException("Active auditor context missing."));

        refund.setStatus(targetStatus);
        refund.setApprovedBy(approver);
        refund.setApprovedAt(LocalDateTime.now());

        if (targetStatus == RefundStatus.PROCESSED) {
            refund.setProcessedAt(LocalDateTime.now());

            // 3. Balancing Adjustment Rule: Update the source parent payment state log flag
            Payment primaryPayment = refund.getPayment();
            BigDecimal completeRefundAggregate = refundRepository.getExistingRefundTotalForPayment(primaryPayment.getId());

            if (completeRefundAggregate.compareTo(primaryPayment.getAmount()) >= 0) {
                primaryPayment.setStatus(PaymentStatus.REFUNDED); // Total allocation swept
            } else {
                primaryPayment.setStatus(PaymentStatus.PARTIALLY_REFUNDED); // Partial floating credit lines remaining
            }
            paymentRepository.save(primaryPayment);
        }

        return refundRepository.save(refund);
    }

    public List<Refund> getRefundHistoryByPayment(Long paymentId) {
        return refundRepository.findByPaymentId(paymentId);
    }
}
