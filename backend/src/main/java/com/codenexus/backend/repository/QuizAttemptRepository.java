package com.codenexus.backend.repository;

import com.codenexus.backend.entity.QuizAttempt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository
        extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserIdOrderBySubmittedAtDesc(Long userId);

    List<QuizAttempt> findAllByOrderBySubmittedAtDesc();
}
