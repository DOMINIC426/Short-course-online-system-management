package com.scms.repository;

import com.scms.entity.CourseInstructor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseInstructorRepository extends JpaRepository<CourseInstructor, Long> {

    boolean existsByCourseIdAndInstructorUserId(Long courseId, Long userId);
}