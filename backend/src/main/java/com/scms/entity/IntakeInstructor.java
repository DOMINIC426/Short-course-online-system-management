package com.scms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "intake_instructors")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class IntakeInstructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intake_id", nullable = false)
    private CourseIntake courseIntake;

    // Assuming an Instructor entity exists elsewhere in your application
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private Instructor instructor;

    private String role;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
}
