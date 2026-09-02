package com.scms.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountLoginRateLimiter {

    private final StringRedisTemplate redisTemplate;

    @Value("${scms.rate-limit.login-account-per-minute:5}")
    private int accountLimit;

    private static final String LUA_SCRIPT = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            return current
            """;

    private final DefaultRedisScript<Long> script = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);

    public boolean isAllowed(String email) {
        String key = "scms:rate-limit:account:" + email;
        try {
            Long count = redisTemplate.execute(
                    script,
                    Collections.singletonList(key),
                    "60"
            );
            if (count == null) {
                return true; // fail-open
            }
            return count <= accountLimit;
        } catch (Exception e) {
            log.error("Redis error during account rate limiting for {}", email, e);
            return true; // fail-open
        }
    }
}