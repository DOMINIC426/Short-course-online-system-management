// Certificate.java
package com.scms.entity;

import com.scms.entity.enums.CertificateStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private CertificateTemplate template;

    @Column(name = "certificate_number", nullable = false, unique = true)
    private String certificateNumber;

    @Column(name = "verification_code", nullable = false, unique = true)
    private String verificationCode;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;

    @Enumerated(EnumType.STRING)
    private CertificateStatus status = CertificateStatus.DRAFT;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revoked_by")
    private Users revokedBy;

    @Column(name = "revocation_reason", columnDefinition = "TEXT")
    private String revocationReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replaced_certificate_id")
    private Certificate replacedCertificate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
