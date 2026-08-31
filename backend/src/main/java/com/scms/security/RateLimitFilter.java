package com.scms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter for public endpoints.
 * For production with multiple instances, use Redis or a gateway.
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 20;
    private final Map<String, RequestCount> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (isRateLimitedPath(path)) {
            String clientIp = getClientIP(request);
            String key = clientIp + ":" + path;
            RequestCount count = requestCounts.compute(key, (k, v) -> {
                if (v == null || Instant.now().isAfter(v.getWindowStart().plusSeconds(60))) {
                    return new RequestCount(1, Instant.now());
                }
                v.increment();
                return v;
            });

            if (count.getCount() > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Please try again later.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitedPath(String path) {
        return path.startsWith("/api/v1/auth/") ||
               path.startsWith("/api/v1/student/register") ||
               path.startsWith("/api/v1/student/courses/public");
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private static class RequestCount {
        private int count;
        private Instant windowStart;

        public RequestCount(int count, Instant windowStart) {
            this.count = count;
            this.windowStart = windowStart;
        }

        public void increment() {
            this.count++;
        }

        public int getCount() {
            return count;
        }

        public Instant getWindowStart() {
            return windowStart;
        }
    }
}