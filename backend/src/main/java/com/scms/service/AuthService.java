package com.scms.service;

import com.scms.dto.LoginRequest;
import com.scms.dto.LoginResponse;
import com.scms.dto.RegisterUserRequest;
import com.scms.dto.RegisterResponse;
import com.scms.entity.Users;
import com.scms.exception.TooManyRequestsException;
import com.scms.service.admin.AuditLogService;
import com.scms.entity.enums.Role;  
import com.scms.entity.enums.UserStatus;
import com.scms.exception.UserAlreadyExistException;
import com.scms.exception.UserNotFoundException;
import com.scms.jwt.JwtService;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;
    private final AccountLoginRateLimiter accountLoginRateLimiter;


    @Transactional
    public RegisterResponse register(RegisterUserRequest request) {
        Optional<Users> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new UserAlreadyExistException("User with email " + request.getEmail() + " already exists");
        }

        Users user = Users.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();

        Users savedUser = userRepository.save(user);

        // Audit log
        auditLogService.logAction("CREATE", "USER", savedUser.getId(), null, savedUser.getEmail(), savedUser);

        RegisterResponse response = new RegisterResponse();
        response.setId(savedUser.getId());
        response.setFirstName(savedUser.getFirstName());
        response.setLastName(savedUser.getLastName());
        response.setEmail(savedUser.getEmail());
        response.setPhone(savedUser.getPhone());
        response.setRole(savedUser.getRole());
        return response;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User with email " + request.getEmail() + " not found"));

      if (!accountLoginRateLimiter.isAllowed(request.getEmail())) {
        throw new TooManyRequestsException("Too many login attempts for this account. Please try again later.");       
      }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadCredentialsException("User account is not active");
        }

        UserDetails userDetails = User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .disabled(user.getStatus() != UserStatus.ACTIVE)
                .build();

        String token = jwtService.generateToken(userDetails);

        // Audit log
        auditLogService.logAction("LOGIN", "USER", user.getId(), null, user.getEmail(), user);

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}