package com.scms.dto;

import com.scms.entity.Users;
import com.scms.entity.enums.Role;

import java.time.LocalDate;

public record RegisterResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        Role role,
        LocalDate createdAt
) {

    public static RegisterResponse fromUser(Users user) {
        return new RegisterResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}