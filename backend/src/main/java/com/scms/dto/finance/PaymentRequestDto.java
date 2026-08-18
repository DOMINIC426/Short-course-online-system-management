package com.scms.dto.finance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {

    @NotNull(message = "Student ID selection is mandatory")
    private Long studentId;

    @NotBlank(message = "Payment reference ID is required (e.g., Bank slip number)")
    private String paymentReferenceId;

    private String paymentTransactionId;

    @NotNull(message = "Payment amount is required")
    @Positive(message = "Payment amount must be greater than zero")
    private BigDecimal amount;

    @NotBlank(message = "Payment method is required (BANK_TRANSFER, MOBILE_MONEY, CASH)")
    private String paymentMethod;

    private String provider; // e.g., M-Pesa, CRDB, NMB
}
