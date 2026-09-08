package com.scms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "venues",
        uniqueConstraints = @UniqueConstraint(name = "uk_venue_name", columnNames = "venue_name"))
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Venue extends BaseEntity {

    @Column(name = "venue_name", nullable = false, unique = true, length = 150)
    private String venueName;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "location", length = 255)
    private String location;
}