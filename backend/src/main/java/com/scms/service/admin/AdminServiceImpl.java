package com.scms.service.admin;

import com.scms.entity.Student;
import com.scms.entity.enums.Role;
import com.scms.repository.student.StudentRepository;
import com.scms.dto.admin.AssignRoleRequest;
import com.scms.dto.admin.CreateUserRequest;
import com.scms.dto.admin.ResetPasswordRequest;
import com.scms.dto.admin.UpdateUserRequest;
import com.scms.dto.admin.UserResponse;
import com.scms.entity.Users;
import com.scms.entity.enums.UserStatus;
import com.scms.exception.UserAlreadyExistException;
import com.scms.exception.UserNotFoundException;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Override
    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistException(
                    "User with this email already exists"
            );
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new UserAlreadyExistException(
                    "User with this phone already exists"
            );
        }

        Users user = Users.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(
                        passwordEncoder.encode(request.getPassword())
                )
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        Users savedUser = userRepository.save(user);
        ensureStudentProfile(savedUser);
        auditLogService.log(
                "CREATE",
                "USER",
                savedUser.getId(),
                null,
                savedUser.getEmail()
        );

        return mapToResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {

        Users user = findUser(id);

        return mapToResponse(user);
    }

    @Override
    public UserResponse updateUser(
            Long id,
            UpdateUserRequest request
    ) {

        Users user = findUser(id);

        if (userRepository.existsByEmailAndIdNot(
                request.getEmail(),
                id
        )) {
            throw new UserAlreadyExistException(
                    "Another user with this email already exists"
            );
        }

        if (userRepository.existsByPhoneAndIdNot(
                request.getPhone(),
                id
        )) {
            throw new UserAlreadyExistException(
                    "Another user with this phone already exists"
            );
        }

        /*
         * Store old values before updating the user.
         * Password is intentionally not included.
         */
        String oldValue =
                "firstName=" + user.getFirstName() +
                ", lastName=" + user.getLastName() +
                ", email=" + user.getEmail() +
                ", phone=" + user.getPhone() +
                ", role=" + user.getRole();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());

        Users updatedUser = userRepository.save(user);

        ensureStudentProfile(updatedUser);

        String newValue =
                "firstName=" + updatedUser.getFirstName() +
                ", lastName=" + updatedUser.getLastName() +
                ", email=" + updatedUser.getEmail() +
                ", phone=" + updatedUser.getPhone() +
                ", role=" + updatedUser.getRole();

        auditLogService.log(
                "UPDATE",
                "USER",
                updatedUser.getId(),
                oldValue,
                newValue
        );

        return mapToResponse(updatedUser);
    }

    @Override
    public UserResponse activateUser(Long id) {

        Users user = findUser(id);

        String oldValue = "status=" + user.getStatus();

        user.setStatus(UserStatus.ACTIVE);

        Users updatedUser = userRepository.save(user);

        auditLogService.log(
                "ACTIVATE",
                "USER",
                updatedUser.getId(),
                oldValue,
                "status=" + updatedUser.getStatus()
        );

        return mapToResponse(updatedUser);
    }

    @Override
    public UserResponse deactivateUser(Long id) {

        Users user = findUser(id);

        String oldValue = "status=" + user.getStatus();

        user.setStatus(UserStatus.INACTIVE);

        Users updatedUser = userRepository.save(user);

        auditLogService.log(
                "DEACTIVATE",
                "USER",
                updatedUser.getId(),
                oldValue,
                "status=" + updatedUser.getStatus()
        );

        return mapToResponse(updatedUser);
    }

    @Override
    public void resetPassword(
            Long id,
            ResetPasswordRequest request
    ) {

        Users user = findUser(id);

        /*
         * Password values are never stored in audit logs.
         */
        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        auditLogService.log(
                "RESET_PASSWORD",
                "USER",
                user.getId()
        );
    }

    @Override
    public UserResponse assignRole(
            Long id,
            AssignRoleRequest request
    ) {

        Users user = findUser(id);

        String oldRole = user.getRole() != null
                ? user.getRole().name()
                : null;

        user.setRole(request.getRole());

        Users updatedUser = userRepository.save(user);

        ensureStudentProfile(updatedUser);

        auditLogService.log(
                "ASSIGN_ROLE",
                "USER",
                updatedUser.getId(),
                "role=" + oldRole,
                "role=" + updatedUser.getRole()
        );

        return mapToResponse(updatedUser);
    }
  private void ensureStudentProfile(Users user) {

    if (user.getRole() != Role.STUDENT) {
        return;
    }

    if (studentRepository.existsByUserId(user.getId())) {
        return;
    }

    Student student = Student.builder()
            .user(user)
            .build();

    studentRepository.save(student);
}

private Users findUser(Long id) {

    return userRepository.findById(id)
            .orElseThrow(() ->
                    new UserNotFoundException(
                            "User not found with id: " + id
                    )
            );
}
    
    private UserResponse mapToResponse(Users user) {

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}