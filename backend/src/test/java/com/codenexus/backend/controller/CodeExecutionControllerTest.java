package com.codenexus.backend.controller;

import com.codenexus.backend.entity.TestCase;
import com.codenexus.backend.executor.CodeExecutionAdapter;
import com.codenexus.backend.repository.TestCaseRepository;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CodeExecutionControllerTest {

    private CodeExecutionAdapter executionAdapter;
    private TestCaseRepository testCaseRepository;
    private CodeExecutionController controller;

    @BeforeEach
    void setUp() {
        executionAdapter = mock(CodeExecutionAdapter.class);
        testCaseRepository = mock(TestCaseRepository.class);
        controller = new CodeExecutionController(
                List.of(executionAdapter),
                testCaseRepository
        );
        when(executionAdapter.supports("java")).thenReturn(true);
        when(executionAdapter.compile("public class Main {}", "java"))
                .thenReturn(new CodeExecutionAdapter.CompilationResult(
                        true,
                        Path.of("workspace"),
                        ""
                ));
        when(executionAdapter.execute(any(), any()))
                .thenReturn(new CodeExecutionAdapter.ExecutionResult(
                        "EXECUTED",
                        "actual",
                        "",
                        2048
                ));
    }

    @Test
    void returnsExpectedOutputOnlyForMatchingVisibleTestCase() {
        when(testCaseRepository.findByProblemIdOrderByIdAsc(4L))
                .thenReturn(List.of(
                        testCase("1  2", "expected", false),
                        testCase("secret", "hidden expected", true)
                ));

        ResponseEntity<?> response = controller.runCode(
                new CodeExecutionController.CodeExecutionRequest(
                        "public class Main {}",
                        "JAVA",
                        "1\n2",
                        4L
                )
        );

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(200, response.getStatusCode().value());
        assertEquals("expected", body.get("expectedOutput"));
        assertEquals(2048, body.get("memoryUsed"));
        assertEquals("actual", body.get("output"));
    }

    @Test
    void doesNotExposeExpectedOutputForHiddenTestCase() {
        when(testCaseRepository.findByProblemIdOrderByIdAsc(4L))
                .thenReturn(List.of(testCase("secret", "hidden expected", true)));

        ResponseEntity<?> response = controller.runCode(
                new CodeExecutionController.CodeExecutionRequest(
                        "public class Main {}",
                        "JAVA",
                        "secret",
                        4L
                )
        );

        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNull(body.get("expectedOutput"));
    }

    private TestCase testCase(String input, String output, boolean hidden) {
        return TestCase.builder()
                .input(input)
                .expectedOutput(output)
                .hidden(hidden)
                .build();
    }
}
