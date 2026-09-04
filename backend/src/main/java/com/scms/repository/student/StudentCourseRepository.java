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

    @Query(value = """
            SELECT DISTINCT c FROM ShortCourse c
            LEFT JOIN FETCH c.category cat
            LEFT JOIN FETCH c.venue v
            WHERE c.status IN :statuses
              AND (:categoryId IS NULL OR :categoryId <= 0 OR cat.id = :categoryId)
              AND (:keywordPattern IS NULL OR c.title ILIKE :keywordPattern
                   OR c.courseCode ILIKE :keywordPattern)
            """,
            countQuery = """
            SELECT COUNT(DISTINCT c.id) FROM ShortCourse c
            LEFT JOIN c.category cat
            LEFT JOIN c.venue v
            WHERE c.status IN :statuses
              AND (:categoryId IS NULL OR :categoryId <= 0 OR cat.id = :categoryId)
              AND (:keywordPattern IS NULL OR c.title ILIKE :keywordPattern
                   OR c.courseCode ILIKE :keywordPattern)
            """)
    Page<ShortCourse> findPublicCourses(@Param("statuses") List<CourseStatus> statuses,
                                        @Param("categoryId") Long categoryId,
                                        @Param("keywordPattern") String keywordPattern,
                                        Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM ShortCourse c WHERE c.id = :courseId")
    Optional<ShortCourse> findByIdForUpdate(@Param("courseId") Long courseId);
}