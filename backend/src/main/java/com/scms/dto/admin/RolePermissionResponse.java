package com.scms.dto.admin;

import com.scms.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionResponse {

    private Long id;

    private Role role;

    private Long permissionId;

    private String permissionName;

    private String permissionDescription;
}