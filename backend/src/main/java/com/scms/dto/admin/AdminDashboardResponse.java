package com.scms.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long totalUsers;

    private long activeUsers;

    private long inactiveUsers;

    private long suspendedUsers;

    private long totalStudents;

    private long totalAdmins;

    private long totalCoordinators;

    private long totalInstructors;

    private long totalMarketingOfficers;

    private long totalSystemSettings;

    private List<AuditLogResponse> recentAuditLogs;
}