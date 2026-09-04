package com.scms.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;

    private static final String LUA_SCRIPT = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            return current
            """;

    private final DefaultRedisScript<Long> script = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);

    public boolean tryAcquire(String key, int maxRequests, long windowSeconds) {
        String redisKey = "scms:rate-limit:pw-reset:" + key;
        try {
            Long count = redisTemplate.execute(
                    script,
                    Collections.singletonList(redisKey),
                    String.valueOf(windowSeconds)
            );
            if (count == null) {
                return true; // fail-open
            }
            return count <= maxRequests;
        } catch (Exception e) {
            log.error("Redis error during rate limiting for key {}", redisKey, e);
            return true; // fail-open
        }
    }
}