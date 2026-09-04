package com.scms.service;

import com.scms.exception.EmailSendingException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:noreply@scms.local}")
    private String fromAddress;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public void sendPasswordResetEmail(String to, String otp) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Simulating password reset email dispatch to {}", to);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("Password Reset Verification Code - SCMS");

            String htmlContent = buildPasswordResetEmailHtml(otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}", to, e);
            throw new EmailSendingException("Unable to send email. Please try again later.");
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}", to, e);
            throw new EmailSendingException("Unable to send email. Please try again later.");
        }
    }

    public void sendPasswordChangeNotification(String to) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Simulating password change notification to {}", to);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("Security Alert: Your SCMS Password Was Changed");

            String htmlContent = buildPasswordChangeNotificationHtml();
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password change notification sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send password change notification to {}", to, e);
            // Notification failure does not rollback successful password change
        }
    }

    private String buildPasswordResetEmailHtml(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Password Reset Verification Code</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <tr>
                                    <td style="background-color: #1e3a8a; padding: 24px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SCMS Password Reset</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 32px;">
                                        <p style="font-size: 16px; line-height: 1.5; color: #333333;">Hello,</p>
                                        <p style="font-size: 16px; line-height: 1.5; color: #333333;">
                                            We received a request to reset your password for your SCMS account. Use the verification code below to proceed:
                                        </p>
                                        <p style="text-align: center; margin: 32px 0;">
                                            <span style="display: inline-block; background-color: #f0f4f8; border: 2px dashed #1e3a8a; padding: 14px 28px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a;">
                                                {{OTP}}
                                            </span>
                                        </p>
                                        <p style="font-size: 14px; line-height: 1.5; color: #555555;">
                                            This verification code will expire in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized activity.
                                        </p>
                                        <p style="font-size: 13px; line-height: 1.5; color: #888888; margin-top: 24px;">
                                            For security reasons, never share this code with anyone. SCMS support staff will never ask for your code or password.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                                        This is an automated notification from SCMS. Please do not reply directly to this email.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.replace("{{OTP}}", otp);

    }

    private String buildPasswordChangeNotificationHtml() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Password Changed Successfully</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <tr>
                                    <td style="background-color: #1e3a8a; padding: 24px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Security Alert</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 32px;">
                                        <p style="font-size: 16px; line-height: 1.5; color: #333333;">Hello,</p>
                                        <p style="font-size: 16px; line-height: 1.5; color: #333333;">
                                            Your SCMS account password was recently changed. All active sessions have been invalidated.
                                        </p>
                                        <p style="font-size: 14px; line-height: 1.5; color: #d97706; background-color: #fef3c7; padding: 12px 16px; border-radius: 6px;">
                                            If you made this change, no further action is required. If you did NOT initiate this change, please contact your administrator immediately.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
                                        This is an automated notification from SCMS. Please do not reply directly to this email.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;
    }
}
