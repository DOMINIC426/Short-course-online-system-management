package com.scms.entity;

import com.scms.entity.enums.EnrollmentStatus;
import com.scms.entity.enums.PaymentStatus;
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
@Table(name = "course_enrollments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_enrollment_student_course",
                        columnNames = {"student_id", "course_id"}),
                @UniqueConstraint(name = "uk_enrollment_control_number",
                        columnNames = "control_number")
        },
        indexes = {
                @Index(name = "idx_enroll_student", columnList = "student_id"),
                @Index(name = "idx_enroll_course", columnList = "course_id"),
                @Index(name = "idx_enroll_payment_status", columnList = "payment_status")
        })
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class CourseEnrollment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ShortCourse course;

    @Column(name = "registration_date", nullable = false)
    private LocalDateTime registrationDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_status", nullable = false, length = 20)
    private EnrollmentStatus enrollmentStatus = EnrollmentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "control_number", nullable = false, unique = true, length = 50)
    private String controlNumber;

    @Column(name = "amount_required", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountRequired;

    @Column(name = "amount_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "balance", precision = 10, scale = 2)
    private BigDecimal balance;
}