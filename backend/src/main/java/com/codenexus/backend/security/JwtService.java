package com.codenexus.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    // ============================================================
    // JWT CONFIGURATION
    // ============================================================

    /*
     * This key is used to sign and verify JWT tokens.
     *
     * IMPORTANT:
     * In a production deployment this should be stored in an
     * environment variable or secret manager.
     */
    private static final String SECRET_KEY = System.getenv("JWT_SECRET");

    /*
     * Token validity:
     * 24 hours
     */
    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24;

    private final SecretKey key;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public JwtService() {
        if (SECRET_KEY == null || SECRET_KEY.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable must be set");
        }

        byte[] secretBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes long");
        }

        this.key = Keys.hmacShaKeyFor(secretBytes);
    }

    // ============================================================
    // GENERATE TOKEN
    // ============================================================

    public String generateToken(String email, String role) {

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION_TIME
                        )
                )
                .signWith(key)
                .compact();
    }

    // ============================================================
    // EXTRACT USERNAME / EMAIL
    // ============================================================

    public String getUsernameFromToken(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    // ============================================================
    // EXTRACT ROLE
    // ============================================================

    public String getRoleFromToken(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("role", String.class);
    }

    // ============================================================
    // VALIDATE TOKEN
    // ============================================================

    public boolean isTokenValid(String token) {

        try {

            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (Exception exception) {

            return false;
        }
    }
}