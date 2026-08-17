// Receipt.java
package com.scms.entity;

import com.scms.entity.enums.ReceiptStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "receipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(name = "receipt_number", nullable = false, unique = true)
    private String receiptNumber;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Enumerated(EnumType.STRING)
    private ReceiptStatus status = ReceiptStatus.ISSUED;
}
