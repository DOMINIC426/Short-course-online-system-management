package com.scms.repository.student;

import com.scms.entity.PaymentTransaction;
import com.scms.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentPaymentRepository extends JpaRepository<PaymentTransaction, Long> {

    @Query("""
            SELECT pt FROM PaymentTransaction pt
            JOIN pt.enrollment e
            JOIN e.student s
            WHERE s = :student
            ORDER BY pt.paymentDate DESC
            """)
    List<PaymentTransaction> findAllByStudent(@Param("student") Student student);
}