package com.scms.repository;

import com.scms.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByCreatedAtDesc();

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AuditLog> findByEntityOrderByCreatedAtDesc(String entity);

    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);

    List<AuditLog> findByEntityAndEntityIdOrderByCreatedAtDesc(
            String entity,
            Long entityId
    );
}