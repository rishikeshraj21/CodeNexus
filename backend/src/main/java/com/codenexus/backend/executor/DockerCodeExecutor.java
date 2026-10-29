package com.codenexus.backend.executor;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.TimeUnit;

@Service
public class DockerCodeExecutor implements CodeExecutionAdapter {

    // ============================================================
    // CONFIGURATION
    // ============================================================

    private static final int COMPILE_TIMEOUT_SECONDS = 10;

    private static final int IMAGE_PULL_TIMEOUT_SECONDS = 300;

    private static final int RUN_TIMEOUT_SECONDS = 5;

    private static final long MAX_OUTPUT_BYTES = 1024 * 1024;

    private static final String LANGUAGE_FILE = ".codenexus-language";

    @Override
    public String language() {
        return "java";
    }

    @Override
    public boolean supports(String language) {
        return runtimeFor(language) != null;
    }

    @Override
    public CompilationResult compile(
            String sourceCode,
            String language
    ) {

        Path tempDirectory = null;

        try {
            RuntimeSpec runtime = runtimeFor(language);
            if (runtime == null) {
                return new CompilationResult(
                        false,
                        null,
                        "Unsupported language. Supported languages: Java, C, C++, Python, JavaScript"
                );
            }

            if (sourceCode == null
                    || sourceCode.isBlank()) {

                return new CompilationResult(
                        false,
                        null,
                        "Source code cannot be empty"
                );
            }

            // ----------------------------------------------------
            // CREATE TEMPORARY DIRECTORY
            // ----------------------------------------------------

            tempDirectory =
                    Files.createTempDirectory(
                            "codenexus-"
                    );

            Path sourceFile =
                    tempDirectory.resolve(runtime.sourceFile());

            Files.writeString(
                    sourceFile,
                    sourceCode,
                    StandardCharsets.UTF_8
            );
            Files.writeString(
                    tempDirectory.resolve(LANGUAGE_FILE),
                    runtime.language(),
                    StandardCharsets.UTF_8
            );
            ensureRuntimeImage(runtime.image());

            ProcessBuilder processBuilder = new ProcessBuilder(
                    dockerCommand(
                            tempDirectory,
                            runtime.image(),
                            runtime.compileCommand()
                    )
            );
            processBuilder.redirectErrorStream(true);

            Process compileProcess =
                    processBuilder.start();

            ProcessResult compileResult =
                    runWithLimits(
                            compileProcess,
                            COMPILE_TIMEOUT_SECONDS
                    );

            // ----------------------------------------------------
            // COMPILATION TIMEOUT
            // ----------------------------------------------------

            if (compileResult.timedOut()) {
                cleanup(
                        tempDirectory
                );

                return new CompilationResult(
                        false,
                        null,
                        "Compilation timeout"
                );
            }

            String output = compileResult.output();

            // ----------------------------------------------------
            // COMPILATION ERROR
            // ----------------------------------------------------

            if (compileResult.exitCode() != 0) {

                cleanup(
                        tempDirectory
                );

                return new CompilationResult(
                        false,
                        null,
                        output
                );
            }

            // ----------------------------------------------------
            // COMPILATION SUCCESS
            // ----------------------------------------------------

            return new CompilationResult(
                    true,
                    tempDirectory,
                    ""
            );

        } catch (Exception exception) {

            if (tempDirectory != null) {
                cleanup(tempDirectory);
            }

            return new CompilationResult(
                    false,
                    null,
                    "Docker compilation error: "
                            + safeMessage(exception)
            );
        }
    }

    private void ensureRuntimeImage(String image)
            throws IOException, InterruptedException {
        ProcessResult inspect = runWithLimits(
                new ProcessBuilder("docker", "image", "inspect", image)
                        .redirectErrorStream(true)
                        .start(),
                COMPILE_TIMEOUT_SECONDS
        );
        if (!inspect.timedOut() && inspect.exitCode() == 0) {
            return;
        }

        ProcessResult pull = runWithLimits(
                new ProcessBuilder("docker", "pull", image)
                        .redirectErrorStream(true)
                        .start(),
                IMAGE_PULL_TIMEOUT_SECONDS
        );
        if (pull.timedOut()) {
            throw new IOException(
                    "Timed out downloading execution image " + image
            );
        }
        if (pull.exitCode() != 0) {
            throw new IOException(
                    "Could not download execution image "
                            + image
                            + ": "
                            + pull.output()
            );
        }
    }

