package com.codenexus.backend.dto;

import java.util.Map;

public record QuizAttemptRequest(
        String category,
        Map<Long, String> answers
) {
}
