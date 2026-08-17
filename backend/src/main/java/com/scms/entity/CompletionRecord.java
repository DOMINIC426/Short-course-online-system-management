
package com.scms.entity;

import com.scms.entity.enums.EligibilityStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "completion_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompletionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(name = "attendance_eligible", nullable = false)
    private boolean attendanceEligible;

    @Column(name = "assessment_eligible", nullable = false)
    private boolean assessmentEligible;

    @Column(name = "payment_eligible", nullable = false)
    private boolean paymentEligible;

    @Column(name = "document_eligible", nullable = false)
    private boolean documentEligible;

    @Column(name = "overall_eligible", nullable = false)
    private boolean overallEligible;

    @Enumerated(EnumType.STRING)
    private EligibilityStatus status = EligibilityStatus.PENDING;

    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluated_by")
    private Users evaluatedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
