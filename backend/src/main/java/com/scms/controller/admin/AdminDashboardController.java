package com.scms.controller.admin;

import com.scms.dto.admin.AdminDashboardResponse;
import com.scms.service.admin.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@Tag(
        name = "Admin Dashboard",
        description = "Administrative dashboard and system overview APIs"
)
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @Operation(
            summary = "Get admin dashboard",
            description = """
                    Retrieves an overview of the Short Course Management System
                    for administrators.

                    The dashboard includes:
                    - Total number of users
                    - Active users
                    - Inactive users
                    - Suspended users
                    - Total students
                    - Total administrators
                    - Total coordinators
                    - Total instructors
                    - Total marketing officers
                    - Total system settings
                    - The 10 most recent audit log activities
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Admin dashboard retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Access denied"
            )
    })
    @GetMapping
    public ResponseEntity<AdminDashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                adminDashboardService.getDashboard()
        );
    }
}