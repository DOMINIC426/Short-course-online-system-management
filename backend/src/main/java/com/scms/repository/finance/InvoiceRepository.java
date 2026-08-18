package com.scms.repository.finance;

import com.scms.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {


    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);


    @Query("SELECT COALESCE(MAX(i.id), 0) FROM Invoice i")
    Long findMaxId();
}
