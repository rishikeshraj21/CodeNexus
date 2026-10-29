package com.codenexus.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // USER WHO SUBMITTED THE CODE
    // ============================================================

    @ManyToOne
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // ============================================================
    // PROBLEM
    // ============================================================

    @ManyToOne
    @JoinColumn(
            name = "problem_id",
            nullable = false
    )
    private Problem problem;

    // ============================================================
    // SOURCE CODE
    // ============================================================

    @Column(
            nullable = false,
            columnDefinition = "LONGTEXT"
    )
    private String sourceCode;

    // ============================================================
    // PROGRAMMING LANGUAGE
    // ============================================================

    @Column(nullable = false)
    private String language;

    // ============================================================
    // JUDGE STATUS
    //
    // PENDING
    // ACCEPTED
    // WRONG_ANSWER
    // COMPILATION_ERROR
    // RUNTIME_ERROR
    // TIME_LIMIT_EXCEEDED
    // ============================================================

    @Column(nullable = false)
    private String status;

    // ============================================================
    // EXECUTION INFORMATION
    // ============================================================

    private Integer executionTime;

    private Integer memoryUsed;

    private Integer passedTestCases;

    private Integer totalTestCases;

    // ============================================================
    // PROGRAM OUTPUT
    // ============================================================

    @Column(columnDefinition = "TEXT")
    private String output;

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    // ============================================================
    // SUBMISSION TIME
    // ============================================================

    @Column(nullable = false)
    private LocalDateTime submittedAt;
}