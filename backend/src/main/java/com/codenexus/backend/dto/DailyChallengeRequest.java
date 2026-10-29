package com.codenexus.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record DailyChallengeRequest(
        @NotNull Long problemId,
        @NotNull LocalDate date
) {
}
