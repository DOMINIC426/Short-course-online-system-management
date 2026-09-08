package com.scms.service.student;

import com.scms.dto.student.CourseDetailResponse;
import com.scms.dto.student.CourseResponse;
import com.scms.dto.student.PaginatedResponse;
import com.scms.entity.ShortCourse;
import com.scms.entity.enums.CourseStatus;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.student.StudentCourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentCourseService {

    private final StudentCourseRepository courseRepository;

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "publicCourses", key = "#page + '-' + #size + '-' + #sortBy + '-' + (#categoryId != null && #categoryId > 0 ? #categoryId : 'all') + '-' + (#keyword != null ? #keyword.trim().toLowerCase() : '')")
    public PaginatedResponse<CourseResponse> getPublicCourses(
            int page, int size, String sortBy, Long categoryId, String keyword) {

        List<CourseStatus> publicStatuses = List.of(CourseStatus.PUBLISHED, CourseStatus.REGISTRATION_OPEN);
        Pageable pageable = PageRequest.of(page, size, getSafeSort(sortBy));

        Long effectiveCategoryId = (categoryId != null && categoryId > 0) ? categoryId : null;
        String keywordPattern = (keyword != null && !keyword.isBlank()) ? "%" + keyword.trim() + "%" : null;

        Page<ShortCourse> coursePage =
                courseRepository.findPublicCourses(publicStatuses, effectiveCategoryId, keywordPattern, pageable);

        List<CourseResponse> content = coursePage.getContent().stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<CourseResponse>builder()
                .content(content)
                .page(coursePage.getNumber())
                .size(coursePage.getSize())
                .totalElements(coursePage.getTotalElements())
                .totalPages(coursePage.getTotalPages())
                .last(coursePage.isLast())
                .first(coursePage.isFirst())
                .build();
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "courseDetail", key = "#courseId")
    public CourseDetailResponse getCourseDetail(Long courseId) {
        ShortCourse course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        return mapToDetailResponse(course);
    }

    private Sort getSafeSort(String sortBy) {
        return switch (sortBy != null ? sortBy : "title") {
            case "courseFee" -> Sort.by("courseFee").ascending();
            case "startDate" -> Sort.by("startDate").ascending();
            case "courseCode" -> Sort.by("courseCode").ascending();
            default -> Sort.by("title").ascending();
        };
    }

    private CourseResponse mapToCourseResponse(ShortCourse course) {
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

    private CourseDetailResponse mapToDetailResponse(ShortCourse course) {
        String instructorNames = ""; // placeholder until relationship is available

        return CourseDetailResponse.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .title(course.getTitle())
                .description(course.getDescription())
                .categoryName(course.getCategory() != null ? course.getCategory().getCategoryName() : null)
                .categoryDescription(course.getCategory() != null ? course.getCategory().getDescription() : null)
                .courseFee(course.getCourseFee())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .regOpenDate(course.getRegOpenDate())
                .regCloseDate(course.getRegCloseDate())
                .maxStudents(course.getMaxStudents())
                .venueName(course.getVenue() != null ? course.getVenue().getVenueName() : null)
                .instructorNames(instructorNames)
                .build();
    }
}
