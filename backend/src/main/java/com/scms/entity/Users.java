package com.scms.entity;

import com.scms.entity.enums.Role;
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
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false)
    private String firstName;
    @Column(nullable=false)
    private String lastName;
    @Column(nullable=false,unique=true)
    private String email;
    @Column(nullable=false)
    @Enumerated(EnumType.STRING)
    private Role role;
    @Column(nullable=false)
    private String password;
    @Column(nullable=false)
    private LocalDate createdAt;
    private LocalDate updatedAt;


    //hey people add below here your relationship entities relate to user




}
