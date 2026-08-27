package com.scms.service;

import com.scms.entity.Users;
import com.scms.entity.enums.Role;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SeedUsers implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("\n========= [SCMS SYSTEM DATA SEEDING STARTED] =========");

        // Shared default password hash
        String defaultPasswordHash = passwordEncoder.encode("12345678");

        for (Role currentRole : Role.values()) {
            String rawRoleNameLower = currentRole.name().toLowerCase();
            String targetEmail = rawRoleNameLower + "@gmail.com";

            // Format "FINANCE_OFFICER" -> "Finance Officer"
            String formattedRoleName = Arrays.stream(currentRole.name().split("_"))
                    .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                    .collect(Collectors.joining(" "));

            // Split into logical First Name / Last Name
            String[] nameParts = formattedRoleName.split(" ");
            String firstName;
            String lastName;

            if (nameParts.length > 1) {
                firstName = String.join(" ", Arrays.copyOf(nameParts, nameParts.length - 1));
                lastName = nameParts[nameParts.length - 1];
            } else {
                firstName = formattedRoleName;
                lastName = formattedRoleName;
            }

            if (userRepository.findByEmail(targetEmail).isEmpty()) {
                Users seedUser = Users.builder()
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(targetEmail)
                        .password(defaultPasswordHash)
                        .role(currentRole)
                        .createdAt(LocalDate.now())
                        .updatedAt(LocalDate.now())
                        .build();

                userRepository.save(seedUser);
                System.out.printf("👉 SUCCESS: Registered Default User [%s] with Names [%s %s] and Role: %s%n",
                        targetEmail, firstName, lastName, currentRole);
            } else {
                System.out.printf("ℹ️ SKIPPED: User [%s] already exists in database.%n", targetEmail);
            }
        }

        System.out.println("========= [SCMS SYSTEM DATA SEEDING COMPLETE] =========\n");
    }
}