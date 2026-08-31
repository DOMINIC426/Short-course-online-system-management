package com.scms.service.admin;

import com.scms.dto.admin.AdminDashboardResponse;
import com.scms.dto.admin.AuditLogResponse;
import com.scms.entity.AuditLog;
import com.scms.entity.enums.Role;
import com.scms.entity.enums.UserStatus;
import com.scms.repository.UserRepository;
import com.scms.repository.admin.AuditLogRepository;
import com.scms.repository.admin.SystemSettingRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public AdminDashboardResponse getDashboard() {

        long totalUsers = userRepository.count();

        long activeUsers =
                userRepository.countByStatus(UserStatus.ACTIVE);

        long inactiveUsers =
                userRepository.countByStatus(UserStatus.INACTIVE);

        long suspendedUsers =
                userRepository.countByStatus(UserStatus.SUSPENDED);

        long totalStudents =
                userRepository.countByRole(Role.STUDENT);

        long totalAdmins =
                userRepository.countByRole(Role.ADMIN);

        long totalCoordinators =
                userRepository.countByRole(Role.COORDINATOR);

        long totalInstructors =
                userRepository.countByRole(Role.INSTRUCTOR);

        long totalMarketingOfficers =
                userRepository.countByRole(Role.MARKETING_OFFICER);

        long totalSystemSettings =
                systemSettingRepository.count();

        List<AuditLogResponse> recentAuditLogs =
                auditLogRepository
                        .findAllByOrderByCreatedAtDesc()
                        .stream()
                        .limit(10)
                        .map(this::mapAuditLog)
                        .toList();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .suspendedUsers(suspendedUsers)
                .totalStudents(totalStudents)
                .totalAdmins(totalAdmins)
                .totalCoordinators(totalCoordinators)
                .totalInstructors(totalInstructors)
                .totalMarketingOfficers(totalMarketingOfficers)
                .totalSystemSettings(totalSystemSettings)
                .recentAuditLogs(recentAuditLogs)
                .build();
    }

    private AuditLogResponse mapAuditLog(AuditLog auditLog) {

        String userName = null;

        if (auditLog.getUser() != null) {
            userName =
                    auditLog.getUser().getFirstName()
                            + " "
                            + auditLog.getUser().getLastName();
        }

        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .userId(
                        auditLog.getUser() != null
                                ? auditLog.getUser().getId()
                                : null
                )
                .userName(userName)
                .action(auditLog.getAction())
                .entity(auditLog.getEntity())
                .entityId(auditLog.getEntityId())
                .oldValue(auditLog.getOldValue())
                .newValue(auditLog.getNewValue())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}