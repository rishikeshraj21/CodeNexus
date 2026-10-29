package com.codenexus.backend.service;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.entity.Submission;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.repository.ProblemRepository;
import com.codenexus.backend.repository.SubmissionRepository;
import com.codenexus.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final NotificationService notificationService;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            ProblemRepository problemRepository,
            NotificationService notificationService
    ) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.notificationService = notificationService;
    }

    // ============================================================
    // CREATE SUBMISSION
    // ============================================================

    public Submission createSubmission(
            Long userId,
            Long problemId,
            Submission submission
    ) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        if (problemId == null) {
            throw new IllegalArgumentException(
                    "Problem ID is required"
            );
        }

        if (submission == null) {
            throw new IllegalArgumentException(
                    "Submission data is required"
            );
        }

        if (submission.getSourceCode() == null
                || submission.getSourceCode().isBlank()) {

            throw new IllegalArgumentException(
                    "Source code cannot be empty"
            );
        }

        if (submission.getLanguage() == null
                || submission.getLanguage().isBlank()) {

            throw new IllegalArgumentException(
                    "Programming language is required"
            );
        }

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        Problem problem =
                problemRepository
                        .findById(problemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Problem not found"
                                )
                        );

        submission.setUser(user);
        submission.setProblem(problem);

        /*
         * Every newly-created submission starts as PENDING.
         * JudgeService changes this after execution.
         */
        submission.setStatus("PENDING");

        submission.setSubmittedAt(
                LocalDateTime.now()
        );

        return submissionRepository.save(
                submission
        );
    }

    // ============================================================
    // GET SUBMISSION BY ID
    // ============================================================

    public Submission getSubmissionById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Submission ID is required"
            );
        }

        return submissionRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Submission not found"
                        )
                );
    }

    // ============================================================
    // GET ALL SUBMISSIONS
    // ============================================================

    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    // ============================================================
    // GET USER SUBMISSIONS
    // ============================================================

    public List<Submission> getUserSubmissions(
            Long userId
    ) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        return submissionRepository
                .findByUserId(userId);
    }

    // ============================================================
    // GET PROBLEM SUBMISSIONS
    // ============================================================

    public List<Submission> getProblemSubmissions(
            Long problemId
    ) {

        if (problemId == null) {
            throw new IllegalArgumentException(
                    "Problem ID is required"
            );
        }

        return submissionRepository
                .findByProblemId(problemId);
    }

    // ============================================================
    // UPDATE JUDGE RESULT
    // ============================================================

    @Transactional
    public Submission updateResult(
            Long id,
            String status,
            Integer executionTime,
            Integer memoryUsed,
            String output,
            String errorMessage
    ) {
        return updateResult(
                id,
                status,
                executionTime,
                memoryUsed,
                output,
                errorMessage,
                null,
                null
        );
    }

    @Transactional
    public Submission updateResult(
            Long id,
            String status,
            Integer executionTime,
            Integer memoryUsed,
            String output,
            String errorMessage,
            Integer passedTestCases,
            Integer totalTestCases
    ) {

        Submission submission =
                getSubmissionById(id);

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Submission status is required"
            );
        }

        submission.setStatus(
                status.trim().toUpperCase()
        );

        submission.setExecutionTime(
                executionTime
        );

        submission.setMemoryUsed(
                memoryUsed
        );

        submission.setOutput(
                output
        );

        submission.setErrorMessage(
                errorMessage
        );
        if (passedTestCases != null) {
            submission.setPassedTestCases(passedTestCases);
        }
        if (totalTestCases != null) {
            submission.setTotalTestCases(totalTestCases);
        }

        Submission savedSubmission = submissionRepository.save(submission);
        if ("ACCEPTED".equals(submission.getStatus())) {
            notificationService.recordAcceptedSubmission(
                    submission.getUser(),
                    submission.getProblem(),
                    submission.getId()
            );
        }
        return savedSubmission;
    }
}