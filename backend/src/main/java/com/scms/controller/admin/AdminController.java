package com.scms.controller.admin;

import com.scms.dto.admin.AssignRoleRequest;
import com.scms.dto.admin.CreateUserRequest;
import com.scms.dto.admin.ResetPasswordRequest;
import com.scms.dto.admin.RolePermissionRequest;
import com.scms.dto.admin.RolePermissionResponse;
import com.scms.dto.admin.RoleResponse;
import com.scms.dto.admin.StudentResponse;
import com.scms.dto.admin.UpdatePermissionRequest;
import com.scms.dto.admin.UpdateUserRequest;
import com.scms.dto.admin.UserResponse;
import com.scms.dto.admin.PermissionRequest;
import com.scms.dto.admin.PermissionResponse;
import com.scms.entity.enums.Role;
import com.scms.entity.enums.UserStatus;
import com.scms.service.admin.AdminPermissionService;
import com.scms.service.admin.AdminRolePermissionService;
import com.scms.service.admin.AdminRoleService;
import com.scms.service.admin.AdminService;
import com.scms.service.admin.AdminStudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.scms.dto.admin.SystemSettingRequest;
import com.scms.dto.admin.SystemSettingResponse;
import com.scms.dto.admin.UpdateSystemSettingRequest;
import com.scms.service.admin.AdminSystemSettingService;
import com.scms.dto.admin.AuditLogResponse;
import com.scms.service.admin.AdminAuditLogService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(
        name = "Admin Management",
        description = "Administrative operations for managing users, students, roles, permissions and role-based access control"
)
public class AdminController {

    private final AdminService adminService;
    private final AdminStudentService adminStudentService;
    private final AdminRoleService adminRoleService;
    private final AdminPermissionService adminPermissionService;
    private final AdminRolePermissionService adminRolePermissionService;
    private final AdminSystemSettingService adminSystemSettingService;
    private final AdminAuditLogService adminAuditLogService;


    // ============================================================
    // USER MANAGEMENT
    // ============================================================

