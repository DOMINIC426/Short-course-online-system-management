package com.scms.service.market;

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
public class SeedUser implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String email = "market@gmail.com";
        String phone = "0677472870";

        if (userRepository.existsByEmail(email) || userRepository.existsByPhone(phone)) {
            log.info("Default Market Officer user already exists. Skipping seeding.");
            return;
        }

        Users user = Users.builder()
                .email(email)
                .phone(phone)
                .firstName("Kanyonyi")
                .lastName("Kalan")
                .role(Role.MARKETING_OFFICER)
                .passwordHash(passwordEncoder.encode("123456"))
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        log.info("Market Officer user seeded successfully.");
    }
}