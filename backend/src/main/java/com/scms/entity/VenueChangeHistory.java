package com.scms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "venue_change_history",
        indexes = {
                @Index(name = "idx_venue_history_course", columnList = "course_id"),
                @Index(name = "idx_venue_history_changed_by", columnList = "changed_by")
        })
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class VenueChangeHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ShortCourse course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_venue_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Venue oldVenue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_venue_id", nullable = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    private Venue newVenue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    private Instructor changedBy;

    @Column(name = "change_date", nullable = false)
    private LocalDateTime changeDate = LocalDateTime.now();

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;
}