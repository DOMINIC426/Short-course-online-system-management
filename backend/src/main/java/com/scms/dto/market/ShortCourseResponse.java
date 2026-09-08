package com.scms.dto.market;

import com.scms.entity.enums.CourseStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortCourseResponse {

    private Long id;
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

    private Long categoryId;
    private String categoryName;

    private Long venueId;
    private String venueName;

    private Long createdById;
    private String createdByUsername;
}