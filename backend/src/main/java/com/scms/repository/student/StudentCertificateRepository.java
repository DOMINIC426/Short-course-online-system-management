package com.scms.repository.student;

import com.scms.entity.CertificateEligibility;
import com.scms.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCertificateRepository extends JpaRepository<CertificateEligibility, Long> {

    @Query("""
            SELECT ce FROM CertificateEligibility ce
            JOIN ce.enrollment e
            WHERE e.student = :student
            ORDER BY ce.updatedAt DESC
            """)
    List<CertificateEligibility> findAllForStudent(@Param("student") Student student);
}