package com.scms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Instructor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long instructorId;
    @Column(nullable = false)
    private String expertise;
    @Column(nullable = false)
    private String qualification;
    @Column(nullable = false)
    private LocalDate createdAt;

    //relationships
    @OneToOne()
    @JoinColumn(name = "userId")
    private Users users;


}
