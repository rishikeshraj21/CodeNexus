package com.codenexus.backend.controller;

import com.codenexus.backend.entity.Submission;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.service.JudgeService;
import com.codenexus.backend.service.SubmissionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/judge")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
})
public class JudgeController {

    private final JudgeService judgeService;
    private final SubmissionService submissionService;

    public JudgeController(
            JudgeService judgeService,
            SubmissionService submissionService
    ) {
        this.judgeService = judgeService;
        this.submissionService = submissionService;
    }

    // ============================================================
    // JUDGE SUBMISSION
    // ============================================================

    @PostMapping("/{submissionId}")
    public ResponseEntity<?> judgeSubmission(
            @PathVariable Long submissionId,
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
                                        "Authentication required"
                                )
                        );
            }

            Submission submission =
                    submissionService
                            .getSubmissionById(
                                    submissionId
                            );

            if (!canJudge(
                    submission,
                    authentication
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                Map.of(
                                        "message",
                                        "You are not allowed to judge this submission"
                                )
                        );
            }

            Submission judgedSubmission =
                    judgeService.judgeSubmission(
                            submissionId
                    );

            return ResponseEntity.ok(
                    judgedSubmission
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

        } catch (Exception exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Judging failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // CHECK JUDGE ACCESS
    // ============================================================

    private boolean canJudge(
            Submission submission,
            Authentication authentication
    ) {

        if (submission == null
                || authentication == null
                || !authentication.isAuthenticated()) {

            return false;
        }

        if (isAdmin(authentication)) {
            return true;
        }

        if (submission.getUser() == null) {
            return false;
        }

        User user =
                submission.getUser();

        String authenticatedEmail =
                authentication.getName();

        return user.getEmail() != null
                && authenticatedEmail != null
                && user.getEmail()
                        .equalsIgnoreCase(
                                authenticatedEmail
                        );
    }

    // ============================================================
    // ADMIN CHECK
    // ============================================================

    private boolean isAdmin(
            Authentication authentication
    ) {

        return authentication
                .getAuthorities()
                .stream()
                .anyMatch(authority ->
                        "ROLE_ADMIN".equals(
                                authority.getAuthority()
                        )
                );
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