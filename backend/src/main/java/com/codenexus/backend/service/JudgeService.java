package com.codenexus.backend.service;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.entity.Submission;
import com.codenexus.backend.entity.TestCase;
import com.codenexus.backend.entity.TestCaseResult;
import com.codenexus.backend.executor.CodeExecutionAdapter;
import com.codenexus.backend.repository.TestCaseRepository;
import com.codenexus.backend.repository.TestCaseResultRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.util.List;

@Service
public class JudgeService {

    private final SubmissionService submissionService;
    private final TestCaseRepository testCaseRepository;
    private final TestCaseResultRepository testCaseResultRepository;
    private final List<CodeExecutionAdapter> executionAdapters;

    public JudgeService(
            SubmissionService submissionService,
            TestCaseRepository testCaseRepository,
            TestCaseResultRepository testCaseResultRepository,
            List<CodeExecutionAdapter> executionAdapters
    ) {
        this.submissionService = submissionService;
        this.testCaseRepository = testCaseRepository;
        this.testCaseResultRepository = testCaseResultRepository;
        this.executionAdapters = executionAdapters;
    }

    // ============================================================
    // JUDGE SUBMISSION
    // ============================================================

    @Transactional
    public Submission judgeSubmission(
            Long submissionId
    ) {

        Submission submission =
                submissionService.getSubmissionById(
                        submissionId
                );

        long judgeStart =
                System.currentTimeMillis();

        /*
         * Remove previous test-case results.
         *
         * This makes re-judging the same submission safe.
         */
        testCaseResultRepository
                .deleteBySubmissionId(submissionId);

        Problem problem =
                submission.getProblem();

        if (problem == null
                || problem.getId() == null) {

            return submissionService.updateResult(
                    submissionId,
                    "JUDGE_ERROR",
                    elapsedTime(judgeStart),
                    0,
                    "",
                    "Problem associated with submission was not found",
                    0,
                    0
            );
        }

        // --------------------------------------------------------
        // GET TEST CASES
        // --------------------------------------------------------

        List<TestCase> testCases =
                testCaseRepository
                        .findByProblemIdOrderByIdAsc(problem.getId());

        if (testCases == null
                || testCases.isEmpty()) {

            return submissionService.updateResult(
                    submissionId,
                    "JUDGE_ERROR",
                    elapsedTime(judgeStart),
                    0,
                    "",
                    "No test cases are configured for this problem",
                    0,
                    0
            );
        }

        // --------------------------------------------------------
        // Select the runner matching the submitted language.
        // --------------------------------------------------------

        String language =
                safeString(
                        submission.getLanguage()
                ).trim().toLowerCase();

        CodeExecutionAdapter executionAdapter =
                executionAdapters.stream()
                        .filter(adapter -> adapter.supports(language))
                        .findFirst()
                        .orElse(null);

        if (executionAdapter == null) {
            return submissionService.updateResult(
                    submissionId,
                    "UNSUPPORTED_LANGUAGE",
                    elapsedTime(judgeStart),
                    0,
                    "",
                    "Unsupported language. Supported languages: Java, C, C++, Python, JavaScript",
                    0,
                    testCases.size()
            );
        }

        // --------------------------------------------------------
        // COMPILE
        // --------------------------------------------------------

        CodeExecutionAdapter.CompilationResult compilation =
                executionAdapter.compile(
                        submission.getSourceCode(),
                        language
                );

        if (!compilation.success()) {

            String compilationError =
                    safeString(compilation.error());

            saveCompilationResult(
                    submission,
                    testCases.size(),
                    compilationError,
                    elapsedTime(judgeStart)
            );

            return submissionService.updateResult(
                    submissionId,
                    "COMPILATION_ERROR",
                    elapsedTime(judgeStart),
                    0,
                    "",
                    compilationError,
                    0,
                    testCases.size()
            );
        }

        Path tempDirectory =
                compilation.workspace();

        try {

            boolean allPassed = true;
            int passedTestCases = 0;
            Integer peakMemoryUsed = null;

            String firstFailure = "";
            String firstFailureStatus = "";

            StringBuilder finalOutput =
                    new StringBuilder();

            // ----------------------------------------------------
            // RUN EVERY TEST CASE
            // ----------------------------------------------------

            for (int index = 0;
                 index < testCases.size();
                 index++) {

                TestCase testCase =
                        testCases.get(index);

                int testCaseNumber =
                        index + 1;

                long testStart =
                        System.currentTimeMillis();

                CodeExecutionAdapter.ExecutionResult execution =
                        executionAdapter.execute(
                                tempDirectory,
                                safeString(testCase.getInput())
                        );
                if (execution.memoryUsed() != null) {
                    peakMemoryUsed = peakMemoryUsed == null
                            ? execution.memoryUsed()
                            : Math.max(peakMemoryUsed, execution.memoryUsed());
                }

                int executionTime =
                        elapsedTime(testStart);

                String actualOutput =
                        safeString(
                                execution.output()
                        );

                String expectedOutput =
                        safeString(
                                testCase.getExpectedOutput()
                        );

                String status;

                String errorMessage = "";

                // ------------------------------------------------
                // TIME LIMIT
                // ------------------------------------------------

                if ("TIME_LIMIT_EXCEEDED".equals(
                        execution.status()
                )) {

                    status = "TIME_LIMIT_EXCEEDED";

                    errorMessage =
                            safeString(execution.error());

                    allPassed = false;

                    if (firstFailure.isBlank()) {
                        firstFailureStatus = status;
                        firstFailure =
                                "Test case "
                                        + testCaseNumber
                                        + ": "
                                        + status;
                    }

                }

                // ------------------------------------------------
                // RUNTIME ERROR
                // ------------------------------------------------

                else if ("RUNTIME_ERROR".equals(
                        execution.status()
                )) {

                    status = "RUNTIME_ERROR";

                    errorMessage =
                            safeString(execution.error());

                    allPassed = false;

                    if (firstFailure.isBlank()) {
                        firstFailureStatus = status;
                        firstFailure =
                                "Test case "
                                        + testCaseNumber
                                        + ": "
                                        + status;
                    }

                }

                // ------------------------------------------------
                // DOCKER EXECUTION ERROR
                // ------------------------------------------------

                else if ("EXECUTION_ERROR".equals(
                        execution.status()
                )) {

                    status = "RUNTIME_ERROR";

                    errorMessage =
                            safeString(execution.error());

                    allPassed = false;

                    if (firstFailure.isBlank()) {
                        firstFailureStatus = status;
                        firstFailure =
                                "Test case "
                                        + testCaseNumber
                                        + ": "
                                        + status;
                    }

                }

                // ------------------------------------------------
                // OUTPUT COMPARISON
                // ------------------------------------------------

                else {

                    if (normalizeOutput(actualOutput)
                            .equals(
                                    normalizeOutput(
                                            expectedOutput
                                    )
                            )) {

                        status = "PASSED";
                        passedTestCases++;

                    } else {

                        status = "FAILED";

                        allPassed = false;

                        if (firstFailure.isBlank()) {
                            firstFailureStatus = "WRONG_ANSWER";
                            firstFailure =
                                    "Test case "
                                            + testCaseNumber
                                            + ": WRONG ANSWER";
                        }
                    }
                }

                // ------------------------------------------------
                // SAVE TEST CASE RESULT
                // ------------------------------------------------

                saveTestCaseResult(
                        submission,
                        testCaseNumber,
                        testCase,
                        actualOutput,
                        status,
                        executionTime,
                        errorMessage
                );

                // ------------------------------------------------
                // BUILD SUMMARY
                // ------------------------------------------------

                finalOutput
                        .append("Test Case ")
                        .append(testCaseNumber)
                        .append(": ")
                        .append(status)
                        .append(" (")
                        .append(executionTime)
                        .append(" ms)")
                        .append("\n");

            }

            // ----------------------------------------------------
            // FINAL STATUS
            // ----------------------------------------------------

            String finalStatus =
                    allPassed
                            ? "ACCEPTED"
                            : firstFailureStatus;

            String errorMessage =
                    allPassed
                            ? ""
                            : firstFailure;

            return submissionService.updateResult(
                    submissionId,
                    finalStatus,
                    elapsedTime(judgeStart),
                    peakMemoryUsed,
                    finalOutput.toString().trim(),
                    errorMessage,
                    passedTestCases,
                    testCases.size()
            );

        } finally {

            // ----------------------------------------------------
            // ALWAYS CLEAN TEMP DIRECTORY
            // ----------------------------------------------------

            executionAdapter.cleanup(
                    tempDirectory
            );
        }
    }

