package com.scms.dto;

import com.scms.entity.enums.AudienceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class InstructorAnnouncementRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    @NotNull
    private AudienceType audienceType;

    private List<Long> selectedStudentIds;

    private LocalDateTime expiryDate;
}
