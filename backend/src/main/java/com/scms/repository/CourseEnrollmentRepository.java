package com.scms.repository;

import com.scms.entity.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    long countByCourseId(Long courseId);
}