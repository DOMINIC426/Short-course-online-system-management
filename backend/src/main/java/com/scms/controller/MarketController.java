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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @PostMapping("/courses")
    public ResponseEntity<ShortCourseResponse> createCourse(@Valid @RequestBody CreateShortCourseDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketService.registerCourse(dto));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<ShortCourseResponse>> getAllCourses() {
        return ResponseEntity.ok(marketService.getAllCourses());
    }

    @PatchMapping("/courses/{id}")
    public ResponseEntity<ShortCourseResponse> editCourse(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShortCourseDto dto) {
        return ResponseEntity.ok(marketService.editCourse(id, dto));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        return ResponseEntity.ok(marketService.deleteCourse(id));
    }

    @PatchMapping("/courses/{id}/set-visible")
    public ResponseEntity<String> setVisible(@PathVariable Long id) {
        return ResponseEntity.ok(marketService.setCourseAvailable(id));
    }

    @PatchMapping("/courses/{id}/set-invisible")
    public ResponseEntity<String> setInvisible(@PathVariable Long id) {
        return ResponseEntity.ok(marketService.setCourseUnavailable(id));
    }

    @GetMapping("/courses/status/{status}")
    public ResponseEntity<List<ShortCourseResponse>> getCourseByStatus(@PathVariable CourseStatus status) {
        return ResponseEntity.ok(marketService.getVisibleCourse(status));
    }


    @PatchMapping("/courses/{courseId}/assign-instructor/{instructorId}")
    public ResponseEntity<ShortCourseResponse> assignInstructor(
            @PathVariable Long courseId,
            @PathVariable Long instructorId) {
        return ResponseEntity.ok(marketService.assignInstructor(courseId, instructorId));
    }

    @DeleteMapping("/courses/{courseId}/instructors/{instructorId}")
    public ResponseEntity<String> removeInstructorFromCourse(
            @PathVariable Long courseId,
            @PathVariable Long instructorId) {
        return ResponseEntity.ok(marketService.removeInstructorFromCourse(courseId, instructorId));
    }

    @GetMapping("/courses/{courseId}/stats")
    public ResponseEntity<CourseStatsResponse> getCourseStats(@PathVariable Long courseId) {
        return ResponseEntity.ok(marketService.getCourseRegistrationStats(courseId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(marketService.getCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketService.createCategory(dto));
    }

    @GetMapping("/instructors")
    public ResponseEntity<List<InstructorResponse>> getInstructors() {
        return ResponseEntity.ok(marketService.getInstructors());
    }

    @PostMapping("/instructors")
    public ResponseEntity<InstructorResponse> createInstructor(@Valid @RequestBody CreateInstructorDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketService.createInstructor(dto));
    }

    @DeleteMapping("/instructors/{id}")
    public ResponseEntity<String> deleteInstructor(@PathVariable Long id) {
        return ResponseEntity.ok(marketService.deleteInstructor(id));
    }

}
