package com.scms.dto.market;

import com.scms.entity.enums.CourseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShortCourseDto {

    @NotBlank(message = "Course code is required")
    private String courseCode;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String duration;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate regOpenDate;
    private LocalDate regCloseDate;

    @NotNull(message = "Course fee is required")
    @Positive(message = "Course fee must be positive")
    private BigDecimal courseFee;

    private Integer maxStudents;
    private Integer minStudents;

    private CourseStatus status;

    private Long categoryId;
    private Long venueId;
    private Long createdById;
}