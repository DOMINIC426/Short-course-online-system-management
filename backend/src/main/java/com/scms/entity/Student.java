package com.scms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Student extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Users user;

    @Column(name = "level_of_education", length = 100)
    private String levelOfEducation;

    @Column(name = "nationality", length = 100)
    private String nationality;

    @Column(name = "identification_number", length = 50)
    private String identificationNumber;
}