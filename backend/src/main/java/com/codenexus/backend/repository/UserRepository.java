package com.codenexus.backend.repository;

import com.codenexus.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /*
     * Finds a user using their email address.
     *
     * Used during:
     * - Login
     * - JWT authentication
     * - /auth/me
     */
    Optional<User> findByEmail(String email);

    /*
     * Checks whether an email is already registered.
     */
    boolean existsByEmail(String email);
}