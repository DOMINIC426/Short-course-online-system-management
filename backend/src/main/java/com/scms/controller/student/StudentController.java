package com.scms.controller.student;

import com.scms.dto.student.CourseResponse;
import com.scms.dto.student.StudentRegisterRequest;
import com.scms.dto.student.StudentRegisterResponse;
import com.scms.service.student.StudentCourseService;
import com.scms.service.student.StudentRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentCourseService courseService;
    private final StudentRegistrationService registrationService;

    // --- Course catalogue ---
    @GetMapping("/courses/public")
    public ResponseEntity<List<CourseResponse>> getPublicCourses() {
        List<CourseResponse> courses = courseService.getPublicCourses();
        return ResponseEntity.ok(courses);
    }

    // --- Student registration ---
    @PostMapping("/register")
    public ResponseEntity<StudentRegisterResponse> registerStudent(
            @Valid @RequestBody StudentRegisterRequest request) {
        StudentRegisterResponse response = registrationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Future student endpoints will be added here.
}