package com.scms.service.admin;

import com.scms.dto.admin.StudentResponse;
import com.scms.entity.enums.UserStatus;

import java.util.List;

public interface AdminStudentService {

    List<StudentResponse> getAllStudents();

    StudentResponse getStudentById(Long id);

    List<StudentResponse> searchStudents(String search);

    List<StudentResponse> getStudentsByStatus(UserStatus status);

    StudentResponse activateStudent(Long id);

    StudentResponse deactivateStudent(Long id);
}