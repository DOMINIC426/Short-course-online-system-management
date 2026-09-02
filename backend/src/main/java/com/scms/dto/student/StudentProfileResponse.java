package com.scms.dto.student;

import com.scms.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfileResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String levelOfEducation;
    private String nationality;
    private String identificationNumber;
    private Role role;
}
