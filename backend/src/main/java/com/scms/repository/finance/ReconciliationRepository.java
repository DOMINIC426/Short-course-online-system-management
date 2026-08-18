package com.scms.repository.finance;

import com.scms.entity.Reconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ReconciliationRepository extends JpaRepository<Reconciliation, Long> {

    Optional<Reconciliation> findByReconciliationReference(String reconciliationReference);
    Optional<Reconciliation> findByPaymentId(Long paymentId);

    /**
     * BR-FIN-005 Rule: Compute financial totals straight from authoritative matching rows
     * instead of relying on fragile summary cache properties.
     */
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Reconciliation r WHERE r.status = :status")
    BigDecimal calculateAuthoritativeTotalByStatus(@Param("status") String status);
}
