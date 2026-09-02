package com.scms.service.admin;

import com.scms.entity.AuditLog;
import com.scms.entity.Users;
import com.scms.repository.UserRepository;
import com.scms.repository.admin.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Logs an action performed by the currently authenticated user.
     *
     * REQUIRES_NEW is intentionally used because audit logging
     * is a WRITE operation.
     *
     * This ensures that the audit INSERT gets its own writable
     * transaction even when the calling service is using:
     *
     * @Transactional(readOnly = true)
     */
    @Transactional(readOnly = false)
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
                .timestamp(LocalDateTime.now())
                .build();

        if (currentUser != null && currentUser.getId() != null) {
            auditLogRepository.save(auditLog);
        }
    }

    /**
     * Logs an action without old/new values.
     */
    @Transactional(readOnly = false)
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

    /**
     * Logs an action using an explicitly provided user.
     */
    @Transactional(readOnly = false)
    public void logAction(
            String action,
            String entity,
            Long entityId,
            String oldValue,
            String newValue,
            Users user
    ) {

        if (user == null || user.getId() == null) {
            return;
        }

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * Convenience method for explicitly provided user.
     */
    @Transactional(readOnly = false)
    public void logAction(
            String action,
            String entity,
            Long entityId,
            Users user
    ) {

        logAction(
                action,
                entity,
                entityId,
                null,
                null,
                user
        );
    }

    /**
     * Gets the currently authenticated user from Spring Security.
     */
    private Users getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return null;
        }

        /*
         * Ignore anonymous authentication.
         */
        if ("anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            return null;
        }

        return userRepository.findByEmail(email)
                .orElse(null);
    }
}
