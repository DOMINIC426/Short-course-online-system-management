package com.scms.dto.finance;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequestDto {

    @NotNull(message = "Student ID selection is mandatory")
    private Long studentId;

    private Long intakeId;

    @NotNull(message = "Invoice must contain at least one line item breakdown")
    @Size(min = 1, message = "Invoice must contain at least one line item breakdown")
    private List<InvoiceItemDto> items;

    private String notes;
}
