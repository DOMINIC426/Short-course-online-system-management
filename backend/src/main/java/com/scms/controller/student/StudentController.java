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
    public ResponseEntity<PaginatedResponse<CourseResponse>> getPublicCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(courseService.getPublicCourses(page, size, sortBy, categoryId, keyword));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<CourseDetailResponse> getCourseDetail(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getCourseDetail(courseId));
    }

    // --- Student registration ---
    @PostMapping("/register")
    public ResponseEntity<StudentRegisterResponse> registerStudent(
            @Valid @RequestBody StudentRegisterRequest request) {
        StudentRegisterResponse response = registrationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // --- Course enrollment ---
    @PostMapping("/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> enrollInCourse(
            @Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.enroll(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // --- Student dashboard ---
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaginatedResponse<EnrollmentResponse>> getDashboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(dashboardService.getMyEnrollments(page, size));
    }

    // --- Payment history ---
    @GetMapping("/payments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaginatedResponse<PaymentHistoryResponse>> getPaymentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(paymentService.getMyPayments(page, size));
    }

    // --- Announcements ---
    @GetMapping("/announcements")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaginatedResponse<StudentAnnouncementResponse>> getMyAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(announcementService.getMyAnnouncements(page, size));
    }

    // --- Certificate eligibility ---
    @GetMapping("/certificates")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentCertificateResponse>> getMyCertificates() {
        return ResponseEntity.ok(certificateService.getMyCertificates());
    }

    // --- Notifications ---
    @GetMapping("/notifications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaginatedResponse<StudentNotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.getMyNotifications(page, size));
    }

    @PatchMapping("/notifications/{notificationId}/read")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }
}