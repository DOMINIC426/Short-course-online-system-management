package com.scms.service.admin;

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
    private final PasswordEncoder passwordEncoder;

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

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());

        Users updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    @Override
    public UserResponse activateUser(Long id) {

        Users user = findUser(id);

        user.setStatus(UserStatus.ACTIVE);

        Users updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    @Override
    public UserResponse deactivateUser(Long id) {

        Users user = findUser(id);

        user.setStatus(UserStatus.INACTIVE);

        Users updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    @Override
    public void resetPassword(
            Long id,
            ResetPasswordRequest request
    ) {

        Users user = findUser(id);

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);
    }

    @Override
    public UserResponse assignRole(
            Long id,
            AssignRoleRequest request
    ) {

        Users user = findUser(id);

        user.setRole(request.getRole());

        Users updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
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