    @Operation(
            summary = "Create a new user",
            description = "Allows an administrator to create a new system user with a specified role."
    )
    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(adminService.createUser(request));
    }


    @Operation(
            summary = "View all users",
            description = "Retrieves a list of all users registered in the system."
    )
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                adminService.getAllUsers()
        );
    }


    @Operation(
            summary = "View a specific user",
            description = "Retrieves detailed information about a specific user using the user's ID."
    )
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @Parameter(
                    description = "Unique ID of the user",
                    example = "1"
            )
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminService.getUserById(id)
        );
    }


    @Operation(
            summary = "Update user information",
            description = "Allows an administrator to update a user's personal information and assigned role."
    )
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @Parameter(
                    description = "Unique ID of the user to update",
                    example = "1"
            )
            @PathVariable Long id,

            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(
                adminService.updateUser(id, request)
        );
    }


    @Operation(
            summary = "Activate a user",
            description = "Changes the user's status to ACTIVE, allowing the user to access the system."
    )
    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(
            @Parameter(
                    description = "Unique ID of the user to activate",
                    example = "1"
            )
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminService.activateUser(id)
        );
    }


    @Operation(
            summary = "Deactivate a user",
            description = "Changes the user's status to INACTIVE, preventing the user from accessing the system."
    )
    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(
            @Parameter(
                    description = "Unique ID of the user to deactivate",
                    example = "1"
            )
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminService.deactivateUser(id)
        );
    }


    @Operation(
            summary = "Reset user password",
            description = "Allows an administrator to reset the password of an existing user."
    )
    @PatchMapping("/users/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @Parameter(
                    description = "Unique ID of the user whose password will be reset",
                    example = "1"
            )
            @PathVariable Long id,

            @Valid @RequestBody ResetPasswordRequest request
    ) {
        adminService.resetPassword(id, request);

        return ResponseEntity.noContent().build();
    }


    // ============================================================
    // STUDENT MANAGEMENT
    // ============================================================

    @Operation(
            summary = "View all students",
            description = "Retrieves all students registered in the Short Course Management System. Optional search and status filters can be used."
    )
    @GetMapping("/students")
    public ResponseEntity<List<StudentResponse>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserStatus status
    ) {

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(
                    adminStudentService.searchStudents(search)
            );
        }

        if (status != null) {
            return ResponseEntity.ok(
                    adminStudentService.getStudentsByStatus(status)
            );
        }

        return ResponseEntity.ok(
                adminStudentService.getAllStudents()
        );
    }


    @Operation(
            summary = "View a specific student",
            description = "Retrieves detailed information about a specific student using the student's ID."
    )
    @GetMapping("/students/{id}")
    public ResponseEntity<StudentResponse> getStudentById(
            @Parameter(
                    description = "Unique ID of the student",
                    example = "1"
            )
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminStudentService.getStudentById(id)
        );
    }


    @Operation(
            summary = "Activate a student",
            description = "Changes the linked user's status to ACTIVE, allowing the student to access the system."
    )
    @PatchMapping("/students/{id}/activate")
    public ResponseEntity<StudentResponse> activateStudent(
            @Parameter(
                    description = "Unique ID of the student to activate",
                    example = "1"
            )
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminStudentService.activateStudent(id)
        );
    }


    @Operation(
            summary = "Deactivate a student",
            description = "Changes the linked user's status to INACTIVE, preventing the student from accessing the system."
    )
    @PatchMapping("/students/{id}/deactivate")
    public ResponseEntity<StudentResponse> deactivateStudent(
            @Parameter(
                    description = "Unique ID of the student to deactivate",
                    example = "1"
            )
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminStudentService.deactivateStudent(id)
        );
    }


    // ============================================================
    // ROLE MANAGEMENT
    // ============================================================

    @Operation(
            summary = "View all system roles",
            description = "Retrieves all roles currently available in the system. Roles are defined by the system Role enum."
    )
    @GetMapping("/roles")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {

        return ResponseEntity.ok(
                adminRoleService.getAllRoles()
        );
    }


    @Operation(
            summary = "View a specific system role",
            description = "Retrieves information about a specific role, including its name and description."
    )
    @GetMapping("/roles/{role}")
    public ResponseEntity<RoleResponse> getRole(
            @Parameter(
                    description = "System role to retrieve",
                    example = "ADMIN"
            )
            @PathVariable Role role
    ) {
        return ResponseEntity.ok(
                adminRoleService.getRole(role)
        );
    }


    @Operation(
            summary = "Assign a role to a user",
            description = "Allows an administrator to assign or change the role of an existing user."
    )
    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> assignRole(
            @Parameter(
                    description = "Unique ID of the user whose role will be changed",
                    example = "5"
            )
            @PathVariable Long id,

            @Valid @RequestBody AssignRoleRequest request
    ) {
        return ResponseEntity.ok(
                adminService.assignRole(id, request)
        );
    }


    // ============================================================
    // PERMISSION MANAGEMENT
    // ============================================================

    @Operation(
            summary = "Create a new permission",
            description = "Allows an administrator to create a new system permission that can later be assigned to roles."
    )
    @PostMapping("/permissions")
    public ResponseEntity<PermissionResponse> createPermission(
            @Valid @RequestBody PermissionRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(adminPermissionService.createPermission(request));
    }


    @Operation(
            summary = "View all permissions",
            description = "Retrieves all permissions currently defined in the system."
    )
    @GetMapping("/permissions")
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {

        return ResponseEntity.ok(
                adminPermissionService.getAllPermissions()
        );
    }


    @Operation(
            summary = "View a specific permission",
            description = "Retrieves detailed information about a specific permission using its ID."
    )
    @GetMapping("/permissions/{id}")
    public ResponseEntity<PermissionResponse> getPermissionById(
            @Parameter(
                    description = "Unique ID of the permission",
                    example = "1"
            )
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminPermissionService.getPermissionById(id)
        );
    }


    @Operation(
            summary = "Update a permission",
            description = "Allows an administrator to update the name and description of an existing permission."
    )
    @PutMapping("/permissions/{id}")
    public ResponseEntity<PermissionResponse> updatePermission(
            @Parameter(
                    description = "Unique ID of the permission to update",
                    example = "1"
            )
            @PathVariable Long id,

            @Valid @RequestBody UpdatePermissionRequest request
    ) {
        return ResponseEntity.ok(
                adminPermissionService.updatePermission(id, request)
        );
    }


    @Operation(
            summary = "Delete a permission",
            description = "Deletes an existing permission from the system."
    )
    @DeleteMapping("/permissions/{id}")
    public ResponseEntity<Void> deletePermission(
            @Parameter(
                    description = "Unique ID of the permission to delete",
                    example = "1"
            )
            @PathVariable Long id
    ) {
        adminPermissionService.deletePermission(id);

        return ResponseEntity.noContent().build();
    }


    // ============================================================
    // ROLE-PERMISSION / RBAC MANAGEMENT
    // ============================================================

    @Operation(
            summary = "View permissions assigned to a role",
            description = "Retrieves all permissions currently assigned to the specified system role."
    )
    @GetMapping("/roles/{role}/permissions")
    public ResponseEntity<List<RolePermissionResponse>> getPermissionsByRole(
            @Parameter(
                    description = "System role whose permissions should be retrieved",
                    example = "ADMIN"
            )
            @PathVariable Role role
    ) {
        return ResponseEntity.ok(
                adminRolePermissionService.getPermissionsByRole(role)
        );
    }


    @Operation(
            summary = "Assign a permission to a role",
            description = "Allows an administrator to assign an existing permission to a system role."
    )
    @PostMapping("/roles/permissions")
    public ResponseEntity<RolePermissionResponse> assignPermissionToRole(
            @Valid @RequestBody RolePermissionRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(adminRolePermissionService.assignPermission(request));
    }


    @Operation(
            summary = "Remove a permission from a role",
            description = "Removes a specific permission assignment from the specified system role."
    )
    @DeleteMapping("/roles/{role}/permissions/{permissionId}")
    public ResponseEntity<Void> removePermissionFromRole(
            @Parameter(
                    description = "System role from which the permission should be removed",
                    example = "ADMIN"
            )
            @PathVariable Role role,

            @Parameter(
                    description = "Unique ID of the permission to remove",
                    example = "1"
            )
            @PathVariable Long permissionId
    ) {
        adminRolePermissionService.removePermission(
                role,
                permissionId
        );

        return ResponseEntity.noContent().build();
    }
    // ============================================================
