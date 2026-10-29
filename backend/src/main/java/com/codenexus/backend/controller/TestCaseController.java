package com.codenexus.backend.controller;

import com.codenexus.backend.entity.TestCase;
import com.codenexus.backend.service.TestCaseService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/problems/{problemId}/test-cases")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
})
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(
            TestCaseService testCaseService
    ) {
        this.testCaseService = testCaseService;
    }

    // ============================================================
    // CREATE TEST CASE
    // ============================================================

    @PostMapping
    public ResponseEntity<?> createTestCase(
            @PathVariable Long problemId,
            @RequestBody TestCase testCase
    ) {

        try {

            TestCase savedTestCase =
                    testCaseService.createTestCase(
                            problemId,
                            testCase
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedTestCase);

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
                                    "Test case creation failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // GET ALL TEST CASES FOR PROBLEM
    // ============================================================

    @GetMapping
    public ResponseEntity<?> getTestCases(
            @PathVariable Long problemId
    ) {

        try {

            List<TestCase> testCases =
                    testCaseService
                            .getTestCasesByProblem(
                                    problemId
                            );

            return ResponseEntity.ok(
                    testCases
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
    // GET TEST CASE BY ID
    // ============================================================

    @GetMapping("/{testCaseId}")
    public ResponseEntity<?> getTestCase(
            @PathVariable Long problemId,
            @PathVariable Long testCaseId
    ) {

        try {

            TestCase testCase =
                    testCaseService
                            .getTestCaseById(
                                    testCaseId
                            );

            /*
             * Make sure the requested test case actually belongs
             * to the problem in the URL.
             */
            if (testCase.getProblem() == null
                    || !problemId.equals(
                            testCase.getProblem().getId()
                    )) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                Map.of(
                                        "message",
                                        "Test case not found for this problem"
                                )
                        );
            }

            return ResponseEntity.ok(
                    testCase
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    "Test case not found"
                            )
                    );
        }
    }

    // ============================================================
    // UPDATE TEST CASE
    // ============================================================

    @PutMapping("/{testCaseId}")
    public ResponseEntity<?> updateTestCase(
            @PathVariable Long problemId,
            @PathVariable Long testCaseId,
            @RequestBody TestCase testCase
    ) {

        try {

            TestCase existingTestCase =
                    testCaseService
                            .getTestCaseById(
                                    testCaseId
                            );

            if (existingTestCase.getProblem() == null
                    || !problemId.equals(
                            existingTestCase
                                    .getProblem()
                                    .getId()
                    )) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                Map.of(
                                        "message",
                                        "Test case not found for this problem"
                                )
                        );
            }

            TestCase updatedTestCase =
                    testCaseService.updateTestCase(
                            testCaseId,
                            testCase
                    );

            return ResponseEntity.ok(
                    updatedTestCase
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
                                    "Test case update failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // DELETE TEST CASE
    // ============================================================

    @DeleteMapping("/{testCaseId}")
    public ResponseEntity<?> deleteTestCase(
            @PathVariable Long problemId,
            @PathVariable Long testCaseId
    ) {

        try {

            TestCase existingTestCase =
                    testCaseService
                            .getTestCaseById(
                                    testCaseId
                            );

            if (existingTestCase.getProblem() == null
                    || !problemId.equals(
                            existingTestCase
                                    .getProblem()
                                    .getId()
                    )) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                Map.of(
                                        "message",
                                        "Test case not found for this problem"
                                )
                        );
            }

            testCaseService.deleteTestCase(
                    testCaseId
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Test case deleted successfully"
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
                                    "Test case deletion failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
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