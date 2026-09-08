package com.scms.dto.admin;

import com.scms.entity.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionRequest {

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Permission ID is required")
    private Long permissionId;
}