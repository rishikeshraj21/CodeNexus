package com.codenexus.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // USER NAME
    // ============================================================

    @Column(nullable = false)
    private String name;

    // ============================================================
    // EMAIL
    // ============================================================

    @Column(nullable = false, unique = true)
    private String email;

    // ============================================================
    // PASSWORD
    //
    // WRITE_ONLY means password can be received in requests
    // but will never be returned in JSON responses.
    // ============================================================

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    // ============================================================
    // ROLE
    //
    // USER
    // ADMIN
    // ============================================================

    @Column(nullable = false)
    private String role;
}