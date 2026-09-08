package com.scms.repository;

import com.scms.entity.CertificateEligibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CertificateEligibilityRepository
        extends JpaRepository<CertificateEligibility, Long> {

    Optional<CertificateEligibility> findByEnrollment_Id(Long enrollmentId);
}
