package com.scms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class InstructorCertificateEligibilityResponse {

    private Long eligibilityId;

    private Long courseId;

    private Long enrollmentId;

    private Long studentId;

    private String studentName;

    private String status;

    private String reason;

    private Long updatedByInstructorId;

    private LocalDateTime updatedAt;
}
