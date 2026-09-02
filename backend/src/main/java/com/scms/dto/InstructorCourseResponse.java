package com.scms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstructorCourseResponse {

    private Long courseId;
    private String courseCode;
    private String title;

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal courseFee;
    private String status;

    private LocalDate assignedDate;
}
