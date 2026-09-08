package com.scms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstructorStudentDetailsResponse {

    private Long enrollmentId;
    private Long studentId;

    private String firstName;
    private String lastName;
    private String email;

    private String controlNumber;
    private LocalDateTime registrationDate;
    private String enrollmentStatus;

    private Long courseId;
    private String courseCode;
    private String courseTitle;

    private BigDecimal amountRequired;
    private BigDecimal amountPaid;
    private BigDecimal balance;

    private String paymentStatus;

    private List<InstructorPaymentHistoryResponse> paymentHistory;
}