    // ============================================================
    // SAVE TEST CASE RESULT
    // ============================================================

    private void saveTestCaseResult(
            Submission submission,
            int testCaseNumber,
            TestCase testCase,
            String actualOutput,
            String status,
            int executionTime,
            String errorMessage
    ) {

        TestCaseResult result =
                TestCaseResult.builder()
                        .submission(submission)
                        .testCaseNumber(testCaseNumber)
                        .input(
                                safeString(
                                        testCase.getInput()
                                )
                        )
                        .expectedOutput(
                                safeString(
                                        testCase.getExpectedOutput()
                                )
                        )
                        .actualOutput(
                                safeString(actualOutput)
                        )
                        .status(status)
                        .executionTime(executionTime)
                        .errorMessage(
                                safeString(errorMessage)
                        )
                        .build();

        testCaseResultRepository.save(result);
    }

    // ============================================================
    // SAVE COMPILATION RESULT
    // ============================================================

    private void saveCompilationResult(
            Submission submission,
            int testCaseCount,
            String compilationError,
            int executionTime
    ) {

        /*
         * Store one result entry so the submission details page
         * can clearly display that compilation failed before
         * any test case was executed.
         */
        TestCaseResult result =
                TestCaseResult.builder()
                        .submission(submission)
                        .testCaseNumber(0)
                        .input("")
                        .expectedOutput("")
                        .actualOutput("")
                        .status("COMPILATION_ERROR")
                        .executionTime(executionTime)
                        .errorMessage(
                                safeString(
                                        compilationError
                                )
                        )
                        .build();

        testCaseResultRepository.save(result);
    }

    // ============================================================
    // NORMALIZE OUTPUT
    // ============================================================

    private String normalizeOutput(
            String output
    ) {

        if (output == null) {
            return "";
        }

        /*
         * Normalize Windows/Linux line endings,
         * remove trailing whitespace from each line,
         * and ignore extra whitespace at the end.
         */
        return output
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .lines()
                .map(line -> line.trim())
                .reduce(
                        "",
                        (result, line) ->
                                result.isEmpty()
                                        ? line
                                        : result + "\n" + line
                )
                .trim();
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
    // ELAPSED TIME
    // ============================================================

    private int elapsedTime(
            long startTime
    ) {

        long elapsed =
                System.currentTimeMillis()
                        - startTime;

        if (elapsed <= 0) {
            return 0;
        }

        if (elapsed > Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }

        return (int) elapsed;
    }
}