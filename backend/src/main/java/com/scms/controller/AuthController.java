package com.scms.controller;

import com.scms.dto.LoginRequest;
import com.scms.dto.LoginResponse;
import com.scms.dto.RegisterResponse;
import com.scms.dto.RegisterUserRequest;
import com.scms.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless; client simply discards the token.
        return ResponseEntity.ok().build();
    }

    @GetMapping("/available")
    public String greeting() {
        return "Hello world, the spring boot security is ready for use";
    }
}