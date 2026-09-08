package com.scms.service.admin;

import com.scms.dto.admin.RolePermissionRequest;
import com.scms.dto.admin.RolePermissionResponse;
import com.scms.entity.enums.Role;

import java.util.List;

public interface AdminRolePermissionService {

    List<RolePermissionResponse> getPermissionsByRole(Role role);

    RolePermissionResponse assignPermission(
            RolePermissionRequest request
    );

    void removePermission(
            Role role,
            Long permissionId
    );
}