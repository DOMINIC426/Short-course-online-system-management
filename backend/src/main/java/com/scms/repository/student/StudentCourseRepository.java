package com.scms.repository.student;

import com.scms.entity.ShortCourse;
import com.scms.entity.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCourseRepository extends JpaRepository<ShortCourse, Long> {

    List<ShortCourse> findByStatusIn(List<CourseStatus> statuses);
}