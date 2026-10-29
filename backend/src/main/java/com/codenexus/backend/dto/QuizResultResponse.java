package com.codenexus.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record QuizResultResponse(
        Long attemptId,
        String category,
        int correctAnswers,
        int totalQuestions,
        int scorePercent,
        LocalDateTime submittedAt,
        List<QuestionResult> questions
) {

    public record QuestionResult(
            Long questionId,
            String prompt,
            String selectedOption,
            String correctOption,
            String explanation,
            boolean correct
    ) {
    }
}
