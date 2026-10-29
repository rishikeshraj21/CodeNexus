package com.codenexus.backend.controller;

import com.codenexus.backend.dto.AdminSubmissionResponse;
import com.codenexus.backend.entity.Submission;
import com.codenexus.backend.service.SubmissionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
})
public class AdminController {

    private final SubmissionService submissionService;

    public AdminController(
            SubmissionService submissionService
    ) {
        this.submissionService = submissionService;
    }

    // ============================================================
    // GET ALL SUBMISSIONS
    // ============================================================

    @GetMapping("/submissions")
    public ResponseEntity<?> getAllSubmissions() {

        try {

            List<Submission> submissions =
                    submissionService
                            .getAllSubmissions();

            List<AdminSubmissionResponse> response =
                    submissions
                            .stream()
                            .map(
                                    this::toAdminResponse
                            )
                            .collect(
                                    Collectors.toList()
                            );

            return ResponseEntity.ok(
                    response
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
                                    "Unable to load submissions",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // GET SUBMISSION BY ID
    // ============================================================

    @GetMapping("/submissions/{id}")
    public ResponseEntity<?> getSubmission(
            @PathVariable Long id
    ) {

        try {

            Submission submission =
                    submissionService
                            .getSubmissionById(id);

            return ResponseEntity.ok(
                    toAdminResponse(submission)
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
    // DELETE SUBMISSION
    // ============================================================

    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<?> deleteSubmission(
            @PathVariable Long id
    ) {

        try {

            /*
             * The current SubmissionService does not expose a
             * delete method, so this endpoint intentionally reports
             * that deletion is not available instead of pretending
             * the operation succeeded.
             */
            submissionService.getSubmissionById(id);

            return ResponseEntity
                    .status(HttpStatus.NOT_IMPLEMENTED)
                    .body(
                            Map.of(
                                    "message",
                                    "Submission deletion is not enabled"
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
    // CONVERT SUBMISSION TO ADMIN DTO
    // ============================================================

    private AdminSubmissionResponse toAdminResponse(
            Submission submission
    ) {

        if (submission == null) {
            return null;
        }

        Long userId = null;
        String userName = "";
        String userEmail = "";

        if (submission.getUser() != null) {

            userId =
                    submission
                            .getUser()
                            .getId();

            userName =
                    safeString(
                            submission
                                    .getUser()
                                    .getName()
                    );

            userEmail =
                    safeString(
                            submission
                                    .getUser()
                                    .getEmail()
                    );
        }

        Long problemId = null;
        String problemTitle = "";

        if (submission.getProblem() != null) {

            problemId =
                    submission
                            .getProblem()
                            .getId();

            problemTitle =
                    safeString(
                            submission
                                    .getProblem()
                                    .getTitle()
                    );
        }

        return new AdminSubmissionResponse(
                submission.getId(),
                userId,
                userName,
                userEmail,
                problemId,
                problemTitle,
                safeString(
                        submission.getLanguage()
                ),
                safeString(
                        submission.getStatus()
                ),
                submission.getExecutionTime(),
                submission.getMemoryUsed(),
                safeString(
                        submission.getSourceCode()
                ),
                safeString(
                        submission.getOutput()
                ),
                safeString(
                        submission.getErrorMessage()
                ),
                submission.getSubmittedAt()
        );
    }

    // ============================================================
    // SAFE STRING
    // ============================================================

    private String safeString(
            String value
    ) {

        return value == null
                ? ""
                : value;
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