package com.codenexus.backend.dto;

import com.codenexus.backend.entity.Problem;
import org.springframework.data.domain.Page;

import java.util.List;

public record ProblemPageResponse(
        List<Problem> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last,
        boolean hasNext,
        boolean hasPrevious
) {
    public static ProblemPageResponse from(Page<Problem> result) {
        return new ProblemPageResponse(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isFirst(),
                result.isLast(),
                result.hasNext(),
                result.hasPrevious()
        );
    }
}
