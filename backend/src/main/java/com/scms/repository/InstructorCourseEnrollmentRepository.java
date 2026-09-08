package com.scms.repository;

import com.scms.entity.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorCourseEnrollmentRepository
        extends JpaRepository<CourseEnrollment, Long> {

    List<CourseEnrollment> findByCourse_Id(Long courseId);

    Optional<CourseEnrollment> findByIdAndCourse_Id(
            Long enrollmentId,
            Long courseId
    );
}
