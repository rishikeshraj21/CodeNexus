package com.codenexus.backend.controller;

import com.codenexus.backend.entity.User;
import com.codenexus.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
})
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(
            UserService userService
    ) {
        this.userService = userService;
    }

    // ============================================================
    // GET ALL USERS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    // ============================================================
    // GET SINGLE USER
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    userService.getUserById(id)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // ============================================================
    // UPDATE ROLE
    // ============================================================

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {

        try {

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

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to update role",
                                    "error",
                                    e.getMessage() == null
                                            ? e.getClass().getName()
                                            : e.getMessage()
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

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to delete user",
                                    "error",
                                    e.getMessage() == null
                                            ? e.getClass().getName()
                                            : e.getMessage()
                            )
                    );
        }
    }
}