package com.scms.entity;

import com.scms.entity.enums.PaymentMethod;
import com.scms.entity.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions",
        indexes = {
                @Index(name = "idx_pay_enrollment", columnList = "enrollment_id"),
                @Index(name = "idx_pay_control_number", columnList = "control_number"),
                @Index(name = "idx_pay_date", columnList = "payment_date")
        })
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class PaymentTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private CourseEnrollment enrollment;

    @Column(name = "control_number", nullable = false, length = 50)
    private String controlNumber;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private TransactionStatus paymentStatus = TransactionStatus.PENDING;

    @Column(name = "external_transaction_id", length = 100)
    private String externalTransactionId;
}