package com.scms.service;

import com.scms.config.LoginSecurityProperties;
import com.scms.entity.LoginAttempt;
import com.scms.entity.Users;
import com.scms.repository.LoginAttemptRepository;
import com.scms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class LoginSecurityServiceTest {

    private static final LoginSecurityService.LoginRequestMetadata METADATA =
            new LoginSecurityService.LoginRequestMetadata("127.0.0.1", "JUnit");

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoginAttemptRepository loginAttemptRepository;

    private LoginSecurityService service;

    @BeforeEach
    void setUp() {
        LoginSecurityProperties properties = new LoginSecurityProperties();
        properties.setMaxFailedAttempts(5);
        properties.setLockDurationMinutes(5);
        service = new LoginSecurityService(userRepository, loginAttemptRepository, properties);
    }

    @Test
    void successfulLoginResetsFailureStateAndRecordsSuccess() {
        Users user = userWithFailures(4);
        user.setLockedUntil(LocalDateTime.now().plusMinutes(1));

        service.recordSuccessfulLogin(user, METADATA, LocalDateTime.now());

        assertTrue(user.getFailedLoginAttempts() == 0);
        assertNull(user.getLockedUntil());
        ArgumentCaptor<LoginAttempt> attempt = ArgumentCaptor.forClass(LoginAttempt.class);
        verify(loginAttemptRepository).save(attempt.capture());
        assertTrue(attempt.getValue().isSuccess());
        assertTrue(attempt.getValue().getUser() == user);
    }

    @Test
    void failedLoginIncrementsCounterAndRecordsFailure() {
        Users user = userWithFailures(0);

        service.recordFailedLogin(user, METADATA, LocalDateTime.now());

        assertTrue(user.getFailedLoginAttempts() == 1);
        assertNull(user.getLockedUntil());
        ArgumentCaptor<LoginAttempt> attempt = ArgumentCaptor.forClass(LoginAttempt.class);
        verify(loginAttemptRepository).save(attempt.capture());
        assertFalse(attempt.getValue().isSuccess());
    }

    @Test
    void fifthFailedLoginSetsFiveMinuteLock() {
        Users user = userWithFailures(0);
        LocalDateTime now = LocalDateTime.of(2026, 9, 8, 10, 0);

        for (int index = 0; index < 5; index++) {
            service.recordFailedLogin(user, METADATA, now);
        }

        assertTrue(user.getFailedLoginAttempts() == 5);
        assertTrue(now.plusMinutes(5).equals(user.getLockedUntil()));
        verify(loginAttemptRepository, times(5)).save(org.mockito.ArgumentMatchers.any(LoginAttempt.class));
    }

    @Test
    void activeLockIsDetectedWithoutChangingItsExpiry() {
        Users user = userWithFailures(5);
        LocalDateTime now = LocalDateTime.now();
        user.setLockedUntil(now.plusMinutes(5));

        assertTrue(service.isLocked(user, now));
        assertFalse(service.expireLockIfNeeded(user, now));
    }

    @Test
    void expiredLockIsClearedLazily() {
        Users user = userWithFailures(5);
        LocalDateTime now = LocalDateTime.now();
        user.setLockedUntil(now.minusSeconds(1));

        assertTrue(service.expireLockIfNeeded(user, now));
        assertTrue(user.getFailedLoginAttempts() == 0);
        assertNull(user.getLockedUntil());
    }

    @Test
    void unknownUserAttemptHasNoForeignKeyReference() {
        service.recordUnknownUserLogin(METADATA, LocalDateTime.now());

        ArgumentCaptor<LoginAttempt> attempt = ArgumentCaptor.forClass(LoginAttempt.class);
        verify(loginAttemptRepository).save(attempt.capture());
        assertNull(attempt.getValue().getUser());
        assertFalse(attempt.getValue().isSuccess());
    }

    @Test
    void metadataTruncatesOversizedUserAgent() {
        String oversizedUserAgent = "x".repeat(513);

        LoginSecurityService.LoginRequestMetadata metadata =
                LoginSecurityService.LoginRequestMetadata.of("127.0.0.1", oversizedUserAgent);

        assertTrue(metadata.userAgent().length() == 512);
    }

    private Users userWithFailures(int failedAttempts) {
        Users user = new Users();
        user.setFailedLoginAttempts(failedAttempts);
        return user;
    }
}
