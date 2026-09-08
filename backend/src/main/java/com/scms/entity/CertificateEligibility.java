package com.scms.entity;

import com.scms.entity.enums.CertificateStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "certificate_eligibility",
        uniqueConstraints = @UniqueConstraint(name = "uk_cert_enrollment", columnNames = "enrollment_id"),
        indexes = {
                @Index(name = "idx_cert_enrollment", columnList = "enrollment_id"),
                @Index(name = "idx_cert_status", columnList = "status")
        })
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class CertificateEligibility extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false, unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private CourseEnrollment enrollment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CertificateStatus status = CertificateStatus.PENDING;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Instructor updatedBy;
}