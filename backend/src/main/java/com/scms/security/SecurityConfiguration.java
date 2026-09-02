package com.scms.security;

import com.scms.jwt.JwtAuthenticationFilter;
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
     * BCrypt password encoder.
     *
     * Passwords must NEVER be stored as plain text.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Main Spring Security filter chain.
     *
     * Security flow:
     *
     * Request
     *   ↓
     * CORS
     *   ↓
     * Rate Limiting
     *   ↓
     * JWT Authentication
     *   ↓
     * Authorization
     *   ↓
     * Controller
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            /*
             * ---------------------------------------------------------
             * CSRF
             * ---------------------------------------------------------
             *
             * The API uses stateless JWT authentication.
             *
             * If JWT authentication is later moved into cookies,
             * CSRF protection must be reconsidered.
             */
            .csrf(csrf -> csrf.disable())

            /*
             * ---------------------------------------------------------
             * CORS
             * ---------------------------------------------------------
             */
            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource()
                )
            )

            /*
             * ---------------------------------------------------------
             * SESSION MANAGEMENT
             * ---------------------------------------------------------
             *
             * JWT authentication is stateless.
             *
             * Spring must NOT create HTTP sessions for authentication.
             */
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            /*
             * ---------------------------------------------------------
             * SECURITY HEADERS
             * ---------------------------------------------------------
             */
            .headers(headers -> headers

                /*
                 * Keep X-Content-Type-Options enabled.
                 *
                 * This prevents MIME type sniffing.
                 *
                 * DO NOT disable contentTypeOptions().
                 */
                .contentTypeOptions(contentType -> {
                    // Spring Security default: nosniff
                })

                /*
                 * Prevent clickjacking / iframe embedding.
                 */
                .frameOptions(frame ->
                    frame.deny()
                )

                /*
                 * X-XSS-Protection is obsolete/deprecated
                 * in modern browsers, so we do not enable it.
                 */
                .xssProtection(xss ->
                    xss.disable()
                )

                /*
                 * HSTS.
                 *
                 * This should be enabled only when the application
                 * is actually accessed over HTTPS.
                 *
                 * Spring Security also normally applies HSTS only
                 * to secure requests.
                 */
                .httpStrictTransportSecurity(hsts ->
                    hsts
                        .includeSubDomains(true)
                        .preload(false)
                        .maxAgeInSeconds(31536000)
                )
            )

            /*
             * ---------------------------------------------------------
             * AUTHORIZATION
             * ---------------------------------------------------------
             */
            .authorizeHttpRequests(auth -> auth

                /*
                 * =====================================================
                 * PUBLIC AUTHENTICATION ENDPOINTS
                 * =====================================================
                 *
                 * Login, registration, refresh, etc.
                 *
                 * These endpoints are public because a user does not
                 * have a JWT before authentication.
                 *
                 * RateLimitFilter still protects these endpoints.
                 */
                .requestMatchers(
                    "/api/v1/auth/**"
                ).permitAll()

                /*
                 * Spring error endpoint.
                 */
                .requestMatchers(
                    "/error"
                ).permitAll()

                /*
                 * =====================================================
                 * API DOCUMENTATION
                 * =====================================================
                 *
                 * Keep these public during development.
                 *
                 * For production, consider protecting Swagger/OpenAPI
                 * or disabling it entirely.
                 */
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                /*
                 * =====================================================
                 * HEALTH CHECK
                 * =====================================================
                 */
                .requestMatchers(
                    "/",
                    "/actuator/health"
                ).permitAll()

                /*
                 * =====================================================
                 * PUBLIC STUDENT COURSE ENDPOINT
                 * =====================================================
                 */
                .requestMatchers(
                    "/api/v1/student/courses/public"
                ).permitAll()

                /*
                 * =====================================================
                 * STUDENT REGISTRATION
                 * =====================================================
                 *
                 * Registration is public because the student does not
                 * have an authenticated account yet.
                 *
                 * RateLimitFilter protects this endpoint.
                 */
                .requestMatchers(
                    "/api/v1/student/register"
                ).permitAll()

                /*
                 * =====================================================
                 * ADMIN MODULE
                 * =====================================================
                 *
                 * CRITICAL:
                 *
                 * Do NOT use permitAll() here.
                 *
                 * hasRole("ADMIN") checks for:
                 *
                 * ROLE_ADMIN
                 *
                 * Therefore the authenticated user's authorities
                 * must contain ROLE_ADMIN.
                 */
                .requestMatchers(
                    "/api/v1/admin/**"
                ).hasRole("ADMIN")

                /*
                 * =====================================================
                 * EVERYTHING ELSE
                 * =====================================================
                 *
                 * Any endpoint not explicitly declared public above
                 * requires authentication.
                 */
                .anyRequest().authenticated()
            )

            /*
             * ---------------------------------------------------------
             * RATE LIMITING FILTER
             * ---------------------------------------------------------
             *
             * Rate limiting must execute before normal authentication
             * processing so that public endpoints such as:
             *
             * POST /api/v1/auth/login
             *
             * are protected even before a JWT exists.
             */
            .addFilterBefore(
                rateLimitFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            /*
             * ---------------------------------------------------------
             * JWT AUTHENTICATION FILTER
             * ---------------------------------------------------------
             *
             * Extracts and validates:
             *
             * Authorization: Bearer <JWT>
             *
             * and establishes the authenticated SecurityContext.
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
     * Current frontend:
     *
     * http://localhost:5174
     *
     * Docker mapping:
     *
     * 5174:5173
     *
     * means the browser accesses the frontend through port 5174.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        /*
         * ---------------------------------------------------------
         * TRUSTED ORIGINS
         * ---------------------------------------------------------
         *
         * Never use "*" together with allowCredentials(true).
         *
         * Add production frontend origin through configuration
         * rather than hardcoding it when deploying.
         */
        configuration.setAllowedOrigins(
            List.of(
                "http://localhost:5174"
            )
        );

        /*
         * ---------------------------------------------------------
         * HTTP METHODS
         * ---------------------------------------------------------
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
         * ---------------------------------------------------------
         * REQUEST HEADERS
         * ---------------------------------------------------------
         *
         * Authorization:
         *     Bearer <JWT>
         *
         * Content-Type:
         *     application/json
         *
         * Accept:
         *     application/json
         */
        configuration.setAllowedHeaders(
            List.of(
                HttpHeaders.AUTHORIZATION,
                HttpHeaders.CONTENT_TYPE,
                HttpHeaders.ACCEPT
            )
        );

        /*
         * ---------------------------------------------------------
         * CREDENTIALS
         * ---------------------------------------------------------
         *
         * Required if the frontend sends credentialed requests.
         *
         * This must NOT be combined with:
         *
         * allowedOrigins("*")
         */
        configuration.setAllowCredentials(true);

        /*
         * ---------------------------------------------------------
         * EXPOSE RATE-LIMIT HEADERS
         * ---------------------------------------------------------
         *
         * Browsers normally do not expose arbitrary response headers
         * to JavaScript unless they are explicitly exposed.
         *
         * This allows the frontend to read:
         *
         * X-RateLimit-Limit
         * X-RateLimit-Remaining
         * X-RateLimit-Reset
         * Retry-After
         */
        configuration.setExposedHeaders(
            List.of(
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining",
                "X-RateLimit-Reset",
                "Retry-After"
            )
        );

        /*
         * ---------------------------------------------------------
         * CACHE DURATION FOR PREFLIGHT
         * ---------------------------------------------------------
         *
         * Browser can cache successful CORS preflight information
         * for one hour.
         */
        configuration.setMaxAge(3600L);

        /*
         * ---------------------------------------------------------
         * REGISTER CORS CONFIGURATION
         * ---------------------------------------------------------
         *
         * Applies to all endpoints.
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
