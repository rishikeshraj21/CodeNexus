package com.codenexus.backend.repository;

import com.codenexus.backend.entity.TestCaseResult;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseResultRepository
        extends JpaRepository<TestCaseResult, Long> {

    /*
     * Gets all test-case results for a submission
     * in the correct test-case order.
     */
    List<TestCaseResult> findBySubmissionIdOrderByTestCaseNumberAsc(
            Long submissionId
    );

    /*
     * Deletes all test-case results belonging to
     * a particular submission.
     *
     * This is useful when a submission is judged again.
     */
    void deleteBySubmissionId(Long submissionId);
}