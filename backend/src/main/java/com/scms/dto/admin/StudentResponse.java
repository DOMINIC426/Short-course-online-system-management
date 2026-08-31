package com.scms.dto.admin;

import com.scms.entity.enums.Role;
import com.scms.entity.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class StudentResponse {

    private Long studentId;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private Role role;

    private UserStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}