package com.scms.repository;

import com.scms.entity.PasswordResetRequest;
import com.scms.entity.Users;
import com.scms.entity.enums.PasswordResetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {

    Optional<PasswordResetRequest> findTopByUserAndStatusOrderByCreatedAtDesc(Users user, PasswordResetStatus status);

    Optional<PasswordResetRequest> findByResetTokenHash(String resetTokenHash);

    long countByUserAndCreatedAtAfter(Users user, LocalDateTime after);

    Optional<PasswordResetRequest> findFirstByUserOrderByCreatedAtDesc(Users user);
}