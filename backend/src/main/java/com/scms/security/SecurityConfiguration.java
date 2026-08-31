package com.scms.security;

import com.scms.jwt.JwtAuthenticationFilter;
import com.scms.security.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;

    /**
     * Password encoder used for securely hashing user passwords.
     *
     * BCrypt is intentionally slow and salted, making it suitable
     * for storing passwords securely.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Main Spring Security filter chain.
     *
     * This configuration combines:
     * - JWT authentication
     * - Rate limiting
     * - Stateless sessions
     * - CORS
     * - Security headers
     * - Role-based endpoint authorization
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            /*
             * CSRF protection is disabled because the application
             * uses stateless JWT authentication.
             *
             * IMPORTANT:
             * If JWT authentication is later stored in cookies,
             * CSRF protection should be reconsidered.
             */
            .csrf(csrf -> csrf.disable())

            /*
             * Enable CORS using the centralized configuration below.
             */
            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource()
                )
            )

            /*
             * JWT authentication is stateless.
             *
             * The server does not maintain an HTTP session
             * for authenticated users.
             */
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            /*
             * Security-related HTTP headers.
             */
            .headers(headers -> headers

                /*
                 * Prevent MIME type sniffing.
                 *
                 * Spring Security enables this by default.
                 */
                .contentTypeOptions(contentType ->
                    contentType.disable()
                )

                /*
                 * Prevent the application from being embedded
                 * inside frames/iframes.
                 */
                .frameOptions(frame ->
                    frame.deny()
                )

                /*
                 * The old X-XSS-Protection browser header is deprecated.
                 * Modern browsers rely on CSP and other protections.
                 */
                .xssProtection(xss ->
                    xss.disable()
                )

                /*
                 * Enable HTTP Strict Transport Security (HSTS).
                 *
                 * This tells browsers to use HTTPS for this domain.
                 *
                 * NOTE:
                 * HSTS should normally be enabled only when the application
                 * is actually served over HTTPS in production.
                 */
                .httpStrictTransportSecurity(hsts ->
                    hsts
                        .includeSubDomains(true)
                        .maxAgeInSeconds(31536000)
                )
            )

            /*
             * Authorization rules.
             */
            .authorizeHttpRequests(auth -> auth

                /*
                 * Authentication endpoints.
                 *
                 * Examples:
                 * POST /api/v1/auth/login
                 * POST /api/v1/auth/register
                 * POST /api/v1/auth/refresh
                 *
                 * Authentication endpoints must be publicly accessible
                 * because users do not have a JWT before login.
                 */
                .requestMatchers(
                    "/api/v1/auth/**"
                ).permitAll()

                /*
                 * Spring's default error endpoint.
                 */
                .requestMatchers(
                    "/error"
                ).permitAll()

                /*
                 * Swagger / OpenAPI documentation.
                 */
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                /*
                 * Public application endpoints.
                 */
                .requestMatchers(
                    "/",
                    "/actuator/health"
                ).permitAll()

                /*
                 * Public student course endpoint.
                 *
                 * No JWT required.
                 */
                .requestMatchers(
                    "/api/v1/student/courses/public"
                ).permitAll()

                /*
                 * Student registration endpoint.
                 *
                 * No JWT required because the student does not
                 * have an authenticated account yet.
                 */
                .requestMatchers(
                    "/api/v1/student/register"
                ).permitAll()

                /*
                 * ADMIN MODULE.
                 *
                 * Every endpoint under:
                 *
                 * /api/v1/admin/**
                 *
                 * requires the ADMIN role.
                 *
                 * hasRole("ADMIN") internally checks for:
                 *
                 * ROLE_ADMIN
                 */
                .requestMatchers(
                    "/api/v1/admin/**"
                ).hasRole("ADMIN")

                /*
                 * Everything else requires authentication.
                 */
                .anyRequest().authenticated()
            )

            /*
             * Rate limiting filter.
             *
             * This is executed before the standard Spring Security
             * username/password authentication filter.
             *
             * It helps protect the application against excessive
             * requests and abuse.
             */
            .addFilterBefore(
                rateLimitFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            /*
             * JWT authentication filter.
             *
             * This extracts and validates the JWT and establishes
             * the authenticated SecurityContext.
             */
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    /**
     * Centralized CORS configuration.
     *
     * Frontend:
     * http://localhost:5174
     *
     * This is appropriate for the current Docker/development
     * configuration where the frontend is exposed as:
     *
     * 5174:5173
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        /*
         * Trusted frontend origin.
         *
         * Do NOT use:
         *
         *     "*"
         *
         * together with:
         *
         *     allowCredentials(true)
         *
         * because wildcard origins cannot be used for
         * credentialed CORS requests.
         */
        configuration.setAllowedOrigins(
            List.of(
                "http://localhost:5174"
            )
        );

        /*
         * HTTP methods allowed from the frontend.
         */
        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        /*
         * Headers allowed from the frontend.
         *
         * Authorization is required for:
         *
         * Authorization: Bearer <JWT>
         *
         * Content-Type is required for JSON/API requests.
         */
        configuration.setAllowedHeaders(
            List.of(
                HttpHeaders.AUTHORIZATION,
                HttpHeaders.CONTENT_TYPE
            )
        );

        /*
         * Allow credentials for credentialed cross-origin requests.
         *
         * This must NOT be combined with allowedOrigins("*").
         */
        configuration.setAllowCredentials(true);

        /*
         * Register this CORS configuration for all endpoints.
         */
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }
}
