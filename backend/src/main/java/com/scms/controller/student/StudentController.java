package com.scms.controller.student;

import com.scms.dto.student.*;
import com.scms.service.student.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentCourseService courseService;
    private final StudentRegistrationService registrationService;
    private final StudentEnrollmentService enrollmentService;
    private final StudentDashboardService dashboardService;
    private final StudentPaymentService paymentService;
    private final StudentAnnouncementService announcementService;
    private final StudentCertificateService certificateService;
    private final StudentNotificationService notificationService;

    // --- Public course catalogue ---
    @GetMapping("/courses/public")
    public ResponseEntity<List<CourseResponse>> getPublicCourses() {
        return ResponseEntity.ok(courseService.getPublicCourses());
    }

    // --- Student registration ---
    @PostMapping("/register")
    public ResponseEntity<StudentRegisterResponse> registerStudent(
            @Valid @RequestBody StudentRegisterRequest request) {
        StudentRegisterResponse response = registrationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // --- Course enrollment (student only) ---
    @PostMapping("/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> enrollInCourse(
            @Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.enroll(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // --- Student dashboard (student only) ---
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getDashboard() {
        return ResponseEntity.ok(dashboardService.getMyEnrollments());
    }

    // --- Payment history (student only) ---
    @GetMapping("/payments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<PaymentHistoryResponse>> getPaymentHistory() {
        return ResponseEntity.ok(paymentService.getMyPayments());
    }

    // --- Announcements for student ---
    @GetMapping("/announcements")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentAnnouncementResponse>> getMyAnnouncements() {
        return ResponseEntity.ok(announcementService.getMyAnnouncements());
    }

    // --- Certificate eligibility status ---
    @GetMapping("/certificates")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentCertificateResponse>> getMyCertificates() {
        return ResponseEntity.ok(certificateService.getMyCertificates());
    }

    // --- Notifications ---
    @GetMapping("/notifications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentNotificationResponse>> getMyNotifications() {
        return ResponseEntity.ok(notificationService.getMyNotifications());
    }
}