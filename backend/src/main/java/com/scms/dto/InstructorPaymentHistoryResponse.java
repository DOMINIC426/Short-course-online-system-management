package com.scms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstructorPaymentHistoryResponse {

    private Long paymentId;
    private String controlNumber;
    private String transactionReference;
    private String externalTransactionId;
    private LocalDateTime paymentDate;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
}
