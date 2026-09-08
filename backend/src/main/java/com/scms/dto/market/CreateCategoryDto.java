package com.scms.dto.market;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateCategoryDto {
    @NotBlank(message = "Category name is required")
    private String name;
    private String description;
}