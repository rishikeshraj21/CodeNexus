package com.codenexus.backend.repository;

import com.codenexus.backend.entity.QuizQuestion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionRepository
        extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByCategoryIgnoreCaseAndActiveTrueOrderByIdAsc(
            String category
    );

    List<QuizQuestion> findAllByOrderByCategoryAscIdAsc();
}
