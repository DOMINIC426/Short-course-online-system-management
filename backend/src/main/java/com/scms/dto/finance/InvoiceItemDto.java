package com.scms.dto.finance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemDto {

    @NotBlank(message = "Item description detail cannot be empty")
    private String description;

    @NotNull(message = "Item quantity count is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;

    @NotNull(message = "Unit base price value is required")
    @Positive(message = "Unit base price value must be positive")
    private BigDecimal unitAmount;
}
