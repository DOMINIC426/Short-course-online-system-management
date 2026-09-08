package com.scms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class InstructorCourseCompletionResponse {

    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private String previousStatus;
    private String currentStatus;
    private String message;
}
