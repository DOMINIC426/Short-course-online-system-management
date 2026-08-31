package com.scms.service.student;

import com.scms.dto.student.StudentAnnouncementResponse;
import com.scms.entity.Announcement;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentAnnouncementRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
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
    public List<StudentAnnouncementResponse> getMyAnnouncements() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        List<Announcement> announcements = announcementRepository.findAllForStudent(student);

        return announcements.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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