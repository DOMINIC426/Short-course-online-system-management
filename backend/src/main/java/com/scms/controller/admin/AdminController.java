package com.scms.controller.admin;

import com.scms.dto.admin.AssignRoleRequest;
import com.scms.dto.admin.CreateUserRequest;
import com.scms.dto.admin.ResetPasswordRequest;
import com.scms.dto.admin.RoleResponse;
import com.scms.dto.admin.StudentResponse;
import com.scms.dto.admin.UpdateUserRequest;
import com.scms.dto.admin.UserResponse;
import com.scms.entity.enums.Role;
import com.scms.entity.enums.UserStatus;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(
        name = "Admin Management",
        description = "Administrative operations for managing users, students and system roles"
)
public class AdminController {

    private final AdminService adminService;
    private final AdminStudentService adminStudentService;
    private final AdminRoleService adminRoleService;


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
}