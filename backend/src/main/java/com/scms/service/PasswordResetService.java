package com.scms.service;

import com.scms.dto.password.*;
import com.scms.entity.PasswordResetRequest;
import com.scms.entity.Users;
import com.scms.entity.enums.PasswordResetStatus;
import com.scms.exception.*;
import com.scms.repository.PasswordResetRequestRepository;
import com.scms.repository.UserRepository;
import com.scms.service.admin.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetRequestRepository resetRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;
    private final AuditLogService auditLogService;

    @Value("${security.password-reset.otp-validity-minutes:10}")
    private int otpValidityMinutes = 10;

    @Value("${security.password-reset.otp-length:6}")
    private int otpLength = 6;

    @Value("${security.password-reset.max-otp-attempts:5}")
    private int maxOtpAttempts = 5;

    @Value("${security.password-reset.resend-cooldown-minutes:2}")
    private int resendCooldownMinutes = 2;

    @Value("${security.password-reset.reset-token-validity-minutes:15}")
    private int resetTokenValidityMinutes = 15;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Initiates password reset for the given email address.
     * Always returns generic success to protect against email enumeration.
     */
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (!rateLimitService.tryAcquire("request:" + email, 3, 60)) {
            throw new TooManyRequestsException("Too many reset requests. Please try again later.");
        }

        Optional<Users> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Anti-enumeration: log debug only and return gracefully
            log.debug("Password reset requested for non-existent email: {}", email);
            return;
        }

        Users user = userOpt.get();

        // Invalidate any existing pending requests for this user
        resetRequestRepository.findFirstByUserOrderByCreatedAtDesc(user)
                .filter(pr -> pr.getStatus() == PasswordResetStatus.PENDING)
                .ifPresent(pr -> {
                    pr.setStatus(PasswordResetStatus.CANCELLED);
                    resetRequestRepository.save(pr);
                });

        // Generate cryptographically secure OTP
        String otp = generateNumericOtp(otpLength);
        String otpHash = hashSha256(otp);

        PasswordResetRequest resetRequest = PasswordResetRequest.builder()
                .user(user)
                .otpHash(otpHash)
                .otpExpiresAt(LocalDateTime.now().plusMinutes(otpValidityMinutes))
                .otpAttempts(0)
                .maxAttempts(maxOtpAttempts)
                .resendCount(0)
                .lastSentAt(LocalDateTime.now())
                .status(PasswordResetStatus.PENDING)
                .build();

        resetRequestRepository.save(resetRequest);

        // Audit logging
        auditLogService.logAction("PASSWORD_RESET_REQUESTED", "USERS", user.getId(), null, "Password reset OTP requested", user);

        // Decouple email dispatch from DB transaction
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        emailService.sendPasswordResetEmail(email, otp);
                        auditLogService.logAction("PASSWORD_RESET_OTP_SENT", "PASSWORD_RESET_REQUEST", resetRequest.getId(), null, "OTP dispatched", user);
                    } catch (Exception e) {
                        log.error("Failed to send password reset email to {}", email, e);
                    }
                }
            });
        } else {
            emailService.sendPasswordResetEmail(email, otp);
        }
    }

    /**
     * Verifies the submitted OTP code.
     * On success, generates and returns a short-lived reset authorization token.
     */
    @Transactional
    public PasswordResetTokenResponse verifyOtp(VerifyResetCodeRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();

        if (!rateLimitService.tryAcquire("verify:" + email, 5, 60)) {
            throw new TooManyRequestsException("Too many verification attempts. Please try again later.");
        }

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidOtpException("Invalid verification code or email"));

        PasswordResetRequest resetRequest = resetRequestRepository
                .findTopByUserAndStatusOrderByCreatedAtDesc(user, PasswordResetStatus.PENDING)
                .orElseThrow(() -> new InvalidOtpException("No pending password reset request found"));

        // Check if maximum attempts reached
        if (resetRequest.getOtpAttempts() >= resetRequest.getMaxAttempts()) {
            resetRequest.setStatus(PasswordResetStatus.CANCELLED);
            resetRequestRepository.save(resetRequest);
            auditLogService.logAction("PASSWORD_RESET_OTP_LOCKED", "PASSWORD_RESET_REQUEST", resetRequest.getId(), null, "Max attempts exceeded", user);
            throw new TooManyOtpAttemptsException("Maximum verification attempts reached. Please request a new code.");
        }

        // Check expiry
        if (resetRequest.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            resetRequest.setStatus(PasswordResetStatus.EXPIRED);
            resetRequestRepository.save(resetRequest);
            auditLogService.logAction("PASSWORD_RESET_OTP_EXPIRED", "PASSWORD_RESET_REQUEST", resetRequest.getId(), null, "OTP expired", user);
            throw new ExpiredOtpException("Verification code has expired. Please request a new one.");
        }

        // Verify OTP hash with constant-time equality
        String submittedHash = hashSha256(code);
        if (!MessageDigest.isEqual(submittedHash.getBytes(StandardCharsets.UTF_8), resetRequest.getOtpHash().getBytes(StandardCharsets.UTF_8))) {
            resetRequest.setOtpAttempts(resetRequest.getOtpAttempts() + 1);
            if (resetRequest.getOtpAttempts() >= resetRequest.getMaxAttempts()) {
                resetRequest.setStatus(PasswordResetStatus.CANCELLED);
            }
            resetRequestRepository.save(resetRequest);
            auditLogService.logAction("PASSWORD_RESET_OTP_VERIFICATION_FAILED", "PASSWORD_RESET_REQUEST", resetRequest.getId(), null, "Attempt " + resetRequest.getOtpAttempts(), user);
            throw new InvalidOtpException("Invalid verification code.");
        }

        // OTP verified successfully
        resetRequest.setVerifiedAt(LocalDateTime.now());
        resetRequest.setStatus(PasswordResetStatus.VERIFIED);

        // Generate short-lived reset authorization token
        String resetToken = generateSecureToken();
        String resetTokenHash = hashSha256(resetToken);

        resetRequest.setResetTokenHash(resetTokenHash);
        resetRequest.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(resetTokenValidityMinutes));
        resetRequestRepository.save(resetRequest);

        auditLogService.logAction("PASSWORD_RESET_OTP_VERIFIED", "PASSWORD_RESET_REQUEST", resetRequest.getId(), null, "OTP successfully verified", user);

        return new PasswordResetTokenResponse(resetToken);
    }

    /**
     * Resends an OTP verification code if the cooldown period has passed.
     */
    @Transactional
    public void resendOtp(ResendResetCodeRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (!rateLimitService.tryAcquire("resend:" + email, 2, 60)) {
            throw new TooManyRequestsException("Too many resend attempts. Please try again later.");
        }

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        PasswordResetRequest resetRequest = resetRequestRepository
                .findTopByUserAndStatusOrderByCreatedAtDesc(user, PasswordResetStatus.PENDING)
                .orElseThrow(() -> new InvalidOtpException("No pending reset request found"));

        // Check cooldown
        if (resetRequest.getLastSentAt() != null &&
                resetRequest.getLastSentAt().plusMinutes(resendCooldownMinutes).isAfter(LocalDateTime.now())) {
            throw new ResendCooldownException("Please wait before requesting a new code.");
        }

        // Generate new OTP
        String otp = generateNumericOtp(otpLength);
        String otpHash = hashSha256(otp);

        resetRequest.setOtpHash(otpHash);
        resetRequest.setOtpExpiresAt(LocalDateTime.now().plusMinutes(otpValidityMinutes));
        resetRequest.setResendCount(resetRequest.getResendCount() + 1);
        resetRequest.setLastSentAt(LocalDateTime.now());
        resetRequest.setOtpAttempts(0); // Reset attempts on new code
        resetRequestRepository.save(resetRequest);

        // Decouple email sending from DB transaction
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        emailService.sendPasswordResetEmail(email, otp);
                        auditLogService.logAction("PASSWORD_RESET_OTP_RESENT", "PASSWORD_RESET_REQUEST", resetRequest.getId(), null, "OTP resent", user);
                    } catch (Exception e) {
                        log.error("Failed to resend password reset email to {}", email, e);
                    }
                }
            });
        } else {
            emailService.sendPasswordResetEmail(email, otp);
        }
    }

    /**
     * Completes password reset using a verified reset authorization token.
     * Updates password and invalidates all existing authentication tokens.
     */
    @Transactional
    public void completePasswordReset(CompletePasswordResetRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String resetToken = request.getResetToken().trim();
        String newPassword = request.getNewPassword();

        if (!rateLimitService.tryAcquire("complete:" + email, 5, 60)) {
            throw new TooManyRequestsException("Too many requests. Please try again later.");
        }

        if (request.getConfirmPassword() != null && !request.getConfirmPassword().equals(newPassword)) {
            throw new PasswordValidationException("New password and confirmation password do not match.");
        }

        validatePasswordStrength(newPassword);

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        PasswordResetRequest resetRequest = resetRequestRepository
                .findFirstByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new InvalidResetTokenException("Invalid or expired reset token"));

        if (resetRequest.getStatus() != PasswordResetStatus.VERIFIED) {
            throw new InvalidResetTokenException("Reset token is not in a valid state");
        }

        if (resetRequest.getResetTokenExpiresAt() == null || resetRequest.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            resetRequest.setStatus(PasswordResetStatus.EXPIRED);
            resetRequestRepository.save(resetRequest);
            throw new ExpiredResetTokenException("Reset token has expired. Please start over.");
        }

        String submittedTokenHash = hashSha256(resetToken);
        if (resetRequest.getResetTokenHash() == null ||
                !MessageDigest.isEqual(submittedTokenHash.getBytes(StandardCharsets.UTF_8), resetRequest.getResetTokenHash().getBytes(StandardCharsets.UTF_8))) {
            throw new InvalidResetTokenException("Invalid reset token");
        }

        // Update password and invalidate all existing active JWT tokens
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() != null ? user.getTokenVersion() + 1 : 1);
        userRepository.save(user);

        // Single-use token invalidation
        resetRequest.setStatus(PasswordResetStatus.USED);
        resetRequest.setUsedAt(LocalDateTime.now());
        resetRequest.setResetTokenHash(null);
        resetRequest.setResetTokenExpiresAt(null);
        resetRequestRepository.save(resetRequest);

        auditLogService.logAction("PASSWORD_RESET_COMPLETED", "USERS", user.getId(), null, "Password reset successfully completed", user);

        // Send confirmation alert outside transaction
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    emailService.sendPasswordChangeNotification(email);
                }
            });
        } else {
            emailService.sendPasswordChangeNotification(email);
        }
    }

    /**
     * Changes password for an authenticated user identified strictly by the security context.
     */
    @Transactional
    public void changePassword(Users user, ChangePasswordRequest request) {
        if (user == null || user.getId() == null) {
            throw new BadCredentialsException("User must be authenticated");
        }

        if (!rateLimitService.tryAcquire("change-pw:" + user.getId(), 5, 60)) {
            throw new TooManyRequestsException("Too many password change attempts. Please try again later.");
        }

        String currentPassword = request.getCurrentPassword();
        String newPassword = request.getNewPassword();

        if (request.getConfirmPassword() != null && !request.getConfirmPassword().equals(newPassword)) {
            throw new PasswordValidationException("New password and confirmation password do not match.");
        }

        validatePasswordStrength(newPassword);

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new PasswordValidationException("New password must be different from current password.");
        }

        // Update password and increment token version to invalidate active JWTs
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() != null ? user.getTokenVersion() + 1 : 1);
        userRepository.save(user);

        auditLogService.logAction("PASSWORD_CHANGED", "USERS", user.getId(), null, "Password successfully updated by authenticated user", user);

        // Send security notice outside transaction
        String email = user.getEmail();
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    emailService.sendPasswordChangeNotification(email);
                }
            });
        } else {
            emailService.sendPasswordChangeNotification(email);
        }
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new PasswordValidationException("Password must be at least 8 characters long.");
        }
        if (password.length() > 100) {
            throw new PasswordValidationException("Password must not exceed 100 characters.");
        }
    }

    private String generateNumericOtp(int length) {
        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            otp.append(secureRandom.nextInt(10));
        }
        return otp.toString();
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashSha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}