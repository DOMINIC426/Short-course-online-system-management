package com.scms.service.admin;

import com.scms.entity.AuditLog;
import com.scms.entity.Users;
import com.scms.repository.UserRepository;
import com.scms.repository.admin.AuditLogRepository;
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

    /**
     * Logs an action performed by the currently authenticated user.
     *
     * This method automatically obtains the current user from
     * Spring Security's SecurityContext.
     *
     * Example:
     *
     * auditLogService.log(
     *     "CREATE",
     *     "COURSE",
     *     course.getId(),
     *     null,
     *     course.toString()
     * );
     */
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
                .timestamp(java.time.LocalDateTime.now())
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * Logs an action without old/new values.
     *
     * Useful for actions such as:
     *
     * - LOGIN
     * - LOGOUT
     * - CREATE
     * - DELETE
     * - APPROVE
     * - REJECT
     */
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

    /**
     * Logs an action using an explicitly provided user.
     *
     * This method preserves the functionality from the original
     * AuditLogService where the caller can provide the Users object.
     *
     * Useful when:
     *
     * - The action is performed on behalf of another user.
     * - The authenticated user has already been resolved.
     * - The operation is executed outside the normal security context.
     */
    @Transactional
    public void logAction(
            String action,
            String entity,
            Long entityId,
            String oldValue,
            String newValue,
            Users user
    ) {

        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .user(user)
                .timestamp(java.time.LocalDateTime.now())
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * Convenience method for explicitly provided user
     * without old/new values.
     */
    @Transactional
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
     * Returns the currently authenticated user.
     *
     * The JWT authentication filter is expected to place the
     * authenticated user's identity into Spring Security's
     * SecurityContext.
     *
     * The authentication name is expected to be the user's email.
     */
    private Users getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        /*
         * No authenticated user.
         */
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

        /*
         * The JWT authentication should provide the user's
         * email as authentication.getName().
         */
        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            return null;
        }

        /*
         * Resolve the authenticated user from the database.
         */
        return userRepository.findByEmail(email)
                .orElse(null);
    }
}

