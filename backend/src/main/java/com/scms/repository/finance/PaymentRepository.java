package com.scms.repository.finance;

import com.scms.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Object> findByPaymentReferenceId(String paymentReferenceId);
}
