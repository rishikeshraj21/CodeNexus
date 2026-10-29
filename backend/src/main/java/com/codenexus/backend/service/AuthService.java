package com.codenexus.backend.service;

import com.codenexus.backend.entity.User;
import com.codenexus.backend.repository.UserRepository;
import com.codenexus.backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ============================================================
    // REGISTER
    // ============================================================

    public User register(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User data is required"
            );
        }

        if (user.getName() == null
                || user.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "Name is required"
            );
        }

        if (user.getEmail() == null
                || user.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (user.getPassword() == null
                || user.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        String name = user.getName().trim();

        String email =
                user.getEmail()
                        .trim()
                        .toLowerCase();

        String password = user.getPassword();

        if (name.length() < 2) {
            throw new IllegalArgumentException(
                    "Name must contain at least 2 characters"
            );
        }

        if (password.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters"
            );
        }

        // --------------------------------------------------------
        // CHECK DUPLICATE EMAIL
        // --------------------------------------------------------

        if (userRepository.existsByEmail(email)) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        // --------------------------------------------------------
        // SET USER DATA
        // --------------------------------------------------------

        user.setName(name);
        user.setEmail(email);

        // Never store plain-text passwords.
        user.setPassword(
                passwordEncoder.encode(password)
        );

        // Every normal registration creates a USER.
        // ADMIN accounts must be created/promoted separately.
        user.setRole("USER");

        return userRepository.save(user);
    }

    // ============================================================
    // LOGIN
    // ============================================================

    public String login(
            String email,
            String password
    ) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (password == null || password.isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        // --------------------------------------------------------
        // FIND USER
        // --------------------------------------------------------

        User user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid email or password"
                                )
                        );

        // --------------------------------------------------------
        // VERIFY PASSWORD
        // --------------------------------------------------------

        if (user.getPassword() == null
                || user.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        // --------------------------------------------------------
        // GET ROLE
        // --------------------------------------------------------

        String role = user.getRole();

        if (role == null || role.isBlank()) {
            role = "USER";
        }

        role = role.trim().toUpperCase();

        if (!role.equals("USER")
                && !role.equals("ADMIN")) {

            role = "USER";
        }

        // --------------------------------------------------------
        // GENERATE JWT
        // --------------------------------------------------------

        return jwtService.generateToken(
                user.getEmail(),
                role
        );
    }

    // ============================================================
    // GET USER BY EMAIL
    // ============================================================

    public User getUserByEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        return userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );
    }

    public User updateCurrentUserName(
            String email,
            String requestedName
    ) {
        if (requestedName == null || requestedName.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        String name = requestedName.trim();
        if (name.length() < 2 || name.length() > 100) {
            throw new IllegalArgumentException(
                    "Name must be between 2 and 100 characters"
            );
        }

        User user = getUserByEmail(email);
        user.setName(name);
        return userRepository.save(user);
    }
}