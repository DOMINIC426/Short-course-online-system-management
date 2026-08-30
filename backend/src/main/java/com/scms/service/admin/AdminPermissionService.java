package com.scms.service.admin;

import com.scms.dto.admin.PermissionRequest;
import com.scms.dto.admin.PermissionResponse;
import com.scms.dto.admin.UpdatePermissionRequest;

import java.util.List;

public interface AdminPermissionService {

    PermissionResponse createPermission(PermissionRequest request);

    List<PermissionResponse> getAllPermissions();

    PermissionResponse getPermissionById(Long id);

    PermissionResponse updatePermission(
            Long id,
            UpdatePermissionRequest request
    );

    void deletePermission(Long id);
}