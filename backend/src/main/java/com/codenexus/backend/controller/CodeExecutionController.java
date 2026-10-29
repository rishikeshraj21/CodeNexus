package com.codenexus.backend.controller;

import com.codenexus.backend.executor.CodeExecutionAdapter;
import com.codenexus.backend.entity.TestCase;
import com.codenexus.backend.repository.TestCaseRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
})
public class CodeExecutionController {

    private final List<CodeExecutionAdapter> executionAdapters;
    private final TestCaseRepository testCaseRepository;

    public CodeExecutionController(
            List<CodeExecutionAdapter> executionAdapters,
            TestCaseRepository testCaseRepository
    ) {
        this.executionAdapters = executionAdapters;
        this.testCaseRepository = testCaseRepository;
    }

    // ============================================================
    // RUN CODE
    // ============================================================

    @PostMapping("/run")
    public ResponseEntity<?> runCode(
            @RequestBody CodeExecutionRequest request
    ) {

        if (request == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Request body is required"
                            )
                    );
        }

        if (request.sourceCode() == null
                || request.sourceCode().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Source code cannot be empty"
                            )
                    );
        }

        String language =
                request.language() == null
                        ? "java"
                        : request.language()
                                .trim()
                                .toLowerCase();

        CodeExecutionAdapter executionAdapter =
                executionAdapters.stream()
                        .filter(adapter -> adapter.supports(language))
                        .findFirst()
                        .orElse(null);

        if (executionAdapter == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "message",
                                    "Unsupported language. Supported languages: Java, C, C++, Python, JavaScript"
                            )
                    );
        }

        Path tempDirectory = null;

        try {

            long startTime =
                    System.currentTimeMillis();

            CodeExecutionAdapter.CompilationResult compilation =
                    executionAdapter.compile(
                            request.sourceCode(),
                            language
                    );

            if (!compilation.success()) {

                int executionTime =
                        elapsedTime(startTime);

                Map<String, Object> response =
                        new LinkedHashMap<>();

                response.put(
                        "status",
                        "COMPILATION_ERROR"
                );

                response.put(
                        "output",
                        ""
                );

                response.put(
                        "error",
                        safeString(compilation.error())
                );

                response.put(
                        "executionTime",
                        executionTime
                );
                response.put(
                        "memoryUsed",
                        null
                );

                response.put(
                        "language",
                        language
                );

                return ResponseEntity.ok(
                        response
                );
            }

            tempDirectory =
                    compilation.workspace();
            long executionStartTime =
                    System.currentTimeMillis();

            CodeExecutionAdapter.ExecutionResult execution =
                    executionAdapter.execute(
                            tempDirectory,
                            request.input()
                    );

            int executionTime =
                    elapsedTime(executionStartTime);

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "status",
                    safeString(execution.status())
            );

            response.put(
                    "output",
                    safeString(execution.output())
            );

            response.put(
                    "error",
                    safeString(execution.error())
            );

            response.put(
                    "executionTime",
                    executionTime
            );
            response.put(
                    "memoryUsed",
                    execution.memoryUsed()
            );
            response.put(
                    "expectedOutput",
                    expectedOutputForPublicCase(
                            request.problemId(),
                            request.input()
                    )
            );

            response.put(
                    "language",
                    language
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
                                    "status",
                                    "EXECUTION_ERROR",
                                    "output",
                                    "",
                                    "error",
                                    "Code execution failed: "
                                            + safeMessage(exception)
                            )
                    );

        } finally {

            if (tempDirectory != null) {

                executionAdapter
                        .cleanup(
                                tempDirectory
                        );
            }
        }
    }

    // ============================================================
    // REQUEST DTO
    // ============================================================

    public record CodeExecutionRequest(
            String sourceCode,
            String language,
            String input,
            Long problemId
    ) {
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private String safeString(
            String value
    ) {

        return value == null
                ? ""
                : value;
    }

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

    private String expectedOutputForPublicCase(Long problemId, String input) {
        if (problemId == null || input == null) {
            return null;
        }
        for (TestCase testCase :
                testCaseRepository.findByProblemIdOrderByIdAsc(problemId)) {
            if (testCase != null
                    && !testCase.isHidden()
                    && normalizeWhitespace(testCase.getInput())
                            .equals(normalizeWhitespace(input))) {
                return testCase.getExpectedOutput();
            }
        }
        return null;
    }

    private String normalizeWhitespace(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }

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