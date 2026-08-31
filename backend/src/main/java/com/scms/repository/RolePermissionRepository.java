package com.scms.repository;

import com.scms.entity.RolePermission;
import com.scms.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionRepository
        extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findAllByRole(Role role);

    Optional<RolePermission> findByRoleAndPermissionId(
            Role role,
            Long permissionId
    );

    boolean existsByRoleAndPermissionId(
            Role role,
            Long permissionId
    );

    void deleteByRoleAndPermissionId(
            Role role,
            Long permissionId
    );
}