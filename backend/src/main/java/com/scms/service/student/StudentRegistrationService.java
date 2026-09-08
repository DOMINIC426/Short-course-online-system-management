package com.scms.service.student;

import com.scms.dto.student.StudentRegisterRequest;
import com.scms.dto.student.StudentRegisterResponse;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.entity.enums.Role;
import com.scms.entity.enums.UserStatus;
import com.scms.exception.DuplicateResourceException;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentRepository;
import com.scms.service.admin.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentRegistrationService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional
    public StudentRegisterResponse register(StudentRegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        Optional<Users> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new DuplicateResourceException("User with email " + email + " already exists");
        }

        Users user = Users.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .phone(phone)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();

        Users savedUser = userRepository.save(user);

        Student student = Student.builder()
                .user(savedUser)
                .build();
        Student savedStudent = studentRepository.save(student);

        // Audit log must be before return
        auditLogService.logAction(
                "CREATE",
                "STUDENT",
                savedStudent.getId(),   // now Long if entity uses Long
                null,
                savedUser.getEmail(),
                savedUser
        );

        return StudentRegisterResponse.builder()
                .id(savedUser.getId())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole())
                .build();
    }
}