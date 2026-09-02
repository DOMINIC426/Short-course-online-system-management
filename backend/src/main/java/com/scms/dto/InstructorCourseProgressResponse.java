package com.scms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class InstructorCourseProgressResponse {

    private Long progressId;

    private Long courseId;

    private String courseCode;

    private Integer progressPercentage;

    private String topicsCompleted;

    private String topicsRemaining;

    private String challenges;

    private String remarks;

    private LocalDate expectedCompletionDate;

    private Long updatedByInstructorId;

    private LocalDateTime submittedAt;
}
