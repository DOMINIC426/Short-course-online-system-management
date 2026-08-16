package com.scms.dto;

import com.scms.entity.enums.LevelOfEducation;
import com.scms.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterUserRequest{
        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
       private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
       private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
       private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
       private String password;

        @NotNull(message = "Role is required")
       private Role role;

        @NotBlank(message = "level of education is required")
    private LevelOfEducation levelOfEducation;

}