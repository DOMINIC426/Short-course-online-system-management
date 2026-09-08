package com.scms.service.admin;

import com.scms.entity.Users;
import com.scms.entity.enums.Role;
import com.scms.entity.enums.UserStatus;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeedUser implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        String email = "admin@scms.local";
        String phone = "0700000000";

        if (userRepository.existsByEmail(email)) {
            log.info("Default Admin user already exists. Skipping seeding.");
            return;
        }

        if (userRepository.existsByPhone(phone)) {
            log.info("Default Admin phone already exists. Skipping seeding.");
            return;
        }

        Users user = Users.builder()
                .email(email)
                .phone(phone)
                .firstName("System")
                .lastName("Administrator")
                .role(Role.ADMIN)
                .passwordHash(passwordEncoder.encode("Admin@12345"))
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        log.info("Default Admin user seeded successfully.");
    }
}
