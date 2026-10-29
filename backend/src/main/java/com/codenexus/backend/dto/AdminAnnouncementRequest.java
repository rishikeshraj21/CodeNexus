package com.codenexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminAnnouncementRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 4000) String message
) {
}
