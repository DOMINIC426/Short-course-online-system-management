// InvoiceDiscount.java
package com.scms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDiscount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    // Temporary basic generic reference for discount relationship integrity
    @Column(name = "discount_id", nullable = false)
    private Long discountId;

    @Column(nullable = false)
    private BigDecimal amount;
}
