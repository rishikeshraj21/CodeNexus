package com.codenexus.backend.dto;

import com.codenexus.backend.entity.QuizQuestion;
import java.util.List;

public record QuizQuestionResponse(
        Long id,
        String category,
        String prompt,
        List<QuizOption> options
) {

    public static QuizQuestionResponse from(QuizQuestion question) {
        return new QuizQuestionResponse(
                question.getId(),
                question.getCategory(),
                question.getPrompt(),
                List.of(
                        new QuizOption("A", question.getOptionA()),
                        new QuizOption("B", question.getOptionB()),
                        new QuizOption("C", question.getOptionC()),
                        new QuizOption("D", question.getOptionD())
                )
        );
    }

    public record QuizOption(String key, String text) {
    }
}
