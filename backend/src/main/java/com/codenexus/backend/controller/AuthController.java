package com.codenexus.backend.controller;

import com.codenexus.backend.dto.LoginRequest;
import com.codenexus.backend.dto.RegisterRequest;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
})
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }

    // ============================================================
    // REGISTER
    // ============================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        try {

            User user =
                    User.builder()
                            .name(request.getName())
                            .email(request.getEmail())
                            .password(request.getPassword())
                            .role("USER")
                            .build();

            User savedUser =
                    authService.register(user);

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "message",
                    "Registration successful"
            );

            response.put(
                    "id",
                    savedUser.getId()
            );

            response.put(
                    "name",
                    savedUser.getName()
            );

            response.put(
                    "email",
                    savedUser.getEmail()
            );

            response.put(
                    "role",
                    savedUser.getRole()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );

        } catch (Exception exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Registration failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {

        try {

            String token =
                    authService.login(
                            request.getEmail(),
                            request.getPassword()
                    );

            User user =
                    authService.getUserByEmail(
                            request.getEmail()
                    );

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "message",
                    "Login successful"
            );

            response.put(
                    "token",
                    token
            );

            response.put(
                    "id",
                    user.getId()
            );

            response.put(
                    "email",
                    user.getEmail()
            );

            response.put(
                    "name",
                    user.getName()
            );

            response.put(
                    "role",
                    user.getRole()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );

        } catch (Exception exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Login failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // CURRENT USER
    // ============================================================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            Authentication authentication
    ) {

        try {

            if (authentication == null
                    || !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "message",
                                        "Not authenticated"
                                )
                        );
            }

            User user =
                    authService.getUserByEmail(
                            authentication.getName()
                    );

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "id",
                    user.getId()
            );

            response.put(
                    "name",
                    user.getName()
            );

            response.put(
                    "email",
                    user.getEmail()
            );

            response.put(
                    "role",
                    user.getRole()
            );

            return ResponseEntity.ok(response);

        } catch (Exception exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "User not found"
                            )
                    );
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(
            Authentication authentication,
            @RequestBody Map<String, String> request
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }

        try {
            User user = authService.updateCurrentUserName(
                    authentication.getName(),
                    request.get("name")
            );

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", safeMessage(exception)));
        } catch (Exception exception) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "message",
                            "Failed to update profile",
                            "error",
                            safeMessage(exception)
                    ));
        }
    }

    // ============================================================
    // SAFE ERROR MESSAGE
    // ============================================================

    private String safeMessage(
            Exception exception
    ) {

        if (exception == null) {
            return "Unknown error";
        }

        String message =
                exception.getMessage();

        if (message == null
                || message.isBlank()) {

            return exception
                    .getClass()
                    .getSimpleName();
        }

        return message;
    }
}