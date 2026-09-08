package com.scms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class InstructorVenueUpdateRequest {

    @NotNull
    private Long venueId;

    @NotBlank
    private String reason;
}
