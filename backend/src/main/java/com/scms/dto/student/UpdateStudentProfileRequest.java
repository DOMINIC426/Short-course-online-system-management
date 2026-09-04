package com.scms.dto.student;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateStudentProfileRequest {

    @NotBlank(message = "Level of education is required")
    private String levelOfEducation;

    @NotBlank(message = "Nationality is required")
    private String nationality;

    @NotBlank(message = "Identification number is required")
    private String identificationNumber;
}