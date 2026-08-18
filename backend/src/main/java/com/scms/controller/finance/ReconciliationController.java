package com.scms.controller.finance;

import com.scms.entity.Reconciliation;
import com.scms.entity.enums.ReconciliationStatus;
import com.scms.service.finance.ReconciliationService;
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

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/reconciliations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "6. Bank Reconciliation Core", description = "Endpoints for financial auditing teams to match database payment transactions directly against statement records.")
public class ReconciliationController {

    private final ReconciliationService reconciliationService;

    /**
     * POST /api/v1/reconciliations/match
     * Executes the transaction audit validation matrix matching workflow parameters.
     */
    @PostMapping("/match")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    @Operation(summary = "Perform Bank Statement Verification Match", description = "Compares database transaction references and amounts against incoming statement parameters, flagging cash value discrepancies dynamically.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Verification comparison processed and ledger file registered successfully"),
            @ApiResponse(responseCode = "400", description = "This transaction row identifier index has already undergone reconciliation checking entries")
    })
    public ResponseEntity<Reconciliation> processVerificationMatch(
            @RequestParam Long paymentId,
            @Parameter(description = "The authoritative statement unique reference provided by the external clearing house", example = "BANK-TXN-99823")
            @RequestParam String bankReference,
            @RequestParam BigDecimal bankReportedAmount,
            @RequestParam(required = false) String notes) {

        Reconciliation auditLog = reconciliationService.reconcileTransaction(paymentId, bankReference, bankReportedAmount, notes);
        return new ResponseEntity<>(auditLog, HttpStatus.CREATED);
    }

    /**
     * PUT /api/v1/reconciliations/override/{id}
     * Applies an adjustments change log override block to a discrepancy.
     */
    @PutMapping("/override/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    @Operation(summary = "Apply Traceable Resolution to an Accounting Discrepancy", description = "Overrides a flagged accounting difference item manually with a required authorization log track path trace entry.")
    public ResponseEntity<Reconciliation> resolveFlaggedDiscrepancy(
            @PathVariable Long id,
            @RequestParam String resolutionReason) {

        Reconciliation updatedLog = reconciliationService.resolveDiscrepancyOverride(id, resolutionReason);
        return ResponseEntity.ok(updatedLog);
    }

    /**
     * GET /api/v1/reconciliations/volume-totals
     * Obtains aggregated accounting figures from authoritative metadata records.
     */
    @GetMapping("/volume-totals")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    @Operation(summary = "Calculate Authoritative Financial Status Totals", description = "Sums up total cleared volume numbers straight from actual verified transaction line structures according to strict accounting auditing compliance guidelines.")
    public ResponseEntity<BigDecimal> queryAuthoritativeVolumeTotals(@RequestParam ReconciliationStatus status) {
        return ResponseEntity.ok(reconciliationService.getAuthoritativeTotalVolume(status));
    }
}
