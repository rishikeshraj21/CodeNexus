package com.codenexus.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    // ============================================================
    // JWT FILTER
    // ============================================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();
        String method = request.getMethod();

        // --------------------------------------------------------
        // CORS PREFLIGHT
        // --------------------------------------------------------

        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // --------------------------------------------------------
        // PUBLIC AUTH ENDPOINTS
        // --------------------------------------------------------

        if (
                "/api/auth/login".equals(path)
                        || "/api/auth/register".equals(path)
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        // --------------------------------------------------------
        // READ AUTHORIZATION HEADER
        // --------------------------------------------------------

        String authorizationHeader =
                request.getHeader("Authorization");

        if (
                authorizationHeader == null
                        || !authorizationHeader.startsWith("Bearer ")
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            String token =
                    authorizationHeader.substring(7).trim();

            if (token.isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }

            // ----------------------------------------------------
            // VALIDATE TOKEN
            // ----------------------------------------------------

            if (!jwtService.isTokenValid(token)) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(request, response);
                return;
            }

            // ----------------------------------------------------
            // GET USER INFORMATION FROM JWT
            // ----------------------------------------------------

            String email =
                    jwtService.getUsernameFromToken(token);

            String role =
                    jwtService.getRoleFromToken(token);

            if (email == null || email.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }

            // ----------------------------------------------------
            // NORMALIZE ROLE
            // ----------------------------------------------------

            if (role == null || role.isBlank()) {
                role = "USER";
            }

            role = role.trim().toUpperCase();

            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }

            String authority = "ROLE_" + role;

            // ----------------------------------------------------
            // CREATE SPRING SECURITY AUTHENTICATION
            // ----------------------------------------------------

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            Collections.singletonList(
                                    new SimpleGrantedAuthority(authority)
                            )
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

        } catch (Exception exception) {

            /*
             * Never allow a malformed or invalid JWT to create
             * an authenticated security context.
             */
            SecurityContextHolder.clearContext();
        }

        // --------------------------------------------------------
        // CONTINUE REQUEST
        // --------------------------------------------------------

        filterChain.doFilter(request, response);
    }
}