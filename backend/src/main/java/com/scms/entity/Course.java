package com.scms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    @Column(nullable = false, unique = true)
    private String courseCode;

    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String objectives;

    @Column(nullable = false)
    private String targetAudience;

    @Column(nullable = false)
    private String prerequisite; // Fixed typo from preRequest

    @Column(nullable = false)
    private BigDecimal durationValue;

    @Column(nullable = false)
    private String durationUnit;

    @Column(nullable = false)
    private BigDecimal trainingHours;

    @Column(nullable = false)
    private String deliverableMode;

    @Column(nullable = false)
    private BigDecimal defaultFee;

    @Column(nullable = false)
    private String certificatePolicy;

    @Column(nullable = false)
    private BigDecimal passMark;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // RELATIONSHIP
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CourseCategory category;
}
