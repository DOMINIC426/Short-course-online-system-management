package com.scms.controller.finance;

import com.scms.entity.Discount;
import com.scms.entity.Invoice;
import com.scms.service.finance.DiscountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/discounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "4. Discounts & Waivers Engine", description = "Endpoints for managing system discount rules and processing invoice deductions.")
public class DiscountController {

    private final DiscountService discountService;

    /**
     * Provisions a new generic discount configuration policy in the system.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    @Operation(summary = "Create a New Discount Policy Rule", description = "Defines system-wide discount criteria (PERCENTAGE or FIXED_AMOUNT) for scholarships or corporate sponsorships.")
    public ResponseEntity<Discount> createPolicy(@RequestBody Discount discount) {
        return new ResponseEntity<>(discountService.createDiscountPolicy(discount), HttpStatus.CREATED);
    }

    /**
     * POST /api/v1/discounts/apply
     * Deducts fees dynamically from an active invoice balance.
     */
    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    @Operation(summary = "Apply a Discount to an Active Invoice", description = "Validates the targeted invoice and discount codes, calculates deduction math variables, and updates current outstanding ledger balances.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Discount applied and invoice totals re-balanced successfully"),
            @ApiResponse(responseCode = "400", description = "Target invoice is already paid/voided or the selected code is invalid/inactive")
    })
    public ResponseEntity<Invoice> applyToInvoice(
            @Parameter(description = "The database primary key ID of the target invoice to reduce", required = true, example = "1")
            @RequestParam Long invoiceId,
            @Parameter(description = "The unique tracking string code configuration name of the policy", required = true, example = "SCHOLARSHIP50")
            @RequestParam String discountCode) {

        Invoice updatedInvoice = discountService.applyDiscountToInvoice(invoiceId, discountCode);
        return ResponseEntity.ok(updatedInvoice);
    }
}
