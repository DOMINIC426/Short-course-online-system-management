package com.scms.service.admin;

import com.scms.dto.admin.AuditLogResponse;

import java.util.List;

public interface AdminAuditLogService {

    List<AuditLogResponse> getAllAuditLogs();

    AuditLogResponse getAuditLogById(Long id);

    List<AuditLogResponse> getAuditLogsByUser(Long userId);

    List<AuditLogResponse> getAuditLogsByEntity(String entity);

    List<AuditLogResponse> getAuditLogsByAction(String action);

    List<AuditLogResponse> getAuditLogsByEntityAndId(
            String entity,
            Long entityId
    );
}