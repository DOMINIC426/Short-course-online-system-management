package com.scms.dto.market;

import com.scms.entity.enums.CourseStatus;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class UpdateShortCourseDto {

    private String courseCode;
    private String title;
    private String description;
    private String duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate regOpenDate;
    private LocalDate regCloseDate;

    @Positive(message = "Course fee must be greater than zero")
    private BigDecimal courseFee;

    @Positive(message = "Maximum students must be greater than zero")
    private Integer maxStudents;

    @Positive(message = "Minimum students must be greater than zero")
    private Integer minStudents;

    private CourseStatus status;
    private Long categoryId;
    private Long venueId;
}