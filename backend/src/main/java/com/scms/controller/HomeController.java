package com.scms.controller;

import com.scms.dto.RegisterResponse;
import com.scms.dto.RegisterUserRequest;
import com.scms.exception.UserAlreadyExistException;
import com.scms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HomeController {
    private final UserService userService;
    @GetMapping("/home")
    public String greeting(){
        return "Hello World! Welcome to the short course online start point";
    }


    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        try {
            RegisterResponse response = userService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (UserAlreadyExistException e) {

            throw e;
        }
    }
}
