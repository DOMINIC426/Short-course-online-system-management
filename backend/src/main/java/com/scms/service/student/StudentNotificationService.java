package com.scms.service.student;

import com.scms.dto.student.StudentNotificationResponse;
import com.scms.entity.Notification;
import com.scms.entity.Users;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentNotificationService {

    private final UserRepository userRepository;
    private final StudentNotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<StudentNotificationResponse> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);

        return notifications.stream()
                .map(n -> StudentNotificationResponse.builder()
                        .notificationId(n.getId())
                        .message(n.getMessage())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}