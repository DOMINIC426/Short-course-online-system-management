package com.scms.repository.student;

import com.scms.entity.CourseEnrollment;
import com.scms.entity.Student;
import com.scms.entity.ShortCourse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    Optional<CourseEnrollment> findByStudentAndCourse(Student student, ShortCourse course);

    long countByCourse(ShortCourse course);

     Optional<CourseEnrollment> findByControlNumber(String controlNumber);
     
    Page<CourseEnrollment> findByStudentOrderByRegistrationDateDesc(Student student, Pageable pageable);
}