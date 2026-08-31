package com.scms.service.student;

import com.scms.dto.student.CourseResponse;
import com.scms.entity.ShortCourse;
import com.scms.entity.enums.CourseStatus;
import com.scms.repository.student.StudentCourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentCourseService {

    private final StudentCourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<CourseResponse> getPublicCourses() {
        List<CourseStatus> publicStatuses = List.of(CourseStatus.PUBLISHED, CourseStatus.REGISTRATION_OPEN);
        List<ShortCourse> courses = courseRepository.findByStatusIn(publicStatuses);

        return courses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CourseResponse mapToResponse(ShortCourse course) {
        return CourseResponse.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .title(course.getTitle())
                .description(course.getDescription())
                .courseFee(course.getCourseFee())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .maxStudents(course.getMaxStudents())
                .categoryName(course.getCategory() != null ? course.getCategory().getCategoryName() : null)
                .venueName(course.getVenue() != null ? course.getVenue().getVenueName() : null)
                .build();
    }
}