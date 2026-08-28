package com.scms.repository;

import com.scms.entity.ShortCourse;
import com.scms.entity.enums.CourseStatus;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShortCourseRepository extends JpaRepository<ShortCourse, Long> {
    boolean existsByTitle(@NotBlank(message = "Title is required") String title);

    List<ShortCourse> findAllByStatus(CourseStatus status);
}
