package com.scms.service;

import com.scms.dto.LoginRequest;
import com.scms.dto.LoginResponse;
import com.scms.entity.Users;
import com.scms.entity.enums.Role;
import com.scms.entity.enums.UserStatus;
import com.scms.exception.LoginAccountLockedException;
import com.scms.jwt.JwtService;
import com.scms.repository.UserRepository;
import com.scms.service.admin.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceLoginTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuditLogService auditLogService;
    @Mock private AccountLoginRateLimiter accountLoginRateLimiter;
    @Mock private LoginSecurityService loginSecurityService;
    @Mock private AuthenticationManager authenticationManager;

    @Test
    void successfulLoginUsesAuthenticationManagerAndPreservesResponse() {
        Users user = activeUser();
        LoginSecurityService.LoginRequestMetadata metadata = metadata();
        AuthService service = service();
        when(loginSecurityService.findUserForLogin("USER@example.com")).thenReturn(Optional.of(user));
        when(accountLoginRateLimiter.isAllowed("USER@example.com")).thenReturn(true);
        when(loginSecurityService.isLocked(eq(user), any(LocalDateTime.class))).thenReturn(false);
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = service.login(new LoginRequest("USER@example.com", "password"), metadata);

        assertEquals("jwt-token", response.getToken());
        assertEquals(user.getId(), response.getUserId());
        verify(authenticationManager).authenticate(any());
        verify(loginSecurityService).recordSuccessfulLogin(eq(user), eq(metadata), any(LocalDateTime.class));
    }

    @Test
    void badPasswordRecordsFailureAndReturnsGenericAuthenticationError() {
        Users user = activeUser();
        LoginSecurityService.LoginRequestMetadata metadata = metadata();
        AuthService service = service();
        when(loginSecurityService.findUserForLogin("user@example.com")).thenReturn(Optional.of(user));
        when(accountLoginRateLimiter.isAllowed("user@example.com")).thenReturn(true);
        when(loginSecurityService.isLocked(eq(user), any(LocalDateTime.class))).thenReturn(false);
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("wrong"));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> service.login(new LoginRequest("user@example.com", "wrong"), metadata));

        assertEquals("Invalid email or password", exception.getMessage());
        verify(loginSecurityService).recordFailedLogin(eq(user), eq(metadata), any(LocalDateTime.class));
    }

    @Test
    void unknownEmailUsesGenericErrorAndRecordsNullableUserAttempt() {
        LoginSecurityService.LoginRequestMetadata metadata = metadata();
        AuthService service = service();
        when(loginSecurityService.findUserForLogin("unknown@example.com")).thenReturn(Optional.empty());
        when(accountLoginRateLimiter.isAllowed("unknown@example.com")).thenReturn(true);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> service.login(new LoginRequest("unknown@example.com", "password"), metadata));

        assertEquals("Invalid email or password", exception.getMessage());
        verify(passwordEncoder).matches(eq("password"), any());
        verify(loginSecurityService).recordUnknownUserLogin(eq(metadata), any(LocalDateTime.class));
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void lockedAccountSkipsPasswordVerification() {
        Users user = activeUser();
        LoginSecurityService.LoginRequestMetadata metadata = metadata();
        AuthService service = service();
        when(loginSecurityService.findUserForLogin("user@example.com")).thenReturn(Optional.of(user));
        when(accountLoginRateLimiter.isAllowed("user@example.com")).thenReturn(true);
        when(loginSecurityService.isLocked(eq(user), any(LocalDateTime.class))).thenReturn(true);

        assertThrows(LoginAccountLockedException.class,
                () -> service.login(new LoginRequest("user@example.com", "password"), metadata));

        verify(authenticationManager, never()).authenticate(any());
        verify(loginSecurityService).recordRejectedLogin(eq(user), eq(metadata), any(LocalDateTime.class));
    }

    private AuthService service() {
        return new AuthService(
                userRepository,
                passwordEncoder,
                jwtService,
                auditLogService,
                accountLoginRateLimiter,
                loginSecurityService,
                authenticationManager
        );
    }

    private Users activeUser() {
        Users user = new Users();
        user.setId(7L);
        user.setEmail("user@example.com");
        user.setFirstName("User");
        user.setLastName("Example");
        user.setRole(Role.STUDENT);
        user.setStatus(UserStatus.ACTIVE);
        user.setFailedLoginAttempts(0);
        return user;
    }

    private LoginSecurityService.LoginRequestMetadata metadata() {
        return new LoginSecurityService.LoginRequestMetadata("127.0.0.1", "JUnit");
    }
}
