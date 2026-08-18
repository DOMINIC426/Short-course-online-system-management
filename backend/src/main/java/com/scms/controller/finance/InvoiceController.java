package com.scms.controller.finance;

import com.scms.dto.finance.InvoiceRequestDto;
import com.scms.entity.Invoice;
import com.scms.entity.InvoiceItem;
import com.scms.service.finance.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "1. Invoice Management", description = "Endpoints for the Finance Officer and Administrator to generate, calculate, and audit system student billing records.")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final ModelMapper modelMapper;

    /**
     * POST /api/v1/invoices
     * Generates a calculated ledger invoice for a student.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    @Operation(
            summary = "Generate a New Student Invoice",
            description = "Accepts a list of line items, maps them to entity structures via ModelMapper, computes the financial subtotal/balance metrics automatically, and saves a concurrency-safe ledger invoice."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Invoice successfully calculated and generated",
                    content = @Content(schema = @Schema(implementation = Invoice.class))),
            @ApiResponse(responseCode = "400", description = "Invalid payload body constraints or mismatched parameter structures", content = @Content),
            @ApiResponse(responseCode = "401", description = "Missing or malformed bearer JWT authentication token", content = @Content),
            @ApiResponse(responseCode = "403", description = "Access denied: Insufficient role permissions (Requires ADMIN or FINANCE_OFFICER)", content = @Content)
    })
    public ResponseEntity<Invoice> generateInvoice(@Valid @RequestBody InvoiceRequestDto request) {

        // Use ModelMapper to transform incoming DTOs to JPA domain items automatically
        List<InvoiceItem> domainItems = request.getItems().stream()
                .map(dto -> modelMapper.map(dto, InvoiceItem.class))
                .collect(Collectors.toList());

        // Call our core calculation service engine block
        Invoice savedInvoice = invoiceService.createInvoice(
                request.getStudentId(),
                request.getIntakeId(),
                domainItems,
                request.getNotes()
        );

        return new ResponseEntity<>(savedInvoice, HttpStatus.CREATED);
    }

    /**
     * GET /api/v1/invoices/{id}
     * Retrieves full record details of an individual invoice.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER', 'STUDENT')")
    @Operation(
            summary = "Fetch Detailed Invoice Summary",
            description = "Retrieves complete relational field attributes, audited line items, and real-time outstanding balances for an isolated invoice ID node."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Invoice record successfully located and returned",
                    content = @Content(schema = @Schema(implementation = Invoice.class))),
            @ApiResponse(responseCode = "401", description = "Missing or malformed bearer JWT authentication token", content = @Content),
            @ApiResponse(responseCode = "404", description = "Target invoice record could not be found with the provided identifier", content = @Content)
    })
    public ResponseEntity<Invoice> getInvoiceDetails(
            @Parameter(description = "The database primary key index ID of the target invoice row", required = true, example = "1")
            @PathVariable Long id) {
        return invoiceService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/invoices
     * Lists system invoices using performance-optimized pagination and sorting configurations.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    @Operation(
            summary = "List All System Invoices (Paginated & Sorted)",
            description = "Fetches a high-performance paginated window of historical system invoices wrapped inside a metadata data-grid block to support optimized frontend rendering."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paginated array page envelope successfully compiled and returned"),
            @ApiResponse(responseCode = "401", description = "Missing or malformed bearer JWT authentication token", content = @Content),
            @ApiResponse(responseCode = "403", description = "Access denied: Insufficient role permissions", content = @Content)
    })
    public ResponseEntity<Page<Invoice>> getAllSystemInvoices(
            @Parameter(description = "The zero-based page block index to retrieve from the cluster segment", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "The total absolute elements count capacity limit to capture inside a single page", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "The target database column field configuration name to sort the result data structure on", example = "createdAt")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "The directional alignment order strategy for sorting data rows", example = "desc")
            @RequestParam(defaultValue = "desc") String direction) {

        Page<Invoice> paginatedInvoices = invoiceService.getAllInvoicesPaginated(page, size, sortBy, direction);
        return ResponseEntity.ok(paginatedInvoices);
    }
}
