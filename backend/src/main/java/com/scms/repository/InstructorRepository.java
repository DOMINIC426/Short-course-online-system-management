package com.scms.repository;

import com.scms.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstructorRepository
        extends JpaRepository<Instructor, Long> {

    // Existing main functionality
    Optional<Instructor> findByUserId(
            Long userId
    );

    // Instructor module
    Optional<Instructor> findByUser_Email(
            String email
    );
}
