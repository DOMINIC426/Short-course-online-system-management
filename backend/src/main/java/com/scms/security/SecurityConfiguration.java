package com.scms.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfiguration {
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
          http.csrf(csrf->csrf.disable())
                  .sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                  .authorizeHttpRequests(request->{
                      request.requestMatchers("/api/v1/auth/**").permitAll()
                              .requestMatchers("/v3/api-docs/**").permitAll()
                              .requestMatchers("/swagger-ui/**").permitAll()
                              .requestMatchers("/swagger-ui.html").permitAll()
                              .requestMatchers("/", "/actuator/health").permitAll()
                              .anyRequest().authenticated();
                  });
          return http.build();
    }

}
