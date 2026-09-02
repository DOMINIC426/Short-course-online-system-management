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
public class InstructorStudentResponse {

    private Long enrollmentId;
    private Long studentId;

    private String firstName;
    private String lastName;
    private String email;

    private String controlNumber;
    private LocalDateTime registrationDate;

    private BigDecimal amountRequired;
    private BigDecimal amountPaid;
    private BigDecimal balance;

    private String paymentStatus;
}
