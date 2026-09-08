package com.scms.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePermissionRequest {

    @NotBlank(message = "Permission name is required")
    @Size(
            min = 2,
            max = 100,
            message = "Permission name must be between 2 and 100 characters"
    )
    private String name;

    @Size(
            max = 500,
            message = "Description must not exceed 500 characters"
    )
    private String description;
}