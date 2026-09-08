package com.scms.service.admin;

import com.scms.dto.admin.StudentResponse;
import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.entity.enums.UserStatus;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminStudentServiceImpl implements AdminStudentService {

    private final StudentRepository studentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getAllStudents() {

        return studentRepository.findAllStudents()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getStudentById(Long id) {

        Student student = findStudent(id);

        return mapToResponse(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> searchStudents(String search) {

        if (search == null || search.trim().isEmpty()) {
            return getAllStudents();
        }

        return studentRepository.searchStudents(search.trim())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsByStatus(
            UserStatus status
    ) {

        return studentRepository.findStudentsByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public StudentResponse activateStudent(Long id) {

        Student student = findStudent(id);

        Users user = student.getUser();

        user.setStatus(UserStatus.ACTIVE);

        return mapToResponse(student);
    }

    @Override
    public StudentResponse deactivateStudent(Long id) {

        Student student = findStudent(id);

        Users user = student.getUser();

        user.setStatus(UserStatus.INACTIVE);

        return mapToResponse(student);
    }

    private Student findStudent(Long id) {

        return studentRepository
                .findStudentWithUserById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with id: " + id
                        )
                );
    }

    private StudentResponse mapToResponse(Student student) {

        Users user = student.getUser();

        return StudentResponse.builder()
                .studentId(student.getId())
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }
}