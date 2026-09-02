package com.scms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class InstructorVenueUpdateResponse {

    private Long courseId;
    private String courseCode;

    private Long oldVenueId;
    private String oldVenueName;

    private Long newVenueId;
    private String newVenueName;

    private String reason;
    private LocalDateTime changedAt;
}