    // ============================================================
    // EXECUTE COMPILED CODE
    // ============================================================

    @Override
    public ExecutionResult execute(
            Path tempDirectory,
            String input
    ) {

        if (tempDirectory == null) {

            return new ExecutionResult(
                    "EXECUTION_ERROR",
                    "",
                    "Compilation directory is missing",
                    null
            );
        }

        try {

            if (!Files.exists(tempDirectory)) {

                return new ExecutionResult(
                        "EXECUTION_ERROR",
                        "",
                        "Compilation directory does not exist",
                        null
                );
            }

            // ----------------------------------------------------
            // CREATE INPUT FILE
            // ----------------------------------------------------

            Path inputFile =
                    tempDirectory.resolve("input.txt");

            Files.writeString(
                    inputFile,
                    input == null ? "" : input,
                    StandardCharsets.UTF_8
            );

            // ----------------------------------------------------
            // DOCKER EXECUTION COMMAND
            // ----------------------------------------------------

            RuntimeSpec runtime = runtimeFor(
                    Files.readString(
                            tempDirectory.resolve(LANGUAGE_FILE),
                            StandardCharsets.UTF_8
                    )
            );
            if (runtime == null) {
                return new ExecutionResult(
                        "EXECUTION_ERROR",
                        "",
                        "Unsupported language runtime",
                        null
                );
            }

            String executionScript =
                    runtime.runCommand()
                            + " < input.txt; code=$?; "
                            + "(cat /sys/fs/cgroup/memory.peak 2>/dev/null "
                            + "|| cat /sys/fs/cgroup/memory/memory.max_usage_in_bytes "
                            + "2>/dev/null || echo -1) > memory.txt; exit \"$code\"";
            List<String> command = new ArrayList<>(
                    dockerCommand(
                            tempDirectory,
                            runtime.image(),
                            List.of("sh", "-c", executionScript)
                    )
            );
            ProcessBuilder processBuilder = new ProcessBuilder(command);

            processBuilder.redirectErrorStream(true);

            Process runProcess =
                    processBuilder.start();

            // ----------------------------------------------------
            // EXECUTION TIMEOUT
            // ----------------------------------------------------

            ProcessResult runResult =
                    runWithLimits(
                            runProcess,
                            RUN_TIMEOUT_SECONDS
                    );

            if (runResult.timedOut()) {
                return new ExecutionResult(
                        "TIME_LIMIT_EXCEEDED",
                        "",
                        "Program exceeded "
                                + RUN_TIMEOUT_SECONDS
                                + " seconds",
                        readPeakMemoryKilobytes(tempDirectory)
                );
            }

            // ----------------------------------------------------
            // READ PROGRAM OUTPUT
            // ----------------------------------------------------

            String output = runResult.output();

            // ----------------------------------------------------
            // RUNTIME ERROR
            // ----------------------------------------------------

            if (runResult.exitCode() != 0) {

                return new ExecutionResult(
                        "RUNTIME_ERROR",
                        output,
                        "Program exited with error",
                        readPeakMemoryKilobytes(tempDirectory)
                );
            }

            // ----------------------------------------------------
            // SUCCESS
            // ----------------------------------------------------

            return new ExecutionResult(
                    "EXECUTED",
                    output.trim(),
                    "",
                    readPeakMemoryKilobytes(tempDirectory)
            );

        } catch (Exception exception) {

            return new ExecutionResult(
                    "EXECUTION_ERROR",
                    "",
                    "Docker execution error: "
                            + safeMessage(exception),
                    null
            );
        }
    }

    private List<String> dockerCommand(
            Path workspace,
            String image,
            List<String> containerCommand
    ) {
        List<String> command = new ArrayList<>(List.of(
                "docker", "run", "--rm",
                "--network", "none",
                "--memory", "256m",
                "--memory-swap", "256m",
                "--cpus", "1",
                "--pids-limit", "64",
                "--cap-drop", "ALL",
                "--security-opt", "no-new-privileges",
                "-v", workspace.toAbsolutePath() + ":/app",
                "-w", "/app",
                image
        ));
        command.addAll(containerCommand);
        return command;
    }

