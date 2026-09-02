package com.scms.repository.student;

import com.scms.entity.ShortCourse;
import com.scms.entity.enums.CourseStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentCourseRepository extends JpaRepository<ShortCourse, Long> {

    @Query("""
            SELECT c FROM ShortCourse c
            WHERE c.status IN :statuses
              AND (:categoryId IS NULL OR c.category.id = :categoryId)
              AND (:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(c.courseCode) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<ShortCourse> findPublicCourses(@Param("statuses") List<CourseStatus> statuses,
                                        @Param("categoryId") Long categoryId,
                                        @Param("keyword") String keyword,
                                        Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM ShortCourse c WHERE c.id = :courseId")
    Optional<ShortCourse> findByIdForUpdate(@Param("courseId") Long courseId);
}