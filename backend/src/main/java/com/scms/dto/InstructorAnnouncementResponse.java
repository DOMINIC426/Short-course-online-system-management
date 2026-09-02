package com.scms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class InstructorAnnouncementResponse {

    private Long announcementId;
    private Long courseId;
    private String title;
    private String audienceType;
    private String status;
    private int recipientCount;
}
