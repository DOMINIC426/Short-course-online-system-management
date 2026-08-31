package com.scms.dto.market;

import com.scms.entity.enums.CourseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CreateShortCourseDto {

    @NotBlank(message = "Course code is required")
    private String courseCode;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Duration is required")
    private String duration;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Registration open date is required")
    private LocalDate regOpenDate;

    @NotNull(message = "Registration close date is required")
    private LocalDate regCloseDate;

    @NotNull(message = "Course fee is required")
    @Positive(message = "Course fee must be greater than zero")
    private BigDecimal courseFee;

    @NotNull(message = "Maximum students limit is required")
    @Positive(message = "Maximum students must be greater than zero")
    private Integer maxStudents;

    @NotNull(message = "Minimum students limit is required")
    @Positive(message = "Minimum students must be greater than zero")
    private Integer minStudents;

    // Optional fields
    private CourseStatus status;
    private Long categoryId;
    private Long venueId;
}