package com.scms.controller;

import com.scms.dto.market.CourseStatsResponse;
import com.scms.dto.market.CreateShortCourseDto;
import com.scms.dto.market.ShortCourseResponse;
import com.scms.dto.market.UpdateShortCourseDto;
import com.scms.dto.market.CategoryResponse;
import com.scms.dto.market.CreateCategoryDto;
import com.scms.dto.market.InstructorResponse;
import com.scms.dto.market.CreateInstructorDto;
import com.scms.entity.enums.CourseStatus;
import com.scms.service.market.MarketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @PostMapping("/courses")
    @PreAuthorize("hasRole('MARKETING_OFFICER') AND hasAuthority('COURSE_CREATE')")
    public ResponseEntity<ShortCourseResponse> createCourse(@Valid @RequestBody CreateShortCourseDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketService.registerCourse(dto));
    }



    @PatchMapping("/courses/{id}")
    @PreAuthorize("hasRole('MARKETING_OFFICER') AND hasAuthority('COURSE_EDIT')")
    public ResponseEntity<ShortCourseResponse> editCourse(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShortCourseDto dto) {
        return ResponseEntity.ok(marketService.editCourse(id, dto));
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        return ResponseEntity.ok(marketService.deleteCourse(id));
    }

    @PatchMapping("/courses/{id}/set-visible")
    @PreAuthorize("hasRole('MARKETING_OFFICER') AND hasAuthority('COURSE_PUBLISH')")
    public ResponseEntity<String> setVisible(@PathVariable Long id) {
        return ResponseEntity.ok(marketService.setCourseAvailable(id));
    }

    @PatchMapping("/courses/{id}/set-invisible")
    @PreAuthorize("hasRole('MARKETING_OFFICER') AND hasAuthority('COURSE_UNPUBLISH')")
    public ResponseEntity<String> setInvisible(@PathVariable Long id) {
        return ResponseEntity.ok(marketService.setCourseUnavailable(id));
    }

    @GetMapping("/courses/status/{status}")
    @PreAuthorize("permitAll")
    public ResponseEntity<List<ShortCourseResponse>> getCourseByStatus(@PathVariable CourseStatus status) {
        return ResponseEntity.ok(marketService.getVisibleCourse(status));
    }


    @PatchMapping("/courses/{courseId}/assign-instructor/{instructorId}")
    @PreAuthorize("hasRole('MARKETING_OFFICER') AND hasAuthority('INSTRUCTOR_ASSIGN')")
    public ResponseEntity<ShortCourseResponse> assignInstructor(
            @PathVariable Long courseId,
            @PathVariable Long instructorId) {
        return ResponseEntity.ok(marketService.assignInstructor(courseId, instructorId));
    }

    @DeleteMapping("/courses/{courseId}/instructors/{instructorId}")
    @PreAuthorize("hasRole('MARKETING_OFFICER') AND hasAuthority('INSTRUCTOR_ASSIGN')")
    public ResponseEntity<String> removeInstructorFromCourse(
            @PathVariable Long courseId,
            @PathVariable Long instructorId) {
        return ResponseEntity.ok(marketService.removeInstructorFromCourse(courseId, instructorId));
    }

    @GetMapping("/courses/{courseId}/stats")
    @PreAuthorize("hasRole('MARKETING_OFFICER') AND hasAuthority('COURSE_STATS_READ')")
    public ResponseEntity<CourseStatsResponse> getCourseStats(@PathVariable Long courseId) {
        return ResponseEntity.ok(marketService.getCourseRegistrationStats(courseId));
    }

    @GetMapping("/categories")
    @PreAuthorize("permitAll")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(marketService.getCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('MARKETING_OFFICER') AND hasAuthority('CATEGORY_CREATE')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketService.createCategory(dto));
    }

    @GetMapping("/instructors")
    @PreAuthorize("permitAll")
    public ResponseEntity<List<InstructorResponse>> getInstructors() {
        return ResponseEntity.ok(marketService.getInstructors());
    }

    @PostMapping("/instructors")
    @PreAuthorize("hasRole('MARKETING_OFFICER')")
    public ResponseEntity<InstructorResponse> createInstructor(@Valid @RequestBody CreateInstructorDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketService.createInstructor(dto));
    }

    @DeleteMapping("/instructors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteInstructor(@PathVariable Long id) {
        return ResponseEntity.ok(marketService.deleteInstructor(id));
    }

}
