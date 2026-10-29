package com.codenexus.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    // ============================================================
    // EMAIL
    // ============================================================

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    // ============================================================
    // PASSWORD
    // ============================================================

    @NotBlank(message = "Password is required")
    private String password;
}