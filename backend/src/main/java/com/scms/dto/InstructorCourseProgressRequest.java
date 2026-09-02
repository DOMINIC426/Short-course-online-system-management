package com.scms.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class InstructorCourseProgressRequest {

    @NotNull
    @Min(0)
    @Max(100)
    private Integer progressPercentage;

    private String topicsCompleted;

    private String topicsRemaining;

    private String challenges;

    private String remarks;

    private LocalDate expectedCompletionDate;
}
