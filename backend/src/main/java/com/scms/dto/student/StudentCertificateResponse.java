package com.scms.dto.student;

import com.scms.entity.enums.CertificateStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCertificateResponse {

    private Long certificateId;
    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private CertificateStatus status;
    private String reason;
}