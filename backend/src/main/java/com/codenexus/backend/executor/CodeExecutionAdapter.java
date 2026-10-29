package com.codenexus.backend.executor;

import java.nio.file.Path;

public interface CodeExecutionAdapter {

    String language();

    boolean supports(String language);

    CompilationResult compile(String sourceCode, String language);

    ExecutionResult execute(Path workspace, String input);

    void cleanup(Path workspace);

    record CompilationResult(
            boolean success,
            Path workspace,
            String error
    ) { }

    record ExecutionResult(
            String status,
            String output,
            String error,
            Integer memoryUsed
    ) { }
}
