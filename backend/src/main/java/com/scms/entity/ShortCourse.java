package com.scms.entity;

import com.scms.entity.enums.CourseStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "short_courses",
        uniqueConstraints = @UniqueConstraint(name = "uk_course_code", columnNames = "course_code"),
        indexes = {
                @Index(name = "idx_courses_status", columnList = "status"),
                @Index(name = "idx_courses_category", columnList = "category_id"),
                @Index(name = "idx_courses_venue", columnList = "venue_id")
        })
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class ShortCourse extends BaseEntity {

    @Column(name = "course_code", nullable = false, unique = true, length = 50)
    private String courseCode;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration", length = 50)
    private String duration;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "reg_open_date")
    private LocalDate regOpenDate;

    @Column(name = "reg_close_date")
    private LocalDate regCloseDate;

    @Column(name = "course_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal courseFee;

    @Column(name = "max_students")
    private Integer maxStudents;

    @Column(name = "min_students")
    private Integer minStudents;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CourseStatus status = CourseStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private CourseCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    private Users createdBy;
}