package com.scms.controller;

import com.scms.dto.*;
import com.scms.service.InstructorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/instructor")
public class InstructorController {

    private final InstructorService instructorService;


    @GetMapping("/me")
    public ResponseEntity<InstructorProfileResponse> getMyProfile(
            Authentication authentication) {

        return ResponseEntity.ok(
                instructorService.getProfileByEmail(
                        authentication.getName()
                )
        );
    }


    @GetMapping("/courses")
    public ResponseEntity<List<InstructorCourseResponse>> getMyCourses(
            Authentication authentication) {

        return ResponseEntity.ok(
                instructorService.getMyCourses(
                        authentication.getName()
                )
        );
    }


    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<InstructorStudentResponse>> getStudents(
            @PathVariable Long courseId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String paymentStatus,
            Authentication authentication) {

        return ResponseEntity.ok(
                instructorService.getStudents(
                        authentication.getName(),
                        courseId,
                        search,
                        paymentStatus
                )
        );
    }


    @GetMapping("/courses/{courseId}/students/{enrollmentId}")
    public ResponseEntity<InstructorStudentDetailsResponse>
    getStudentDetails(
            @PathVariable Long courseId,
            @PathVariable Long enrollmentId,
            Authentication authentication) {

        return ResponseEntity.ok(
                instructorService.getStudentDetails(
                        authentication.getName(),
                        courseId,
                        enrollmentId
                )
        );
    }


    @PostMapping("/courses/{courseId}/announcements")
    public ResponseEntity<InstructorAnnouncementResponse>
    sendAnnouncement(
            @PathVariable Long courseId,
            @Valid @RequestBody InstructorAnnouncementRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        instructorService.sendAnnouncement(
                                authentication.getName(),
                                courseId,
                                request
                        )
                );
    }


    @PutMapping("/courses/{courseId}/venue")
    public ResponseEntity<InstructorVenueUpdateResponse> updateVenue(
            @PathVariable Long courseId,
            @Valid @RequestBody InstructorVenueUpdateRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                instructorService.updateVenue(
                        authentication.getName(),
                        courseId,
                        request
                )
        );
    }


    @PostMapping("/courses/{courseId}/progress")
    public ResponseEntity<InstructorCourseProgressResponse>
    submitCourseProgress(
            @PathVariable Long courseId,
            @Valid @RequestBody
            InstructorCourseProgressRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        instructorService.submitCourseProgress(
                                authentication.getName(),
                                courseId,
                                request
                        )
                );
    }



    @PutMapping(
            "/courses/{courseId}/students/{enrollmentId}/certificate-eligibility"
    )
    public ResponseEntity<InstructorCertificateEligibilityResponse>
    updateCertificateEligibility(
            @PathVariable Long courseId,
            @PathVariable Long enrollmentId,
            @Valid @RequestBody
            InstructorCertificateEligibilityRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                instructorService.updateCertificateEligibility(
                        authentication.getName(),
                        courseId,
                        enrollmentId,
                        request
                )
        );
    }

}
