package com.scms.service.admin;

import com.scms.dto.admin.RoleResponse;
import com.scms.entity.enums.Role;

import java.util.List;

public interface AdminRoleService {

    List<RoleResponse> getAllRoles();

    RoleResponse getRole(Role role);
}