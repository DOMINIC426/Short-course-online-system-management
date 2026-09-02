package com.scms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class InstructorProfileResponse {

    private Long instructorId;
    private String firstName;
    private String lastName;
    private String email;
    private String expertise;
    private String qualification;
}
