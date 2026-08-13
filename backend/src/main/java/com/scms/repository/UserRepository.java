package com.scms.repository;

import com.scms.entity.Users;
import com.scms.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {

    boolean existsByEmail(String email);

    Optional<Users> findByEmail(String email);

    List<Users> findAllByRole(Role role);


    @Query("SELECT u FROM Users u WHERE u.role = :role AND u.email LIKE %:domain%")
    List<Users> findUsersByRoleAndEmailDomain(@Param("role") Role role, @Param("domain") String domain);

    long countByRole(Role role);
}