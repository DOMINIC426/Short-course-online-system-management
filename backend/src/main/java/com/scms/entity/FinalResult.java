// FinalResult.java
package com.scms.entity;

import com.scms.entity.enums.FinalOutcome;
import com.scms.entity.enums.FinalResultStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "final_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(name = "total_score")
    private BigDecimal totalScore;

    @Column(name = "final_grade")
    private String finalGrade;

    @Enumerated(EnumType.STRING)
    private FinalOutcome outcome;

    @Enumerated(EnumType.STRING)
    private FinalResultStatus status = FinalResultStatus.DRAFT;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Users approvedBy;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by")
    private Users publishedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
