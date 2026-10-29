package com.codenexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminSubmissionResponse {

    // ============================================================
    // SUBMISSION INFORMATION
    // ============================================================

    private Long id;

    // ============================================================
    // USER INFORMATION
    // ============================================================

    private Long userId;

    private String userName;

    private String userEmail;

    // ============================================================
    // PROBLEM INFORMATION
    // ============================================================

    private Long problemId;

    private String problemTitle;

    // ============================================================
    // SUBMISSION DETAILS
    // ============================================================

    private String language;

    private String status;

    private Integer executionTime;

    private Integer memoryUsed;

    // ============================================================
    // CODE AND RESULT
    // ============================================================

    private String sourceCode;

    private String output;

    private String errorMessage;

    // ============================================================
    // TIMESTAMP
    // ============================================================

    private LocalDateTime submittedAt;
}