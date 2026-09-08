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
public class StudentNotificationResponse {

    private Long notificationId;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}