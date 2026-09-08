package com.scms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignInstructorDto {
    @NotNull(message = "Instructor ID is required")
    private Long instructorId;
}