    private RuntimeSpec runtimeFor(String language) {
        String normalized = language == null
                ? ""
                : language.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "java", "java21" -> new RuntimeSpec(
                    "java", "Main.java", "eclipse-temurin:21",
                    List.of("javac", "Main.java"), "java Main"
            );
            case "c" -> new RuntimeSpec(
                    "c", "Main.c", "gcc:14",
                    List.of("gcc", "-std=c17", "-O2", "-pipe", "-o", "main", "Main.c"),
                    "./main"
            );
            case "cpp", "c++" -> new RuntimeSpec(
                    "cpp", "Main.cpp", "gcc:14",
                    List.of("g++", "-std=c++17", "-O2", "-pipe", "-o", "main", "Main.cpp"),
                    "./main"
            );
            case "python", "python3" -> new RuntimeSpec(
                    "python", "Main.py", "python:3.12-slim",
                    List.of("python3", "-m", "py_compile", "Main.py"),
                    "python3 Main.py"
            );
            case "javascript", "js", "node" -> new RuntimeSpec(
                    "javascript", "Main.js", "node:22-slim",
                    List.of("node", "--check", "Main.js"),
                    "node Main.js"
            );
            default -> null;
        };
    }

    private record RuntimeSpec(
            String language,
            String sourceFile,
            String image,
            List<String> compileCommand,
            String runCommand
    ) { }

    private Integer readPeakMemoryKilobytes(Path tempDirectory) {
        Path memoryFile = tempDirectory.resolve("memory.txt");
        try {
            long bytes = Long.parseLong(Files.readString(memoryFile).trim());
            if (bytes < 0) {
                return null;
            }
            return (int) Math.min(
                    (bytes + 1023) / 1024,
                    Integer.MAX_VALUE
            );
        } catch (IOException | NumberFormatException exception) {
            return null;
        }
    }

    // ============================================================
    // READ PROCESS OUTPUT WITH LIMIT
    // ============================================================

    private ProcessResult runWithLimits(
            Process process,
            int timeoutSeconds
    ) throws IOException, InterruptedException {
        ByteArrayOutputStream capturedOutput = new ByteArrayOutputStream();
        AtomicBoolean truncated = new AtomicBoolean();
        AtomicReference<IOException> readFailure = new AtomicReference<>();

        Thread outputReader = Thread.ofVirtual().start(() -> {
            try (InputStream stream = process.getInputStream()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = stream.read(buffer)) != -1) {
                    int remaining = (int) (MAX_OUTPUT_BYTES
                            - capturedOutput.size());
                    int retained = Math.min(bytesRead, Math.max(remaining, 0));
                    if (retained > 0) {
                        capturedOutput.write(buffer, 0, retained);
                    }
                    if (retained < bytesRead) {
                        truncated.set(true);
                    }
                }
            } catch (IOException exception) {
                readFailure.set(exception);
            }
        });

        boolean finished = process.waitFor(
                timeoutSeconds,
                TimeUnit.SECONDS
        );
        if (!finished) {
            process.destroyForcibly();
            process.waitFor();
        }

        outputReader.join(1000);
        if (outputReader.isAlive()) {
            process.getInputStream().close();
            outputReader.join(1000);
        }
        if (outputReader.isAlive()) {
            throw new IOException("Timed out while collecting process output");
        }
        if (finished && readFailure.get() != null) {
            throw readFailure.get();
        }

        String output = capturedOutput.toString(StandardCharsets.UTF_8);
        if (truncated.get()) {
            output += "\n[Output truncated after 1 MiB]";
        }
        return new ProcessResult(
                !finished,
                process.exitValue(),
                output
        );
    }

    // ============================================================
    // DELETE TEMPORARY DIRECTORY
    // ============================================================

    @Override
    public void cleanup(
            Path directory
    ) {

        if (directory == null) {
            return;
        }

        try {

            if (!Files.exists(directory)) {
                return;
            }

            Files.walk(directory)
                    .sorted(
                            (first, second) ->
                                    second.compareTo(first)
                    )
                    .forEach(path -> {

                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                            // Ignore cleanup failures.
                        }

                    });

        } catch (IOException ignored) {
            // Ignore cleanup failures.
        }
    }

    // ============================================================
    // SAFE EXCEPTION MESSAGE
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

    // ============================================================
    // RESULT RECORDS
    // ============================================================

    private record ProcessResult(
            boolean timedOut,
            int exitCode,
            String output
    ) { }
}