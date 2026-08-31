package com.scms.repository.student;

import com.scms.entity.Announcement;
import com.scms.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentAnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("""
            SELECT a FROM Announcement a
            WHERE a.course.id IN (
                SELECT e.course.id FROM CourseEnrollment e WHERE e.student = :student
            )
            ORDER BY a.createdAt DESC
            """)
    Page<Announcement> findAllForStudent(@Param("student") Student student, Pageable pageable);
}