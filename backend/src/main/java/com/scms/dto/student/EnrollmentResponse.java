package com.scms.dto.student;

import com.scms.entity.enums.EnrollmentStatus;
import com.scms.entity.enums.PaymentStatus;
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
public class EnrollmentResponse {

    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime registrationDate;
    private EnrollmentStatus enrollmentStatus;
    private PaymentStatus paymentStatus;
    private String controlNumber;
    private BigDecimal amountRequired;
    private BigDecimal amountPaid;
    private BigDecimal balance;
}