// SYSTEM SETTINGS
// ============================================================

@Operation(
        summary = "Create a system setting",
        description = "Allows an administrator to create a new system setting using a unique setting key, value, and description."
)
@PostMapping("/settings")
public ResponseEntity<SystemSettingResponse> createSetting(
        @Valid @RequestBody SystemSettingRequest request
) {
    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(adminSystemSettingService.createSetting(request));
}


@Operation(
        summary = "View all system settings",
        description = "Retrieves all system settings configured in the Short Course Management System."
)
@GetMapping("/settings")
public ResponseEntity<List<SystemSettingResponse>> getAllSettings() {

    return ResponseEntity.ok(
            adminSystemSettingService.getAllSettings()
    );
}


@Operation(
        summary = "View a specific system setting",
        description = "Retrieves a system setting using its unique ID."
)
@GetMapping("/settings/{id}")
public ResponseEntity<SystemSettingResponse> getSettingById(
        @Parameter(
                description = "Unique ID of the system setting",
                example = "1"
        )
        @PathVariable Long id
) {
    return ResponseEntity.ok(
            adminSystemSettingService.getSettingById(id)
    );
}


@Operation(
        summary = "View a system setting by key",
        description = "Retrieves a system setting using its unique setting key."
)
@GetMapping("/settings/key/{settingKey}")
public ResponseEntity<SystemSettingResponse> getSettingByKey(
        @Parameter(
                description = "Unique key of the system setting",
                example = "SYSTEM_NAME"
        )
        @PathVariable String settingKey
) {
    return ResponseEntity.ok(
            adminSystemSettingService.getSettingByKey(settingKey)
    );
}


