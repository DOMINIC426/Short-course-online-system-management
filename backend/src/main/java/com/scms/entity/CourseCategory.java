package com.scms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "course_categories",
        uniqueConstraints = @UniqueConstraint(name = "uk_category_name", columnNames = "category_name"))
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class CourseCategory extends BaseEntity {

    @Column(name = "category_name", nullable = false, unique = true, length = 100)
    private String categoryName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}