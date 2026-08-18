package com.scms.repository.finance;

import com.scms.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    List<Refund> findByPaymentId(Long paymentId);

    // Dynamic aggregation query to track all processed or pending credit lines against a single source payment transaction
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Refund r WHERE r.payment.id = :paymentId AND r.status != 'REJECTED' AND r.status != 'CANCELLED'")
    BigDecimal getExistingRefundTotalForPayment(@Param("paymentId") Long paymentId);
}
