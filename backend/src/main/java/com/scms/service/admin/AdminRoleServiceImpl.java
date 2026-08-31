package com.scms.service.admin;

import com.scms.dto.admin.RoleResponse;
import com.scms.entity.enums.Role;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class AdminRoleServiceImpl implements AdminRoleService {

    @Override
    public List<RoleResponse> getAllRoles() {

        return Arrays.stream(Role.values())
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public RoleResponse getRole(Role role) {

        return mapToResponse(role);
    }

    private RoleResponse mapToResponse(Role role) {

        return RoleResponse.builder()
                .role(role)
                .name(getRoleName(role))
                .description(getRoleDescription(role))
                .build();
    }

    private String getRoleName(Role role) {

        return switch (role) {

            case ADMIN ->
                    "Administrator";

            case COORDINATOR ->
                    "Course Coordinator";

            case INSTRUCTOR ->
                    "Instructor";

            case STUDENT ->
                    "Student";

            case MARKETING_OFFICER ->
                    "Marketing Officer";
        };
    }

    private String getRoleDescription(Role role) {

        return switch (role) {

            case ADMIN ->
                    "Responsible for system administration, user management, security, settings and other administrative operations.";

            case COORDINATOR ->
                    "Responsible for coordinating short courses, intakes and related academic activities.";

            case INSTRUCTOR ->
                    "Responsible for teaching and managing assigned course-related activities.";

            case STUDENT ->
                    "Represents a registered student who accesses courses and student-related services.";

            case MARKETING_OFFICER ->
                    "Responsible for marketing and promoting short courses and related activities.";
        };
    }
}