package com.scms.dto.admin;

import com.scms.entity.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignRoleRequest {

    @NotNull(message = "Role is required")
    private Role role;
}