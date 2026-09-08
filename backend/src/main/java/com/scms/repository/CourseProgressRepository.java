package com.scms.repository;

import com.scms.entity.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseProgressRepository
        extends JpaRepository<CourseProgress, Long> {

    List<CourseProgress> findByCourse_IdOrderByCreatedAtDesc(Long courseId);
}
