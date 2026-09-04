package com.scms.jwt;

import com.scms.entity.Users;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private final String SECRET_KEY = "hello-spring-boot-security-strong-long-heavy-3049-base64-make-happy-day-strong";

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(UserDetails userDetails) {
        Integer tokenVersion = null;
        if (userDetails instanceof Users u) {
            tokenVersion = u.getTokenVersion();
        }
        return generateToken(userDetails, tokenVersion);
    }

    public String generateToken(UserDetails userDetails, Integer tokenVersion) {
        var builder = Jwts.builder()
                .claim("role", userDetails.getAuthorities().stream()
                        .findFirst()
                        .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                        .orElse("STUDENT"))
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 30)); // 30 Minutes

        if (tokenVersion != null) {
            builder.claim("tokenVersion", tokenVersion);
        }

        return builder.signWith(getSecretKey()).compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Integer extractTokenVersion(String token) {
        return extractClaim(token, claims -> claims.get("tokenVersion", Integer.class));
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        if (!username.equals(userDetails.getUsername()) || isTokenExpired(token)) {
            return false;
        }

        if (userDetails instanceof Users users && users.getTokenVersion() != null) {
            Integer tokenVersionInClaim = extractTokenVersion(token);
            if (tokenVersionInClaim != null && !tokenVersionInClaim.equals(users.getTokenVersion())) {
                return false;
            }
            if (tokenVersionInClaim == null && users.getTokenVersion() > 0) {
                return false;
            }
        }
        return true;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}