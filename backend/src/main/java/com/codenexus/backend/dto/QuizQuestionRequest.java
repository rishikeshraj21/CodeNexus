package com.codenexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record QuizQuestionRequest(
        @NotBlank @Pattern(regexp = "JAVA|DSA|DBMS|OS|CN")
        String category,
        @NotBlank @Size(max = 5000) String prompt,
        @NotBlank @Size(max = 2000) String optionA,
        @NotBlank @Size(max = 2000) String optionB,
        @NotBlank @Size(max = 2000) String optionC,
        @NotBlank @Size(max = 2000) String optionD,
        @NotBlank @Pattern(regexp = "A|B|C|D") String correctOption,
        @NotBlank @Size(max = 5000) String explanation,
        boolean active
) {
}
