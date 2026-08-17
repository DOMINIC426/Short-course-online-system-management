package com.scms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "course_intakes")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CourseIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "intake_code", nullable = false, unique = true)
    private String intakeCode;

    @Column(nullable = false)
    private String name;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "registration_deadline")
    private LocalDate registrationDeadline;

    @Column(name = "delivery_mode")
    private String deliveryMode;

    private BigDecimal fee;

    @Column(name = "online_meeting_url")
    private String onlineMeetingUrl;

    private Integer capacity;

    @Column(name = "minimum_enrollment")
    private Integer minimumEnrollment;

    private String location;

    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // RELATIONSHIPS
    @OneToMany(mappedBy = "courseIntake", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<IntakeInstructor> instructors = new HashSet<>();

    // Helper methods for managing bidirectional instructor relationships
    public void addInstructor(IntakeInstructor instructor) {
        if (instructor != null) {
            this.instructors.add(instructor);
            instructor.setCourseIntake(this);
        }
    }

    public void removeInstructor(IntakeInstructor instructor) {
        if (instructor != null) {
            this.instructors.remove(instructor);
            instructor.setCourseIntake(null);
        }
    }
}
