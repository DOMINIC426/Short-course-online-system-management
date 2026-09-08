package com.scms.service.admin;

import com.scms.dto.admin.AssignRoleRequest;
import com.scms.dto.admin.CreateUserRequest;
import com.scms.dto.admin.ResetPasswordRequest;
import com.scms.dto.admin.UpdateUserRequest;
import com.scms.dto.admin.UserResponse;

import java.util.List;

public interface AdminService {

    UserResponse createUser(CreateUserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UpdateUserRequest request);

    UserResponse activateUser(Long id);

    UserResponse deactivateUser(Long id);

    void resetPassword(Long id, ResetPasswordRequest request);

    UserResponse assignRole(Long id, AssignRoleRequest request);
}