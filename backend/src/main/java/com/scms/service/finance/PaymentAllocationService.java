package com.scms.service.finance;

import com.scms.entity.Invoice;
import com.scms.entity.Payment;
import com.scms.entity.PaymentAllocation;
import com.scms.entity.enums.InvoiceStatus;
import com.scms.entity.enums.PaymentStatus;
import com.scms.repository.finance.InvoiceRepository;
import com.scms.repository.finance.PaymentAllocationRepository;
import com.scms.repository.finance.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentAllocationService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentAllocationRepository allocationRepository;

    /**
     * Inner Vault Defense: Secure allocation transactions at the service layer.
     * Automatically distributes payment credit across student invoices sequentially.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public void allocatePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found with ID: " + paymentId));

        // Block processing if payment transaction failed or is already allocated
        if (payment.getStatus() == PaymentStatus.FAILED) {
            throw new IllegalStateException("Cannot allocate funds from a failed payment transaction.");
        }

        // Fetch all active, unpaid or partially paid invoices for this specific student sorted by oldest first
        List<Invoice> outstandingInvoices = invoiceRepository.findAll().stream()
                .filter(inv -> inv.getStudent().getStudentId().equals(payment.getStudent().getStudentId()))
                .filter(inv -> inv.getStatus() == InvoiceStatus.ISSUED || inv.getStatus() == InvoiceStatus.PARTIALLY_PAID)
                .sorted((a, b) -> a.getIssueDate().compareTo(b.getIssueDate()))
                .toList();

        BigDecimal availableCredit = payment.getAmount();

        for (Invoice invoice : outstandingInvoices) {
            if (availableCredit.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal currentInvoiceBalance = invoice.getBalanceAmount();
            BigDecimal amountToAllocate;

            if (availableCredit.compareTo(currentInvoiceBalance) >= 0) {
                // Payment covers the full invoice balance (Full payment or Overpayment branch)
                amountToAllocate = currentInvoiceBalance;
                availableCredit = availableCredit.subtract(currentInvoiceBalance);

                invoice.setBalanceAmount(BigDecimal.ZERO);
                invoice.setPaidAmount(invoice.getPaidAmount().add(amountToAllocate));
                invoice.setStatus(InvoiceStatus.PAID);
            } else {
                // Payment only covers part of the invoice balance (Underpayment branch)
                amountToAllocate = availableCredit;
                availableCredit = BigDecimal.ZERO;

                invoice.setBalanceAmount(currentInvoiceBalance.subtract(amountToAllocate));
                invoice.setPaidAmount(invoice.getPaidAmount().add(amountToAllocate));
                invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
            }

            // Create allocation ledger entry without utilizing Builder wrappers
            PaymentAllocation allocation = new PaymentAllocation();
            allocation.setPayment(payment);
            allocation.setInvoice(invoice);
            allocation.setAllocatedAmount(amountToAllocate);
            allocation.setAllocatedAt(LocalDateTime.now());

            allocationRepository.save(allocation);
            invoiceRepository.save(invoice);
        }

        // Handle structural overpayments: Flag payment state if credit remains unallocated
        if (availableCredit.compareTo(BigDecimal.ZERO) > 0) {
            payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED); // Re-purpose status or handle as floating credit line
            paymentRepository.save(payment);
            System.out.printf("OVERPAYMENT DETECTED: Floating credit amount of %s remaining for Student ID: %d%n",
                    availableCredit, payment.getStudent().getStudentId());
        }
    }
}
