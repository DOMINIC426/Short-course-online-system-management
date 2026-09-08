package com.scms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "course_progress",
        indexes = @Index(name = "idx_course_progress_course", columnList = "course_id"))
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class CourseProgress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ShortCourse course;

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage;

    @Column(name = "topics_completed", columnDefinition = "TEXT")
    private String topicsCompleted;

    @Column(name = "topics_remaining", columnDefinition = "TEXT")
    private String topicsRemaining;

    @Column(name = "challenges", columnDefinition = "TEXT")
    private String challenges;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Instructor updatedBy;
}