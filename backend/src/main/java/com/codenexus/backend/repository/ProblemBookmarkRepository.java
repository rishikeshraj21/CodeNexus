package com.codenexus.backend.repository;

import com.codenexus.backend.entity.ProblemBookmark;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemBookmarkRepository
        extends JpaRepository<ProblemBookmark, Long> {

    List<ProblemBookmark> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndProblemId(Long userId, Long problemId);

    void deleteByUserIdAndProblemId(Long userId, Long problemId);
}
