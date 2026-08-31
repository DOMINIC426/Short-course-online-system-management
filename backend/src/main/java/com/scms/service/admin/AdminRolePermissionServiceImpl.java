package com.scms.service.admin;

import com.scms.dto.admin.RolePermissionRequest;
import com.scms.dto.admin.RolePermissionResponse;
import com.scms.entity.Permission;
import com.scms.entity.RolePermission;
import com.scms.entity.enums.Role;
import com.scms.exception.UserNotFoundException;
import com.scms.repository.admin.PermissionRepository;
import com.scms.repository.admin.RolePermissionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminRolePermissionServiceImpl
        implements AdminRolePermissionService {

    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RolePermissionResponse> getPermissionsByRole(
            Role role
    ) {

        return rolePermissionRepository.findAllByRole(role)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public RolePermissionResponse assignPermission(
            RolePermissionRequest request
    ) {

        if (rolePermissionRepository.existsByRoleAndPermissionId(
                request.getRole(),
                request.getPermissionId()
        )) {

            throw new IllegalArgumentException(
                    "Permission is already assigned to role "
                            + request.getRole()
            );
        }

        Permission permission =
                permissionRepository.findById(
                        request.getPermissionId()
                ).orElseThrow(() ->
                        new UserNotFoundException(
                                "Permission with id "
                                        + request.getPermissionId()
                                        + " not found"
                        )
                );

        RolePermission rolePermission =
                RolePermission.builder()
                        .role(request.getRole())
                        .permission(permission)
                        .build();

        RolePermission saved =
                rolePermissionRepository.save(rolePermission);

        return mapToResponse(saved);
    }

    @Override
    public void removePermission(
            Role role,
            Long permissionId
    ) {

        RolePermission rolePermission =
                rolePermissionRepository
                        .findByRoleAndPermissionId(
                                role,
                                permissionId
                        )
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "Permission with id "
                                                + permissionId
                                                + " is not assigned to role "
                                                + role
                                )
                        );

        rolePermissionRepository.delete(rolePermission);
    }

    private RolePermissionResponse mapToResponse(
            RolePermission rolePermission
    ) {

        Permission permission =
                rolePermission.getPermission();

        return RolePermissionResponse.builder()
                .id(rolePermission.getId())
                .role(rolePermission.getRole())
                .permissionId(permission.getId())
                .permissionName(permission.getName())
                .permissionDescription(
                        permission.getDescription()
                )
                .build();
    }
}