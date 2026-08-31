package com.scms.service.student;

import com.scms.dto.student.PaginatedResponse;
import com.scms.dto.student.StudentAnnouncementResponse;
import com.scms.entity.Announcement;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentAnnouncementRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentAnnouncementService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentAnnouncementRepository announcementRepository;

    @Transactional(readOnly = true)
    public PaginatedResponse<StudentAnnouncementResponse> getMyAnnouncements(int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Announcement> announcementPage = announcementRepository.findAllForStudent(student, pageable);

        List<StudentAnnouncementResponse> content = announcementPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<StudentAnnouncementResponse>builder()
                .content(content)
                .page(announcementPage.getNumber())
                .size(announcementPage.getSize())
                .totalElements(announcementPage.getTotalElements())
                .totalPages(announcementPage.getTotalPages())
                .last(announcementPage.isLast())
                .first(announcementPage.isFirst())
                .build();
    }

    private StudentAnnouncementResponse mapToResponse(Announcement announcement) {
        return StudentAnnouncementResponse.builder()
                .announcementId(announcement.getId())
                .courseId(announcement.getCourse().getId())
                .courseTitle(announcement.getCourse().getTitle())
                .title(announcement.getTitle())
                .message(announcement.getMessage())
                .createdDate(announcement.getCreatedAt())
                .build();
    }
}