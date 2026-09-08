package com.scms.repository;

import com.scms.dto.ShortCourseDTO;
import com.scms.entity.ShortCourse;
import com.scms.entity.enums.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ShortCourseRepository extends JpaRepository<ShortCourse, Long> {

    boolean existsByTitle(String title);

    boolean existsByTitleAndIdNot(String title, Long id);

    boolean existsByCourseCode(String courseCode);

    boolean existsByCourseCodeAndIdNot(String courseCode, Long id);

    List<ShortCourse> findAllByStatus(CourseStatus status);

    @Query("""
        SELECT new com.scms.dto.ShortCourseDTO(
            c.courseCode,
            c.title,
            c.description,
            c.duration,
            c.startDate,
            c.endDate,
            c.regOpenDate,
            c.regCloseDate,
            c.courseFee,
            c.maxStudents,
            c.minStudents,
            c.status
        )
        FROM ShortCourse c
        """)
    Page<ShortCourseDTO> findAllCourses(Pageable pageable);
}