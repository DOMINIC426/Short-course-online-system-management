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
import java.time.LocalDateTime;
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

    @Value("${scms.rate-limit.login-per-minute:5}")
    private int loginLimit;

    @Value("${scms.rate-limit.register-per-minute:10}")
    private int registerLimit;

    @Value("${scms.rate-limit.general-per-minute:60}")
    private int generalLimit;

    @Value("${scms.rate-limit.fail-closed:false}")
    private boolean failClosed;

    @Value("${scms.rate-limit.trust-proxy:false}")
    private boolean trustProxy;

    private static final String LUA_SCRIPT = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            local ttl = redis.call('TTL', KEYS[1])
            return {current, ttl}
            """;

    private final DefaultRedisScript<List> script = new DefaultRedisScript<>(LUA_SCRIPT, List.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

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
        long limit = policy.getLimit();

        try {
            List<Long> result = redisTemplate.execute(
                    script,
                    Collections.singletonList(key),
                    "60"
            );

            if (result == null || result.size() < 2) {
                log.warn("Unexpected Redis result for key {}", key);
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

            response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
            response.setHeader("X-RateLimit-Reset", String.valueOf(ttlSeconds));

            if (currentCount > limit) {
                log.warn("Rate limit exceeded for policy {}, IP {}, endpoint {}, method {}",
                        policy.name(), clientIp, request.getRequestURI(), request.getMethod());
                rejectTooManyRequests(response, ttlSeconds);
                return;
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("Redis error during rate limiting for key {}", key, e);
            if (failClosed) {
                rejectDueToRedisFailure(response);
            } else {
                filterChain.doFilter(request, response);
            }
        }
    }

    private RateLimitPolicy determinePolicy(HttpServletRequest request, String path) {
        if (!path.startsWith("/api/v1/")) {
            return null;
        }

        if ("POST".equalsIgnoreCase(request.getMethod())) {
            if (path.equals("/api/v1/auth/login")) {
                return new RateLimitPolicy("scms:rate-limit:login:", loginLimit, "LOGIN");
            }
            if (path.equals("/api/v1/auth/register") || path.equals("/api/v1/student/register")) {
                return new RateLimitPolicy("scms:rate-limit:register:", registerLimit, "REGISTER");
            }
        }

        return new RateLimitPolicy("scms:rate-limit:general:", generalLimit, "GENERAL");
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
        body.put("timestamp", LocalDateTime.now().toString());
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
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
        body.put("message", "Rate limiting service unavailable.");

        objectMapper.writeValue(response.getWriter(), body);
    }

    private record RateLimitPolicy(String keyPrefix, long limit, String name) {
        public String getKeyPrefix() {
            return keyPrefix;
        }

        public long getLimit() {
            return limit;
        }

        public String name() {
            return name;
        }
    }
}