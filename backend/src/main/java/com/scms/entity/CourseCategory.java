package com.scms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CourseCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // RELATIONSHIP
    @OneToMany(mappedBy = "category", orphanRemoval = true, fetch = FetchType.LAZY, cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    private Set<Course> courses = new HashSet<>();

    public void addCourse(Course course) {
        if (course != null) {
            this.courses.add(course);
            course.setCategory(this);
        }
    }

    public void removeCourse(Course course) {
       if(course!=null){
           this.courses.remove(course);
           course.setCategory(null);
       }
    }

}
