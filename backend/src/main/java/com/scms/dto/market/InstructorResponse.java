package com.scms.dto.market;

import java.util.List;

public record InstructorResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String status,
        List<AssignedCourseResponse> assignedCourses) {
}
