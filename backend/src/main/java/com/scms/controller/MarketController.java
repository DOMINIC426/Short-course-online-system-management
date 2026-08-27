package com.scms.controller;

import com.scms.dto.market.CourseResponse;
import com.scms.dto.market.CreateCourseDto;
import com.scms.service.market.MarketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {
    private final MarketService marketService;

     @PostMapping("/add-course")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CreateCourseDto dto) {
        return ResponseEntity.ok(marketService.registerCourse(dto));
    }


    @GetMapping("/get-course")
    public ResponseEntity<List<CourseResponse>> getAllCourse() {
         return ResponseEntity.ok(marketService.getAllCourses());
    }


    @PatchMapping("/edit-course/{id}")
    public ResponseEntity<CourseResponse> edit(@PathVariable Long id, @Valid @RequestBody CreateCourseDto dto) {
         return ResponseEntity.ok(marketService.editCourse(id, dto));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
         return ResponseEntity.ok(marketService.deleteCourse(id));
    }



}
