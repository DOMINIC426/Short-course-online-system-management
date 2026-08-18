package com.scms.service;

import com.scms.entity.Users;
import com.scms.entity.enums.Role;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class SeedUsers implements ApplicationRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("\n========= [SCMS SYSTEM DATA SEEDING STARTED] =========");

        // Define shared default password hash using your exact string "12345678"
        String defaultPasswordHash = passwordEncoder.encode("12345678");

        // Dynamically loop through every single value declared in your extended Role Enum
        for (Role currentRole : Role.values()) {

            // Format lowercase values according to your rules (e.g., finance_officer, quality_assurance_officer)
            String rawRoleNameLower = currentRole.name().toLowerCase();

            // Format email matching the requirement (e.g., finance_officer@gmail.com)
            String targetEmail = rawRoleNameLower + "@gmail.com";

            // Set first and last names to be identical to the lowercase role name (e.g., first: "admin", last: "admin")
            String targetName = rawRoleNameLower;

            // Defensive checking to prevent dirty duplicate inserts
            if (userRepository.findByEmail(targetEmail).isEmpty()) {
                Users seedUser = Users.builder()
                        .firstName(targetName)
                        .lastName(targetName)
                        .email(targetEmail)
                        .password(defaultPasswordHash)
                        .role(currentRole)
                        .createdAt(LocalDate.now()) // Aligns perfectly with your entity's LocalDate field type
                        .updatedAt(LocalDate.now())
                        .build();

                userRepository.save(seedUser);
                System.out.printf("👉 SUCCESS: Registered Default User [%s] with Names [%s %s] and Role: %s%n",
                        targetEmail, targetName, targetName, currentRole);
            } else {
                System.out.printf("ℹ️ SKIPPED: User [%s] already exists in database.%n",
                        targetEmail);
            }
        }

        System.out.println("========= [SCMS SYSTEM DATA SEEDING COMPLETE] =========\n");
    }
}
