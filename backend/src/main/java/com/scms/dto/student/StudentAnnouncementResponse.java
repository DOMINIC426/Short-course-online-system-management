package com.scms.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAnnouncementResponse {

    private Long announcementId;
    private Long courseId;
    private String courseTitle;
    private String title;
    private String message;
    private LocalDateTime createdDate;
}