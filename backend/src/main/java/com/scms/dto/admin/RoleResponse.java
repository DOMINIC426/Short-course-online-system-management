package com.scms.dto.admin;

import com.scms.entity.enums.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoleResponse {

    private Role role;

    private String name;

    private String description;
}