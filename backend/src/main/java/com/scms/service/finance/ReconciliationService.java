package com.scms.service.finance;

import com.scms.entity.Payment;
import com.scms.entity.Reconciliation;
import com.scms.entity.Users;
import com.scms.entity.enums.ReconciliationStatus;
import com.scms.repository.UserRepository;
import com.scms.repository.finance.PaymentRepository;
import com.scms.repository.finance.ReconciliationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReconciliationService {

    private final ReconciliationRepository reconciliationRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    /**
     * Inner Vault Defense: Reconciles an internal transaction reference item against external bank statement rows.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public Reconciliation reconcileTransaction(Long paymentId, String bankRef, BigDecimal bankReportedAmount, String initialNotes) {

        // 1. Duplicate Check: Block duplicate matching processing requests
        Optional<Reconciliation> duplicateCheck = reconciliationRepository.findByPaymentId(paymentId);
        if (duplicateCheck.isPresent()) {
            throw new IllegalArgumentException("Deduplication Alert: Payment ID " + paymentId + " has already undergone an audit review entry.");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Internal payment tracking reference row missing for ID: " + paymentId));

        String currentActorEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Users reconciler = userRepository.findByEmail(currentActorEmail)
                .orElseThrow(() -> new IllegalStateException("Active authentication identity metadata unavailable."));

        // Initialize audit file row using traditional clean setters (No Builder pattern)
        Reconciliation auditFile = new Reconciliation();
        auditFile.setPayment(payment);
        auditFile.setReconciliationReference(bankRef != null ? bankRef.toUpperCase() : "REC-INTERNAL-" + System.currentTimeMillis());
        auditFile.setAmount(bankReportedAmount);
        auditFile.setReconciledAt(LocalDateTime.now());
        auditFile.setReconciledBy(reconciler);
        auditFile.setNotes(initialNotes);

        // 2. Exception Identification Matching Algorithm Logic Block
        if (payment.getAmount().compareTo(bankReportedAmount) == 0) {
            auditFile.setStatus(ReconciliationStatus.MATCHED);
        } else {
            // Cash values are divergent: Flag discrepancy immediately to prevent silent accounting leaks
            auditFile.setStatus(ReconciliationStatus.DISCREPANCY);
            auditFile.setNotes("[SYSTEM ALERT: VALUE MISMATCH] Internal Ledger stated: " + payment.getAmount() +
                    " | External Bank Statement reported: " + bankReportedAmount + " -> " + initialNotes);
        }

        return reconciliationRepository.save(auditFile);
    }

    /**
     * Adjusts or overrides a flagged bookkeeping discrepancy folder manually with traceable verification parameters.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public Reconciliation resolveDiscrepancyOverride(Long reconciliationId, String resolutionNotes) {
        Reconciliation auditRecord = reconciliationRepository.findById(reconciliationId)
                .orElseThrow(() -> new IllegalArgumentException("Reconciliation tracking docket item not found for ID: " + reconciliationId));

        if (auditRecord.getStatus() != ReconciliationStatus.DISCREPANCY && auditRecord.getStatus() != ReconciliationStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Override Action Denied: Target audit record status does not require resolution adjustments.");
        }

        auditRecord.setStatus(ReconciliationStatus.RESOLVED);
        auditRecord.setNotes(auditRecord.getNotes() + " | [MANUAL OVERRIDE RESOLUTION]: " + resolutionNotes);

        return reconciliationRepository.save(auditRecord);
    }

    /**
     * BR-FIN-005 Authority Metric Call: Obtains authentic aggregate numbers across verified matching rows.
     */
    public BigDecimal getAuthoritativeTotalVolume(ReconciliationStatus statusFilter) {
        return reconciliationRepository.calculateAuthoritativeTotalByStatus(statusFilter.name());
    }
}
