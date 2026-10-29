package com.codenexus.backend.service;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.entity.Submission;
import com.codenexus.backend.entity.TestCase;
import com.codenexus.backend.executor.CodeExecutionAdapter;
import com.codenexus.backend.repository.TestCaseRepository;
import com.codenexus.backend.repository.TestCaseResultRepository;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JudgeServiceTest {

    @Mock
    private SubmissionService submissionService;

    @Mock
    private TestCaseRepository testCaseRepository;

    @Mock
    private TestCaseResultRepository testCaseResultRepository;

    @Mock
    private CodeExecutionAdapter executionAdapter;

    private JudgeService judgeService;

    @BeforeEach
    void setUp() {
        judgeService = new JudgeService(
                submissionService,
                testCaseRepository,
                testCaseResultRepository,
                List.of(executionAdapter)
        );
    }

    @Test
    void runsEveryTestCaseAndPersistsPeakMemoryAfterFirstFailure() {
        Problem problem = new Problem();
        problem.setId(9L);
        Submission submission = new Submission();
        submission.setId(15L);
        submission.setProblem(problem);
        submission.setSourceCode("public class Main {}");
        submission.setLanguage("JAVA");

        List<TestCase> testCases = List.of(
                testCase(problem, "1", "expected-1"),
                testCase(problem, "2", "expected-2"),
                testCase(problem, "3", "expected-3")
        );

        when(submissionService.getSubmissionById(15L))
                .thenReturn(submission);
        when(testCaseRepository.findByProblemIdOrderByIdAsc(9L))
                .thenReturn(testCases);
        when(executionAdapter.supports("java"))
                .thenReturn(true);
        when(executionAdapter.compile(submission.getSourceCode(), "java"))
                .thenReturn(new CodeExecutionAdapter.CompilationResult(
                        true,
                        Path.of("workspace"),
                        ""
                ));
        when(executionAdapter.execute(any(), eq("1")))
                .thenReturn(new CodeExecutionAdapter.ExecutionResult(
                        "EXECUTED", "wrong", "", 128
                ));
        when(executionAdapter.execute(any(), eq("2")))
                .thenReturn(new CodeExecutionAdapter.ExecutionResult(
                        "EXECUTED", "expected-2", "", 256
                ));
        when(executionAdapter.execute(any(), eq("3")))
                .thenReturn(new CodeExecutionAdapter.ExecutionResult(
                        "EXECUTED", "expected-3", "", 192
                ));

        judgeService.judgeSubmission(15L);

        verify(executionAdapter).execute(any(), eq("1"));
        verify(executionAdapter).execute(any(), eq("2"));
        verify(executionAdapter).execute(any(), eq("3"));
        verify(testCaseResultRepository, org.mockito.Mockito.times(3))
                .save(any());
        verify(submissionService).updateResult(
                eq(15L),
                eq("WRONG_ANSWER"),
                any(),
                eq(256),
                any(),
                eq("Test case 1: WRONG ANSWER"),
                eq(2),
                eq(3)
        );
        verify(executionAdapter).cleanup(Path.of("workspace"));
    }

    @Test
    void doesNotReportZeroMemoryWhenRuntimeMeasurementIsUnavailable() {
        Problem problem = new Problem();
        problem.setId(9L);
        Submission submission = new Submission();
        submission.setId(16L);
        submission.setProblem(problem);
        submission.setSourceCode("public class Main {}");
        submission.setLanguage("JAVA");

        List<TestCase> testCases = List.of(testCase(problem, "1", "ok"));
        when(submissionService.getSubmissionById(16L))
                .thenReturn(submission);
        when(testCaseRepository.findByProblemIdOrderByIdAsc(9L))
                .thenReturn(testCases);
        when(executionAdapter.supports("java"))
                .thenReturn(true);
        when(executionAdapter.compile(submission.getSourceCode(), "java"))
                .thenReturn(new CodeExecutionAdapter.CompilationResult(
                        true,
                        Path.of("workspace"),
                        ""
                ));
        when(executionAdapter.execute(any(), eq("1")))
                .thenReturn(new CodeExecutionAdapter.ExecutionResult(
                        "EXECUTED", "ok", "", null
                ));

        judgeService.judgeSubmission(16L);

        verify(submissionService).updateResult(
                eq(16L),
                eq("ACCEPTED"),
                any(),
                eq(null),
                any(),
                eq(""),
                eq(1),
                eq(1)
        );
    }

    private TestCase testCase(Problem problem, String input, String output) {
        return TestCase.builder()
                .problem(problem)
                .input(input)
                .expectedOutput(output)
                .hidden(false)
                .build();
    }
}
