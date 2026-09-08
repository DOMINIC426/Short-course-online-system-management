package com.scms.security;

import com.scms.entity.Users;
import com.scms.entity.enums.Role;
import com.scms.entity.enums.UserStatus;
import com.scms.repository.UserRepository;
import com.scms.repository.admin.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        boolean enabled = user.getStatus() == UserStatus.ACTIVE;
        boolean accountNonLocked = user.getStatus() != UserStatus.SUSPENDED;
        boolean accountNonExpired = true;
        boolean credentialsNonExpired = true;

        List<SimpleGrantedAuthority> authorities = buildAuthorities(user);

        return User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(authorities)
                .disabled(!enabled)
                .accountLocked(!accountNonLocked)
                .accountExpired(!accountNonExpired)
                .credentialsExpired(!credentialsNonExpired)
                .build();
    }

    private List<SimpleGrantedAuthority> buildAuthorities(Users user) {
        List<SimpleGrantedAuthority> authorities;

        if (Role.ADMIN.equals(user.getRole())) {
            authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_ADMIN")
            );
        } else {
            authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
            );
        }

        // Add permission authorities from role_permissions
        List<String> permissionNames = rolePermissionRepository.findAllByRole(user.getRole())
                .stream()
                .map(rp -> rp.getPermission().getName())
                .distinct()
                .toList();

        if (!permissionNames.isEmpty()) {
            List<SimpleGrantedAuthority> permissionAuthorities = permissionNames.stream()
                    .map(SimpleGrantedAuthority::new)
                    .toList();

            authorities = List.copyOf(
                    Stream.concat(authorities.stream(), permissionAuthorities.stream())
                            .toList()
            );
        }

        return authorities;
    }
}