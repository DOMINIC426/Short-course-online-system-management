package com.scms.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${scms.rate-limit.fail-closed:false}")
    private boolean failClosed;

    @Value("${scms.rate-limit.trust-proxy:false}")
    private boolean trustProxy;

    // Rate limits per minute
    private static final int LOGIN_LIMIT = 5;
    private static final int REGISTER_LIMIT = 10;
    private static final int GENERAL_LIMIT = 60;

    // Lua script for atomic INCR + EXPIRE
    private static final String LUA_SCRIPT = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            local ttl = redis.call('TTL', KEYS[1])
            return {current, ttl}
            """;

    private final DefaultRedisScript<List> script = new DefaultRedisScript<>(LUA_SCRIPT, java.util.List.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Skip OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        RateLimitPolicy policy = determinePolicy(request, path);

        if (policy == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        String key = policy.getKeyPrefix() + clientIp;

        try {
            Long limit = policy.getLimit();
            Long windowSeconds = 60L;

            // Execute Lua script atomically
            List<Long> result = redisTemplate.execute(
                    script,
                    Collections.singletonList(key),
                    windowSeconds.toString()
            );

            if (result == null || result.size() < 2) {
                log.warn("Unexpected Redis result for rate limit key {}", key);
                if (failClosed) {
                    rejectDueToRedisFailure(response);
                    return;
                }
                filterChain.doFilter(request, response);
                return;
            }

            long currentCount = result.get(0);
            long ttlSeconds = result.get(1);

            long remaining = Math.max(0, limit - currentCount);

            // Set rate limit headers
            response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
            response.setHeader("X-RateLimit-Reset", String.valueOf(ttlSeconds));

            if (currentCount > limit) {
                // Limit exceeded
                log.warn("Rate limit exceeded for policy {}, IP {}, endpoint {}, method {}",
                        policy.name(), clientIp, request.getRequestURI(), request.getMethod());

                rejectTooManyRequests(response, ttlSeconds);
                return;
            }

            // Request allowed
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("Redis error during rate limiting for key {}", key, e);
            if (failClosed) {
                rejectDueToRedisFailure(response);
            } else {
                // Fail-open: allow request
                filterChain.doFilter(request, response);
            }
        }
    }

    private RateLimitPolicy determinePolicy(HttpServletRequest request, String path) {
        if (!path.startsWith("/api/v1/")) {
            return null; // not an API path we rate limit
        }

        if ("POST".equalsIgnoreCase(request.getMethod())) {
            if (path.equals("/api/v1/auth/login")) {
                return RateLimitPolicy.LOGIN;
            }
            if (path.equals("/api/v1/auth/register") || path.equals("/api/v1/student/register")) {
                return RateLimitPolicy.REGISTER;
            }
        }

        return RateLimitPolicy.GENERAL;
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (trustProxy) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                return xForwardedFor.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    private void rejectTooManyRequests(HttpServletResponse response, long retryAfterSeconds) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", java.time.LocalDateTime.now().toString());
        body.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        body.put("error", HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase());
        body.put("message", "Too many requests. Please try again later.");
        body.put("retryAfter", retryAfterSeconds);

        objectMapper.writeValue(response.getWriter(), body);
    }

    private void rejectDueToRedisFailure(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", java.time.LocalDateTime.now().toString());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
        body.put("message", "Rate limiting service unavailable.");

        objectMapper.writeValue(response.getWriter(), body);
    }

    private enum RateLimitPolicy {
        LOGIN("scms:rate-limit:login:", LOGIN_LIMIT),
        REGISTER("scms:rate-limit:register:", REGISTER_LIMIT),
        GENERAL("scms:rate-limit:general:", GENERAL_LIMIT);

        private final String keyPrefix;
        private final long limit;

        RateLimitPolicy(String keyPrefix, long limit) {
            this.keyPrefix = keyPrefix;
            this.limit = limit;
        }

        public String getKeyPrefix() {
            return keyPrefix;
        }

        public long getLimit() {
            return limit;
        }
    }
}