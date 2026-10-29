package com.codenexus.backend.dto;

import com.codenexus.backend.entity.TestCaseResult;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class TestCaseResultResponseTest {

    @Test
    void hidesDetailsForHiddenTestsFromRegularUsers() {
        TestCaseResult result = TestCaseResult.builder()
                .id(4L)
                .testCaseNumber(2)
                .input("private input")
                .expectedOutput("private expected")
                .actualOutput("private actual")
                .status("FAILED")
                .executionTime(12)
                .errorMessage("private error")
                .build();

        TestCaseResultResponse response =
                TestCaseResultResponse.from(result, true, false);

        assertEquals(2, response.testCaseNumber());
        assertEquals("FAILED", response.status());
        assertEquals(true, response.hidden());
        assertNull(response.input());
        assertNull(response.expectedOutput());
        assertNull(response.actualOutput());
        assertNull(response.errorMessage());
    }

    @Test
    void exposesDetailsForAdmins() {
        TestCaseResult result = TestCaseResult.builder()
                .id(4L)
                .testCaseNumber(2)
                .input("input")
                .expectedOutput("expected")
                .actualOutput("actual")
                .status("FAILED")
                .executionTime(12)
                .errorMessage("error")
                .build();

        TestCaseResultResponse response =
                TestCaseResultResponse.from(result, true, true);

        assertEquals("input", response.input());
        assertEquals("expected", response.expectedOutput());
        assertEquals("actual", response.actualOutput());
        assertEquals("error", response.errorMessage());
    }
}
