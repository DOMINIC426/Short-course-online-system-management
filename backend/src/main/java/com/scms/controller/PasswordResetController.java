package com.scms.controller;

import com.scms.dto.password.*;
import com.scms.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/password-reset")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/request")
    public ResponseEntity<MessageResponse> requestReset(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestPasswordReset(request);
        return ResponseEntity.ok(new MessageResponse("If an account exists for this email, a verification code has been sent."));
    }

    @PostMapping("/verify-code")
    public ResponseEntity<PasswordResetTokenResponse> verifyCode(@Valid @RequestBody VerifyResetCodeRequest request) {
        PasswordResetTokenResponse response = passwordResetService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-code")
    public ResponseEntity<MessageResponse> resendCode(@Valid @RequestBody ResendResetCodeRequest request) {
        passwordResetService.resendOtp(request);
        return ResponseEntity.ok(new MessageResponse("Verification code has been resent if the email exists."));
    }

    @PostMapping("/complete")
    public ResponseEntity<MessageResponse> completeReset(@Valid @RequestBody CompletePasswordResetRequest request) {
        passwordResetService.completePasswordReset(request);
        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully."));
    }
}