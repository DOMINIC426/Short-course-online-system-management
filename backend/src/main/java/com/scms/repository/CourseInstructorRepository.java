package com.scms.repository;

import com.scms.entity.CourseInstructor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseInstructorRepository extends JpaRepository<CourseInstructor, Long> {

    boolean existsByCourseIdAndInstructorUserId(Long courseId, Long userId);

    List<CourseInstructor> findAllByInstructorId(Long instructorId);

    Optional<CourseInstructor> findByCourseIdAndInstructorId(Long courseId, Long instructorId);
}
