package com.codenexus.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

@Entity
@Table(name = "test_case_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseResult {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // RELATED SUBMISSION
    //
    // JsonIgnore prevents recursive JSON serialization:
    //
    // TestCaseResult -> Submission -> TestCaseResult -> ...
    // ============================================================

    @JsonIgnore
    @ManyToOne
    @JoinColumn(
            name = "submission_id",
            nullable = false
    )
    private Submission submission;

    // ============================================================
    // TEST CASE NUMBER
    // ============================================================

    @Column(nullable = false)
    private Integer testCaseNumber;

    // ============================================================
    // TEST CASE INPUT
    // ============================================================

    @Column(columnDefinition = "LONGTEXT")
    private String input;

    // ============================================================
    // EXPECTED OUTPUT
    // ============================================================

    @Column(columnDefinition = "LONGTEXT")
    private String expectedOutput;

    // ============================================================
    // ACTUAL OUTPUT
    // ============================================================

    @Column(columnDefinition = "LONGTEXT")
    private String actualOutput;

    // ============================================================
    // RESULT STATUS
    //
    // PASSED
    // FAILED
    // RUNTIME_ERROR
    // TIME_LIMIT_EXCEEDED
    // ============================================================

    @Column(nullable = false)
    private String status;

    // ============================================================
    // EXECUTION TIME IN MILLISECONDS
    // ============================================================

    private Integer executionTime;

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}