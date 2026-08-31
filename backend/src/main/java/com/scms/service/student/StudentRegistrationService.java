package com.scms.service.student;

import com.scms.dto.student.StudentRegisterRequest;
import com.scms.dto.student.StudentRegisterResponse;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.entity.enums.Role;
import com.scms.entity.enums.UserStatus;
import com.scms.exception.UserAlreadyExistException;
import com.scms.repository.UserRepository;
import com.scms.repository.student.StudentRepository;
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

    @Transactional
    public StudentRegisterResponse register(StudentRegisterRequest request) {
        // Check if email already exists
        Optional<Users> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new UserAlreadyExistException("User with email " + request.getEmail() + " already exists");
        }

        // Create user account
        Users user = Users.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();

        Users savedUser = userRepository.save(user);

        // Create student profile linked to user
        Student student = Student.builder()
                .user(savedUser)
                .build();
        studentRepository.save(student);

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