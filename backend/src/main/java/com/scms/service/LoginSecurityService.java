package com.scms.service;

import com.scms.config.LoginSecurityProperties;
import com.scms.entity.LoginAttempt;
import com.scms.entity.Users;
import com.scms.repository.LoginAttemptRepository;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginSecurityService {

    private final UserRepository userRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final LoginSecurityProperties properties;

    public Optional<Users> findUserForLogin(String email) {
        return userRepository.findByEmailForUpdate(email);
    }

    public boolean expireLockIfNeeded(Users user, LocalDateTime now) {
        LocalDateTime lockedUntil = user.getLockedUntil();
        if (lockedUntil != null && !lockedUntil.isAfter(now)) {
            user.setLockedUntil(null);
            user.setFailedLoginAttempts(0);
            return true;
        }
        return false;
    }

    public boolean isLocked(Users user, LocalDateTime now) {
        return user.getLockedUntil() != null && user.getLockedUntil().isAfter(now);
    }

    public void recordSuccessfulLogin(Users user, LoginRequestMetadata metadata, LocalDateTime now) {
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        recordAttempt(user, metadata, true, now);
    }

    public void recordFailedLogin(Users user, LoginRequestMetadata metadata, LocalDateTime now) {
        int failedAttempts = user.getFailedLoginAttempts() == null
                ? 1
                : user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(failedAttempts);

        if (failedAttempts >= properties.getMaxFailedAttempts()) {
            user.setLockedUntil(now.plusMinutes(properties.getLockDurationMinutes()));
        }
        recordAttempt(user, metadata, false, now);
    }

    public void recordRejectedLogin(Users user, LoginRequestMetadata metadata, LocalDateTime now) {
        recordAttempt(user, metadata, false, now);
    }

    public void recordUnknownUserLogin(LoginRequestMetadata metadata, LocalDateTime now) {
        recordAttempt(null, metadata, false, now);
    }

    public void recordRateLimitedLogin(LoginRequestMetadata metadata, LocalDateTime now) {
        try {
            recordAttempt(null, metadata, false, now);
        } catch (RuntimeException exception) {
            log.warn("Unable to persist a rate-limited login attempt", exception);
        }
    }

    private void recordAttempt(Users user, LoginRequestMetadata metadata, boolean success, LocalDateTime now) {
        loginAttemptRepository.save(LoginAttempt.builder()
                .user(user)
                .ipAddress(metadata.ipAddress())
                .userAgent(metadata.userAgent())
                .success(success)
                .attemptTime(now)
                .build());
    }

    public record LoginRequestMetadata(String ipAddress, String userAgent) {

        public static LoginRequestMetadata of(String ipAddress, String userAgent) {
            String normalizedUserAgent = userAgent == null ? null : userAgent.substring(0, Math.min(userAgent.length(), 512));
            return new LoginRequestMetadata(ipAddress, normalizedUserAgent);
        }
    }
}
