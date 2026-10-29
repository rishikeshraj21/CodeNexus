package com.codenexus.backend.controller;

import com.codenexus.backend.entity.Submission;
import com.codenexus.backend.entity.TestCaseResult;
import com.codenexus.backend.entity.TestCase;
import com.codenexus.backend.dto.TestCaseResultResponse;
import com.codenexus.backend.repository.TestCaseRepository;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.repository.TestCaseResultRepository;
import com.codenexus.backend.repository.UserRepository;
import com.codenexus.backend.service.SubmissionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
})
public class SubmissionController {

    private final SubmissionService submissionService;
    private final TestCaseResultRepository testCaseResultRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;

    public SubmissionController(
            SubmissionService submissionService,
            TestCaseResultRepository testCaseResultRepository,
            TestCaseRepository testCaseRepository,
            UserRepository userRepository
    ) {
        this.submissionService = submissionService;
        this.testCaseResultRepository =
                testCaseResultRepository;
        this.testCaseRepository = testCaseRepository;
        this.userRepository = userRepository;
    }

    // ============================================================
    // CREATE SUBMISSION
    // ============================================================

    @PostMapping
    public ResponseEntity<?> createSubmission(
            @RequestParam Long userId,
            @RequestParam Long problemId,
            @RequestBody Submission submission,
            Authentication authentication
    ) {

        try {

            User authenticatedUser =
                    getAuthenticatedUser(
                            authentication
                    );

            boolean admin =
                    isAdmin(authentication);

            /*
             * A normal user can only submit code for themselves.
             * An administrator may submit on behalf of another user.
             */
            if (!admin
                    && !authenticatedUser
                    .getId()
                    .equals(userId)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                Map.of(
                                        "message",
                                        "You cannot create a submission for another user"
                                )
                        );
            }

            Submission savedSubmission =
                    submissionService.createSubmission(
                            userId,
                            problemId,
                            submission
                    );

            return ResponseEntity.ok(
                    savedSubmission
            );

        } catch (SecurityException exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
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

        } catch (Exception exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to create submission",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // GET SUBMISSION
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmission(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Submission submission =
                    submissionService
                            .getSubmissionById(id);

            if (!canAccessSubmission(
                    submission,
                    authentication
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                Map.of(
                                        "message",
                                        "You are not allowed to view this submission"
                                )
                        );
            }

            return ResponseEntity.ok(
                    submission
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    "Submission not found"
                            )
                    );
        }
    }

    // ============================================================
    // GET TEST CASE RESULTS
    // ============================================================

    @GetMapping("/{id}/test-results")
    public ResponseEntity<?> getTestCaseResults(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Submission submission =
                    submissionService
                            .getSubmissionById(id);

            if (!canAccessSubmission(
                    submission,
                    authentication
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                Map.of(
                                        "message",
                                        "You are not allowed to view these test results"
                                )
                        );
            }

            List<TestCaseResult> results =
                    testCaseResultRepository
                            .findBySubmissionIdOrderByTestCaseNumberAsc(
                                    id
                            );

            List<TestCase> testCases =
                    testCaseRepository.findByProblemIdOrderByIdAsc(
                            submission.getProblem().getId()
                    );
            boolean revealHiddenDetails = isAdmin(authentication);
            return ResponseEntity.ok(
                    results.stream()
                            .map(result -> {
                                int index = result.getTestCaseNumber() - 1;
                                boolean hidden = index >= 0
                                        && index < testCases.size()
                                        && testCases.get(index).isHidden();
                                return TestCaseResultResponse.from(
                                        result,
                                        hidden,
                                        revealHiddenDetails
                                );
                            })
                            .toList()
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    "Submission or test results not found"
                            )
                    );
        }
    }

    // ============================================================
    // GET USER SUBMISSIONS
    // ============================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserSubmissions(
            @PathVariable Long userId,
            Authentication authentication
    ) {

        try {

            User authenticatedUser =
                    getAuthenticatedUser(
                            authentication
                    );

            boolean admin =
                    isAdmin(authentication);

            /*
             * Users can only view their own submission history.
             * Admins can view any user's history.
             */
            if (!admin
                    && !authenticatedUser
                    .getId()
                    .equals(userId)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                Map.of(
                                        "message",
                                        "You cannot view another user's submissions"
                                )
                        );
            }

            return ResponseEntity.ok(
                    submissionService
                            .getUserSubmissions(userId)
            );

        } catch (SecurityException exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );

        } catch (Exception exception) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to load submissions",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // GET PROBLEM SUBMISSIONS
    // ============================================================

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<?> getProblemSubmissions(
            @PathVariable Long problemId,
            Authentication authentication
    ) {

        /*
         * Problem-wide submission data can expose other users'
         * code, so this endpoint is administrator-only.
         */
        if (!isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "message",
                                    "Administrator access required"
                            )
                    );
        }

        try {

            return ResponseEntity.ok(
                    submissionService
                            .getProblemSubmissions(
                                    problemId
                            )
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to load problem submissions",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // GET AUTHENTICATED USER
    // ============================================================

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new SecurityException(
                    "Authentication required"
            );
        }

        String email =
                authentication.getName();

        if (email == null || email.isBlank()) {

            throw new SecurityException(
                    "Authenticated user not found"
            );
        }

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new SecurityException(
                                "Authenticated user not found"
                        )
                );
    }

    // ============================================================
    // ADMIN CHECK
    // ============================================================

    private boolean isAdmin(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return false;
        }

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
    // SUBMISSION ACCESS CHECK
    // ============================================================

    private boolean canAccessSubmission(
            Submission submission,
            Authentication authentication
    ) {

        if (isAdmin(authentication)) {
            return true;
        }

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return false;
        }

        if (submission == null
                || submission.getUser() == null) {

            return false;
        }

        String authenticatedEmail =
                authentication.getName();

        String submissionUserEmail =
                submission
                        .getUser()
                        .getEmail();

        return authenticatedEmail != null
                && submissionUserEmail != null
                && submissionUserEmail.equalsIgnoreCase(
                        authenticatedEmail
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