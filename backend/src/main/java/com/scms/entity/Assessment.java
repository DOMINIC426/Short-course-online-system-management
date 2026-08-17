// Assessment.java
package com.scms.entity;

import com.scms.entity.enums.AssessmentStatus;
import com.scms.entity.enums.AssessmentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "intake_id", nullable = false)
    private CourseIntake courseIntake;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "assessment_type")
    private AssessmentType assessmentType;

    @Column(name = "max_score")
    private BigDecimal maxScore;

    private BigDecimal weight;

    @Column(name = "pass_mark")
    private BigDecimal passMark;

    @Column(name = "assessment_date")
    private LocalDate assessmentDate;

    @Enumerated(EnumType.STRING)
    private AssessmentStatus status = AssessmentStatus.DRAFT;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentResult> results = new ArrayList<>();
}
