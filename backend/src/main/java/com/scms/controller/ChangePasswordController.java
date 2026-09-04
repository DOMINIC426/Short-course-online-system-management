package com.scms.controller;

import com.scms.dto.password.ChangePasswordRequest;
import com.scms.dto.password.MessageResponse;
import com.scms.entity.Users;
import com.scms.exception.UserNotFoundException;
import com.scms.repository.UserRepository;
import com.scms.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ChangePasswordController {

    private final PasswordResetService passwordResetService;
    private final UserRepository userRepository;

    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal Object principal,
            Principal fallbackPrincipal,
            @Valid @RequestBody ChangePasswordRequest request) {

        if (principal instanceof Users user) {
            passwordResetService.changePassword(user, request);
            return ResponseEntity.ok(new MessageResponse("Password changed successfully. All active sessions have been invalidated."));
        }

        final String username;
        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else if (fallbackPrincipal != null) {
            username = fallbackPrincipal.getName();
        } else {
            username = null;
        }

        if (username == null) {
            throw new UserNotFoundException("Authenticated user could not be determined.");
        }

        Users user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));

        passwordResetService.changePassword(user, request);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully. All active sessions have been invalidated."));
    }
}