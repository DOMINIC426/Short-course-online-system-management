package com.scms.repository;

import com.scms.entity.CourseInstructor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseInstructorRepository
        extends JpaRepository<CourseInstructor, Long> {

    // Existing main functionality
    boolean existsByCourseIdAndInstructorUserId(
            Long courseId,
            Long userId
    );

    List<CourseInstructor> findAllByInstructorId(
            Long instructorId
    );

    Optional<CourseInstructor> findByCourseIdAndInstructorId(
            Long courseId,
            Long instructorId
    );


    // Instructor module functionality
    List<CourseInstructor> findByInstructor_User_Email(
            String email
    );

    boolean existsByCourse_IdAndInstructor_User_Email(
            Long courseId,
            String email
    );

    Optional<CourseInstructor> findByCourse_IdAndInstructor_User_Email(
            Long courseId,
            String email
    );
}
