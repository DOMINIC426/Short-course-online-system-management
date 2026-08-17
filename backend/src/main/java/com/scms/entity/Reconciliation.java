// Reconciliation.java
package com.scms.entity;

import com.scms.entity.enums.ReconciliationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reconciliations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reconciliation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private Payment payment;

    @Column(name = "reconciliation_reference", unique = true)
    private String reconciliationReference;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private ReconciliationStatus status = ReconciliationStatus.PENDING_REVIEW;

    @Column(name = "reconciled_at")
    private LocalDateTime reconciledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciled_by")
    private Users reconciledBy;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
