package com.codenexus.backend.repository;

import com.codenexus.backend.entity.TestCase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {

    /*
     * Returns all test cases belonging to a particular problem.
     */
    List<TestCase> findByProblemId(Long problemId);

    List<TestCase> findByProblemIdOrderByIdAsc(Long problemId);
}