package com.scms.service.admin;

import com.scms.dto.admin.AuditLogResponse;
import com.scms.entity.AuditLog;
import com.scms.exception.UserNotFoundException;
import com.scms.repository.admin.AuditLogRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAuditLogServiceImpl implements AdminAuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public List<AuditLogResponse> getAllAuditLogs() {

        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AuditLogResponse getAuditLogById(Long id) {

        AuditLog auditLog = findAuditLog(id);

        return mapToResponse(auditLog);
    }

    @Override
    public List<AuditLogResponse> getAuditLogsByUser(Long userId) {

        return auditLogRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AuditLogResponse> getAuditLogsByEntity(String entity) {

        return auditLogRepository
                .findByEntityOrderByCreatedAtDesc(entity)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AuditLogResponse> getAuditLogsByAction(String action) {

        return auditLogRepository
                .findByActionOrderByCreatedAtDesc(action)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AuditLogResponse> getAuditLogsByEntityAndId(
            String entity,
            Long entityId
    ) {

        return auditLogRepository
                .findByEntityAndEntityIdOrderByCreatedAtDesc(
                        entity,
                        entityId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AuditLog findAuditLog(Long id) {

        return auditLogRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Audit log not found with id: " + id
                        )
                );
    }

    private AuditLogResponse mapToResponse(AuditLog auditLog) {

        String userName = null;

        if (auditLog.getUser() != null) {
            userName = auditLog.getUser().getFirstName()
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