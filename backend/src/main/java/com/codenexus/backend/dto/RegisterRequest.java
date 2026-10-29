package com.codenexus.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    // ============================================================
    // NAME
    // ============================================================

    @NotBlank(message = "Name is required")
    @Size(
            min = 2,
            max = 120,
            message = "Name must be between 2 and 120 characters"
    )
    private String name;

    // ============================================================
    // EMAIL
    // ============================================================

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(
            max = 180,
            message = "Email cannot exceed 180 characters"
    )
    private String email;

    // ============================================================
    // PASSWORD
    // ============================================================

    @NotBlank(message = "Password is required")
    @Size(
            min = 8,
            max = 100,
            message = "Password must be between 8 and 100 characters"
    )
    private String password;
}