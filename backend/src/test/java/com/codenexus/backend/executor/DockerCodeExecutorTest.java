package com.codenexus.backend.executor;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DockerCodeExecutorTest {

    private final DockerCodeExecutor executor =
            new DockerCodeExecutor();

    @Test
    void supportsImplementedLanguagesAndAliases() {
        assertTrue(executor.supports("java"));
        assertTrue(executor.supports("JAVA21"));
        assertTrue(executor.supports("c"));
        assertTrue(executor.supports("cpp"));
        assertTrue(executor.supports("C++"));
        assertTrue(executor.supports("python"));
        assertTrue(executor.supports("javascript"));
        assertFalse(executor.supports("rust"));
    }
}
