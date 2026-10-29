package com.codenexus.backend.dto;

import com.codenexus.backend.entity.TestCaseResult;

public record TestCaseResultResponse(
        Long id,
        Integer testCaseNumber,
        String status,
        Integer executionTime,
        String errorMessage,
        String input,
        String expectedOutput,
        String actualOutput,
        boolean hidden
) {

    public static TestCaseResultResponse from(
            TestCaseResult result,
            boolean hidden,
            boolean revealHiddenDetails
    ) {
        boolean redact = hidden && !revealHiddenDetails;
        return new TestCaseResultResponse(
                result.getId(),
                result.getTestCaseNumber(),
                result.getStatus(),
                result.getExecutionTime(),
                redact ? null : result.getErrorMessage(),
                redact ? null : result.getInput(),
                redact ? null : result.getExpectedOutput(),
                redact ? null : result.getActualOutput(),
                hidden
        );
    }
}
