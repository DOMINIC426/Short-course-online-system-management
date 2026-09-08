package com.scms.dto;

import com.scms.entity.enums.CourseStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ShortCourseDTO {

    private String courseCode;

    private String title;

    private String description;

    private String duration;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate regOpenDate;

    private LocalDate regCloseDate;

    private BigDecimal courseFee;

    private Integer maxStudents;

    private Integer minStudents;

    private CourseStatus status;
}