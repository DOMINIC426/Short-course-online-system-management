package com.scms.dto.student;

import com.scms.entity.enums.PaymentMethod;
import com.scms.entity.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentHistoryResponse {

    private Long paymentId;
    private Long enrollmentId;
    private String courseTitle;
    private String controlNumber;
    private String transactionReference;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private PaymentMethod paymentMethod;
    private TransactionStatus paymentStatus;
    private String externalTransactionId;
}