@Operation(
        summary = "Update a system setting",
        description = "Allows an administrator to update the value and description of an existing system setting. The setting key cannot be changed."
)
@PutMapping("/settings/{id}")
public ResponseEntity<SystemSettingResponse> updateSetting(
        @Parameter(
                description = "Unique ID of the system setting to update",
                example = "1"
        )
        @PathVariable Long id,

        @Valid @RequestBody UpdateSystemSettingRequest request
) {
    return ResponseEntity.ok(
            adminSystemSettingService.updateSetting(id, request)
    );
}


@Operation(
        summary = "Delete a system setting",
        description = "Deletes an existing system setting from the system using its unique ID."
)
@DeleteMapping("/settings/{id}")
public ResponseEntity<Void> deleteSetting(
        @Parameter(
                description = "Unique ID of the system setting to delete",
                example = "1"
        )
        @PathVariable Long id
) {
    adminSystemSettingService.deleteSetting(id);

    return ResponseEntity.noContent().build();
}
// ============================================================
// AUDIT LOGS
// ============================================================

@Operation(
        summary = "View all audit logs",
        description = "Retrieves all system audit logs ordered from the most recent activity to the oldest activity."
)
@GetMapping("/audit-logs")
public ResponseEntity<List<AuditLogResponse>> getAllAuditLogs() {

    return ResponseEntity.ok(
            adminAuditLogService.getAllAuditLogs()
    );
}


@Operation(
        summary = "View a specific audit log",
        description = "Retrieves a specific audit log using its unique ID."
)
@GetMapping("/audit-logs/{id}")
public ResponseEntity<AuditLogResponse> getAuditLogById(
        @Parameter(
                description = "Unique ID of the audit log",
                example = "1"
        )
        @PathVariable Long id
) {

    return ResponseEntity.ok(
            adminAuditLogService.getAuditLogById(id)
    );
}


@Operation(
        summary = "View audit logs by user",
        description = "Retrieves all audit activities performed by a specific user."
)
@GetMapping("/audit-logs/user/{userId}")
public ResponseEntity<List<AuditLogResponse>> getAuditLogsByUser(
        @Parameter(
                description = "ID of the user whose activities should be retrieved",
                example = "5"
        )
        @PathVariable Long userId
) {

    return ResponseEntity.ok(
            adminAuditLogService.getAuditLogsByUser(userId)
    );
}


@Operation(
        summary = "View audit logs by entity",
        description = "Retrieves audit logs associated with a specific entity, such as USER, STUDENT, or SYSTEM_SETTING."
)
@GetMapping("/audit-logs/entity/{entity}")
public ResponseEntity<List<AuditLogResponse>> getAuditLogsByEntity(
        @Parameter(
                description = "Name of the entity",
                example = "USER"
        )
        @PathVariable String entity
) {

    return ResponseEntity.ok(
            adminAuditLogService.getAuditLogsByEntity(entity)
    );
}


@Operation(
        summary = "View audit logs by action",
        description = "Retrieves audit logs associated with a specific action, such as CREATE, UPDATE, DELETE, ACTIVATE, or DEACTIVATE."
)
@GetMapping("/audit-logs/action/{action}")
public ResponseEntity<List<AuditLogResponse>> getAuditLogsByAction(
        @Parameter(
                description = "Action performed in the system",
                example = "UPDATE"
        )
        @PathVariable String action
) {

    return ResponseEntity.ok(
            adminAuditLogService.getAuditLogsByAction(action)
    );
}


@Operation(
        summary = "View entity history",
        description = "Retrieves the complete audit history of a specific entity record."
)
@GetMapping("/audit-logs/entity/{entity}/{entityId}")
public ResponseEntity<List<AuditLogResponse>> getEntityHistory(
        @Parameter(
                description = "Name of the entity",
                example = "USER"
        )
        @PathVariable String entity,

        @Parameter(
                description = "ID of the entity record",
                example = "10"
        )
        @PathVariable Long entityId
) {

    return ResponseEntity.ok(
            adminAuditLogService.getAuditLogsByEntityAndId(
                    entity,
                    entityId
            )
    );
}
}