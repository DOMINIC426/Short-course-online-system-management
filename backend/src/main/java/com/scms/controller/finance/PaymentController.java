package com.scms.controller.finance;

import com.scms.dto.finance.PaymentRequestDto;
import com.scms.entity.Payment;
import com.scms.service.finance.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "2. Payment Processing", description = "Endpoints for the Finance Officer to record transactions, validate reference IDs, and trigger automated receipt tracking.")
public class PaymentController {

    private final PaymentService paymentService;
    private final ModelMapper modelMapper;

    /**
     * POST /api/v1/payments
     * Outer Gate: Processes a verified incoming student payment transaction.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    @Operation(
            summary = "Record and Verify a Student Payment",
            description = "Processes a verified financial transaction, performs strict reference check deduplication, creates the ledger payment record, and dynamically triggers an official automated receipt asset."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Payment processed successfully and receipt tracking established",
                    content = @Content(schema = @Schema(implementation = Payment.class))),
            @ApiResponse(responseCode = "400", description = "Duplicate reference ID detected or payload constraints validation error", content = @Content),
            @ApiResponse(responseCode = "403", description = "Access Denied: Requires ADMIN or FINANCE_OFFICER roles", content = @Content)
    })
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody PaymentRequestDto requestDto) {

        // Use ModelMapper to transition clean input to our standard entity
        Payment paymentEntity = modelMapper.map(requestDto, Payment.class);

        Payment savedPayment = paymentService.recordPayment(requestDto.getStudentId(), paymentEntity);

        return new ResponseEntity<>(savedPayment, HttpStatus.CREATED);
    }
}
