package com.scms.service.student;

import com.scms.dto.student.StudentProfileResponse;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public StudentProfileResponse getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return StudentProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .levelOfEducation(student.getLevelOfEducation())
                .nationality(student.getNationality())
                .identificationNumber(student.getIdentificationNumber())
                .role(user.getRole())
                .build();
    }
}
