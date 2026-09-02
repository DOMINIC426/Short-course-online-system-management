package com.scms.service.student;

import com.scms.dto.student.StudentCertificateResponse;
import com.scms.entity.CertificateEligibility;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentCertificateRepository;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentCertificateService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentCertificateRepository certificateRepository;

    @Transactional(readOnly = true)
    public List<StudentCertificateResponse> getMyCertificates() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        List<CertificateEligibility> certificates = certificateRepository.findAllForStudent(student);

        return certificates.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StudentCertificateResponse mapToResponse(CertificateEligibility cert) {
        return StudentCertificateResponse.builder()
                .certificateId(cert.getId())
                .enrollmentId(cert.getEnrollment().getId())
                .courseId(cert.getEnrollment().getCourse().getId())
                .courseTitle(cert.getEnrollment().getCourse().getTitle())
                .status(cert.getStatus())
                .reason(cert.getReason())
                .build();
    }
}