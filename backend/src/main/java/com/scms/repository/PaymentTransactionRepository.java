package com.scms.repository;

import com.scms.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, Long> {

    List<PaymentTransaction>
    findByEnrollment_IdOrderByPaymentDateDesc(Long enrollmentId);
}
