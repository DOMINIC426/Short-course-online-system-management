package com.scms.entity;

import com.scms.entity.enums.WaitingListStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "waiting_lists")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WaitingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intake_id", nullable = false)
    private CourseIntake courseIntake;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    private Integer position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WaitingListStatus status;

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    @Column(name = "removed_at")
    private LocalDateTime removedAt;
}
