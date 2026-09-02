package com.scms.repository.student;

import com.scms.entity.Student;
import com.scms.entity.Users;
import com.scms.entity.enums.UserStatus;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUser(Users user);

    @Query("""
            SELECT s
            FROM Student s
            JOIN FETCH s.user u
            ORDER BY s.createdAt DESC
            """)
    List<Student> findAllStudents();

    @Query("""
            SELECT s
            FROM Student s
            JOIN FETCH s.user u
            WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
               OR u.phone LIKE CONCAT('%', :search, '%')
            ORDER BY s.createdAt DESC
            """)
    List<Student> searchStudents(@Param("search") String search);

    @Query("""
            SELECT s
            FROM Student s
            JOIN FETCH s.user u
            WHERE u.status = :status
            ORDER BY s.createdAt DESC
            """)
    List<Student> findStudentsByStatus(
            @Param("status") UserStatus status
    );

    @Query("""
            SELECT s
            FROM Student s
            JOIN FETCH s.user u
            WHERE s.id = :id
            """)
    Optional<Student> findStudentWithUserById(
            @Param("id") Long id
    );
    boolean existsByUserId(Long userId);
}