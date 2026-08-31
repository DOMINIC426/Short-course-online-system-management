package com.scms.dto.admin;

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
public class AuditLogResponse {

    private Long id;

    private Long userId;

    private String userName;

    private String action;

    private String entity;

    private Long entityId;

    private String oldValue;

    private String newValue;

    private LocalDateTime createdAt;
}