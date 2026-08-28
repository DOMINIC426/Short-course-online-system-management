package com.scms.repository.student;

import com.scms.entity.ShortCourse;
import com.scms.entity.enums.CourseStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentCourseRepository extends JpaRepository<ShortCourse, Long> {

    List<ShortCourse> findByStatusIn(List<CourseStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM ShortCourse c WHERE c.id = :courseId")
    Optional<ShortCourse> findByIdForUpdate(@Param("courseId") Long courseId);
}