package com.scms.repository;

import com.scms.entity.ShortCourse;
import com.scms.entity.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShortCourseRepository extends JpaRepository<ShortCourse, Long> {
    boolean existsByTitle(String title);

    boolean existsByTitleAndIdNot(String title, Long id);

    boolean existsByCourseCode(String courseCode);

    boolean existsByCourseCodeAndIdNot(String courseCode, Long id);

    List<ShortCourse> findAllByStatus(CourseStatus status);
}
