package com.scms.service.finance;

import com.scms.entity.Discount;
import com.scms.entity.Invoice;
import com.scms.entity.InvoiceDiscount;
import com.scms.entity.enums.DiscountType;
import com.scms.entity.enums.InvoiceStatus;
import com.scms.repository.finance.DiscountRepository;
import com.scms.repository.finance.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepository;
    private final InvoiceRepository invoiceRepository;

    /**
     * Inner Vault Defense: Secure discount creation.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public Discount createDiscountPolicy(Discount discountDetails) {
        if (discountRepository.findByCode(discountDetails.getCode()).isPresent()) {
            throw new IllegalArgumentException("A discount policy with code '" + discountDetails.getCode() + "' already exists.");
        }

        Discount discount = new Discount();
        discount.setCode(discountDetails.getCode().toUpperCase());
        discount.setDiscountType(discountDetails.getDiscountType());
        discount.setValue(discountDetails.getValue());
        discount.setActive(true);

        return discountRepository.save(discount);
    }

    /**
     * Calculates and applies a discount directly to an outstanding invoice balance.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public Invoice applyDiscountToInvoice(Long invoiceId, String discountCode) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice record not found with ID: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.VOIDED) {
            throw new IllegalStateException("Cannot apply a discount to an invoice that is already paid or voided.");
        }

        Discount discount = discountRepository.findByCode(discountCode.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid discount policy code: " + discountCode));

        if (!discount.isActive()) {
            throw new IllegalArgumentException("The selected discount policy is currently inactive.");
        }

        // Calculate discount reduction amount based on policy rules
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (discount.getDiscountType() == DiscountType.PERCENTAGE) {
            // Amount = Subtotal * (Value / 100)
            BigDecimal factor = discount.getValue().divide(BigDecimal.valueOf(100));
            discountAmount = invoice.getSubtotalAmount().multiply(factor);
        } else if (discount.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discountAmount = discount.getValue();
        }

        // Enforce maximum discount threshold constraint
        if (discountAmount.compareTo(invoice.getBalanceAmount()) > 0) {
            discountAmount = invoice.getBalanceAmount(); // Cap deduction to outstanding balance
        }

        // Apply deduction values to the invoice metadata records
        invoice.setDiscountAmount(invoice.getDiscountAmount().add(discountAmount));
        invoice.setTotalAmount(invoice.getTotalAmount().subtract(discountAmount));
        invoice.setBalanceAmount(invoice.getBalanceAmount().subtract(discountAmount));

        // Dynamically shift status if the discount brings balance to zero
        if (invoice.getBalanceAmount().compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        }

        // Map child tracking log without utilizando Builder wrapper models
        InvoiceDiscount invoiceDiscount = new InvoiceDiscount();
        invoiceDiscount.setInvoice(invoice);
        invoiceDiscount.setDiscountId(discount.getId());
        invoiceDiscount.setAmount(discountAmount);

        invoice.getDiscounts().add(invoiceDiscount);
        return invoiceRepository.save(invoice);
    }
}
