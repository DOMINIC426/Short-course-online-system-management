package com.scms.dto;

import com.scms.entity.enums.CertificateStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InstructorCertificateEligibilityRequest {

    @NotNull
    private CertificateStatus status;

    private String reason;
}
