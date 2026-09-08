package com.scms.service;

import com.scms.dto.LoginRequest;
import com.scms.dto.LoginResponse;
import com.scms.dto.RegisterUserRequest;
import com.scms.dto.RegisterResponse;
import com.scms.entity.Users;
import com.scms.exception.LoginAccountLockedException;
import com.scms.exception.TooManyRequestsException;
import com.scms.service.admin.AuditLogService;
import com.scms.entity.enums.Role;  
import com.scms.entity.enums.UserStatus;
import com.scms.exception.UserAlreadyExistException;
import com.scms.jwt.JwtService;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;
    private final AccountLoginRateLimiter accountLoginRateLimiter;
    private final LoginSecurityService loginSecurityService;
    private final AuthenticationManager authenticationManager;

    private static final String DUMMY_PASSWORD_HASH =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";


    @Transactional
    public RegisterResponse register(RegisterUserRequest request) {
        Optional<Users> existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent() && userRepository.existsByPhone(request.getPhone())) {
            throw new UserAlreadyExistException(
                    "This email is already taken and this phone number is already in use."
            );
        }

        if (existingUser.isPresent()) {
            throw new UserAlreadyExistException("This email is already taken.");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new UserAlreadyExistException("This phone number is already in use.");
        }

        // Set role to STUDENT by default if not provided
        Role userRole = request.getRole() != null ? request.getRole() : Role.STUDENT;

        Users user = Users.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .status(UserStatus.ACTIVE)
                .build();

        Users savedUser = userRepository.saveAndFlush(user);

        // Audit log must be written only after the user row is definitely persisted
        // in the same transaction; otherwise the FK from audit_logs.user_id can fail.
        if (savedUser.getId() != null) {
            auditLogService.logAction("CREATE", "USER", savedUser.getId(), null, savedUser.getEmail(), savedUser);
        }

        String token = jwtService.generateToken(savedUser);

        RegisterResponse response = new RegisterResponse();
        response.setId(savedUser.getId());
        response.setFirstName(savedUser.getFirstName());
        response.setLastName(savedUser.getLastName());
        response.setEmail(savedUser.getEmail());
        response.setPhone(savedUser.getPhone());
        response.setRole(savedUser.getRole());
        response.setToken(token);
        return response;
    }

    @Transactional(noRollbackFor = {
            BadCredentialsException.class,
            LoginAccountLockedException.class,
            TooManyRequestsException.class
    })
    public LoginResponse login(
            LoginRequest request,
            LoginSecurityService.LoginRequestMetadata metadata
    ) {
        String email = request.getEmail().trim();
        LocalDateTime now = LocalDateTime.now();
        Optional<Users> userCandidate = loginSecurityService.findUserForLogin(email);

        if (!accountLoginRateLimiter.isAllowed(email)) {
            userCandidate.ifPresentOrElse(
                    user -> loginSecurityService.recordRejectedLogin(user, metadata, now),
                    () -> loginSecurityService.recordUnknownUserLogin(metadata, now)
            );
            throw new TooManyRequestsException("Too many login attempts. Please try again later.");
        }

        if (userCandidate.isEmpty()) {
            passwordEncoder.matches(request.getPassword(), DUMMY_PASSWORD_HASH);
            loginSecurityService.recordUnknownUserLogin(metadata, now);
            throw invalidCredentials();
        }

        Users user = userCandidate.get();
        loginSecurityService.expireLockIfNeeded(user, now);

        if (loginSecurityService.isLocked(user, now)) {
            loginSecurityService.recordRejectedLogin(user, metadata, now);
            throw new LoginAccountLockedException();
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            loginSecurityService.recordRejectedLogin(user, metadata, now);
            throw invalidCredentials();
        }

        try {
            authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(email, request.getPassword())
            );
        } catch (BadCredentialsException exception) {
            loginSecurityService.recordFailedLogin(user, metadata, now);
            throw invalidCredentials();
        }

        loginSecurityService.recordSuccessfulLogin(user, metadata, now);

        String token = jwtService.generateToken(user);

        // Audit log
        auditLogService.logAction("LOGIN", "USER", user.getId(), null, user.getEmail(), user);

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private BadCredentialsException invalidCredentials() {
        return new BadCredentialsException("Invalid email or password");
    }
}