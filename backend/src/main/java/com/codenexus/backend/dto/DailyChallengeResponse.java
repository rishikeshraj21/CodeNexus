package com.codenexus.backend.dto;

import com.codenexus.backend.entity.Problem;
import java.time.LocalDate;

public record DailyChallengeResponse(
        LocalDate date,
        Problem problem
) {
}
