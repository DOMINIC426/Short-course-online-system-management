package com.scms.service.admin;

import com.scms.entity.AuditLog;
import com.scms.entity.Users;
import com.scms.repository.AuditLogRepository;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(
            String action,
            String entity,
            Long entityId,
            String oldValue,
            String newValue
    ) {

        Users currentUser = getCurrentUser();

        AuditLog auditLog = AuditLog.builder()
                .user(currentUser)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();

        auditLogRepository.save(auditLog);
    }

    @Transactional
    public void log(
            String action,
            String entity,
            Long entityId
    ) {

        log(
                action,
                entity,
                entityId,
                null,
                null
        );
    }

    private Users getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return null;
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElse(null);
    }
}