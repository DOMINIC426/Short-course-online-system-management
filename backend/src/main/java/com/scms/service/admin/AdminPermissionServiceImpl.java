package com.scms.service.admin;

import com.scms.dto.admin.PermissionRequest;
import com.scms.dto.admin.PermissionResponse;
import com.scms.dto.admin.UpdatePermissionRequest;
import com.scms.entity.Permission;
import com.scms.exception.UserNotFoundException;
import com.scms.repository.admin.PermissionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminPermissionServiceImpl
        implements AdminPermissionService {

    private final PermissionRepository permissionRepository;

    @Override
    public PermissionResponse createPermission(
            PermissionRequest request
    ) {

        if (permissionRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException(
                    "Permission with name '"
                            + request.getName()
                            + "' already exists"
            );
        }

        Permission permission = Permission.builder()
                .name(request.getName().trim().toUpperCase())
                .description(request.getDescription())
                .build();

        Permission savedPermission =
                permissionRepository.save(permission);

        return mapToResponse(savedPermission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {

        return permissionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PermissionResponse getPermissionById(Long id) {

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Permission with id "
                                        + id
                                        + " not found"
                        )
                );

        return mapToResponse(permission);
    }

    @Override
    public PermissionResponse updatePermission(
            Long id,
            UpdatePermissionRequest request
    ) {

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Permission with id "
                                        + id
                                        + " not found"
                        )
                );

        if (permissionRepository.existsByNameIgnoreCase(
                request.getName()
        )) {

            Permission existingPermission =
                    permissionRepository
                            .findByNameIgnoreCase(request.getName())
                            .orElse(null);

            if (existingPermission != null
                    && !existingPermission.getId().equals(id)) {

                throw new IllegalArgumentException(
                        "Permission with name '"
                                + request.getName()
                                + "' already exists"
                );
            }
        }

        permission.setName(
                request.getName().trim().toUpperCase()
        );

        permission.setDescription(
                request.getDescription()
        );

        Permission updatedPermission =
                permissionRepository.save(permission);

        return mapToResponse(updatedPermission);
    }

    @Override
    public void deletePermission(Long id) {

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Permission with id "
                                        + id
                                        + " not found"
                        )
                );

        permissionRepository.delete(permission);
    }

    private PermissionResponse mapToResponse(
            Permission permission
    ) {

        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .build();
    }
}