package com.scms.controller;

import com.scms.dto.LoginRequest;
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
    private final AuthService userService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterUserRequest request ){
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request){
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/available")
    public String greeting(){
        return "Hello world the spring boot security is ready for the use";
    }

}
