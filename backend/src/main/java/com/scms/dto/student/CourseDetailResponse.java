package com.scms.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDetailResponse {
    private Long id;
    private String courseCode;
    private String title;
    private String description;
    private String categoryName;
    private String categoryDescription;
    private BigDecimal courseFee;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate regOpenDate;
    private LocalDate regCloseDate;
    private Integer maxStudents;
    private String venueName;
    private String instructorNames; // comma separated if multiple
}