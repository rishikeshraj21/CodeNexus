package com.codenexus.backend.service;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.entity.TestCase;
import com.codenexus.backend.repository.ProblemRepository;
import com.codenexus.backend.repository.TestCaseRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository problemRepository;

    public TestCaseService(
            TestCaseRepository testCaseRepository,
            ProblemRepository problemRepository
    ) {
        this.testCaseRepository = testCaseRepository;
        this.problemRepository = problemRepository;
    }

    // ============================================================
    // CREATE TEST CASE
    // ============================================================

    public TestCase createTestCase(
            Long problemId,
            TestCase testCase
    ) {

        if (problemId == null) {
            throw new IllegalArgumentException(
                    "Problem ID is required"
            );
        }

        if (testCase == null) {
            throw new IllegalArgumentException(
                    "Test case data is required"
            );
        }

        validateTestCase(testCase);

        Problem problem =
                problemRepository
                        .findById(problemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Problem not found"
                                )
                        );

        testCase.setProblem(problem);

        return testCaseRepository.save(testCase);
    }

    // ============================================================
    // GET TEST CASES BY PROBLEM
    // ============================================================

    public List<TestCase> getTestCasesByProblem(
            Long problemId
    ) {

        if (problemId == null) {
            throw new IllegalArgumentException(
                    "Problem ID is required"
            );
        }

        /*
         * Verify that the problem exists before querying
         * its test cases.
         */
        if (!problemRepository.existsById(problemId)) {
            throw new RuntimeException(
                    "Problem not found"
            );
        }

        return testCaseRepository
                .findByProblemId(problemId);
    }

    // ============================================================
    // GET TEST CASE BY ID
    // ============================================================

    public TestCase getTestCaseById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Test case ID is required"
            );
        }

        return testCaseRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Test case not found"
                        )
                );
    }

    // ============================================================
    // UPDATE TEST CASE
    // ============================================================

    public TestCase updateTestCase(
            Long id,
            TestCase updatedTestCase
    ) {

        if (updatedTestCase == null) {
            throw new IllegalArgumentException(
                    "Test case data is required"
            );
        }

        validateTestCase(updatedTestCase);

        TestCase existingTestCase =
                getTestCaseById(id);

        existingTestCase.setInput(
                updatedTestCase.getInput()
        );

        existingTestCase.setExpectedOutput(
                updatedTestCase.getExpectedOutput()
        );

        existingTestCase.setHidden(
                updatedTestCase.isHidden()
        );

        return testCaseRepository.save(
                existingTestCase
        );
    }

    // ============================================================
    // DELETE TEST CASE
    // ============================================================

    public void deleteTestCase(Long id) {

        TestCase testCase =
                getTestCaseById(id);

        testCaseRepository.delete(testCase);
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    private void validateTestCase(
            TestCase testCase
    ) {

        if (testCase.getInput() == null) {
            throw new IllegalArgumentException(
                    "Test case input is required"
            );
        }

        if (testCase.getExpectedOutput() == null) {
            throw new IllegalArgumentException(
                    "Expected output is required"
            );
        }
    }
}