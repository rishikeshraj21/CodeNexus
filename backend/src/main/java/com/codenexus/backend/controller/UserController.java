package com.codenexus.backend.controller;

import com.codenexus.backend.entity.User;
import com.codenexus.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
})
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService
    ) {
        this.userService = userService;
    }

    // ============================================================
    // CREATE USER
    // ============================================================

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody User user
    ) {

        try {

            User savedUser =
                    userService.createUser(user);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedUser);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
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
                                    "User creation failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // GET ALL USERS
    // ============================================================

    @GetMapping
    public ResponseEntity<?> getAllUsers() {

        try {

            List<User> users =
                    userService.getAllUsers();

            return ResponseEntity.ok(
                    users
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to load users",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // GET USER BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long id
    ) {

        try {

            User user =
                    userService.getUserById(id);

            return ResponseEntity.ok(
                    user
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // UPDATE USER ROLE
    // ============================================================

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {

        try {

            if (request == null
                    || !request.containsKey("role")) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Role is required"
                                )
                        );
            }

            String role =
                    request.get("role");

            User updatedUser =
                    userService.updateUserRole(
                            id,
                            role
                    );

            return ResponseEntity.ok(
                    updatedUser
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // DELETE USER
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id
    ) {

        try {

            userService.deleteUser(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "User deleted successfully"
                    )
            );

        } catch (IllegalStateException exception) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(exception)
                            )
                    );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(exception)
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
                                    "User deletion failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
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