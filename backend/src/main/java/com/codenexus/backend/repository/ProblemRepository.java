package com.codenexus.backend.repository;

import com.codenexus.backend.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProblemRepository extends
        JpaRepository<Problem, Long>,
        JpaSpecificationExecutor<Problem> {
}