package com.codenexus.backend.service;

import com.codenexus.backend.dto.QuizAttemptRequest;
import com.codenexus.backend.dto.QuizQuestionResponse;
import com.codenexus.backend.dto.QuizResultResponse;
import com.codenexus.backend.entity.QuizAttempt;
import com.codenexus.backend.entity.QuizQuestion;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.repository.QuizAttemptRepository;
import com.codenexus.backend.repository.QuizQuestionRepository;
import com.codenexus.backend.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private QuizQuestionRepository questionRepository;

    @Mock
    private QuizAttemptRepository attemptRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private QuizService quizService;

    @Test
    void questionsDoNotExposeTheAnswerKey() {
        QuizQuestion question = question(1L, "JAVA", "A");
        when(questionRepository
                .findByCategoryIgnoreCaseAndActiveTrueOrderByIdAsc("JAVA"))
                .thenReturn(List.of(question));

        List<QuizQuestionResponse> response =
                quizService.getQuestions("java");

        assertEquals(1, response.size());
        assertEquals("JAVA", response.getFirst().category());
        assertEquals("A", response.getFirst().options().getFirst().key());
    }

    @Test
    void scoresAndPersistsACompleteAttempt() {
        QuizQuestion first = question(1L, "JAVA", "A");
        QuizQuestion second = question(2L, "JAVA", "C");
        User user = new User();
        user.setId(8L);
        QuizAttempt storedAttempt = new QuizAttempt(user, "JAVA", 1, 2);
        storedAttempt.setId(13L);
        when(questionRepository
                .findByCategoryIgnoreCaseAndActiveTrueOrderByIdAsc("JAVA"))
                .thenReturn(List.of(first, second));
        when(userRepository.findByEmail("coder@example.com"))
                .thenReturn(Optional.of(user));
        when(attemptRepository.save(org.mockito.ArgumentMatchers.any()))
                .thenReturn(storedAttempt);

        QuizResultResponse response = quizService.submit(
                "coder@example.com",
                new QuizAttemptRequest("JAVA", Map.of(1L, "A", 2L, "B"))
        );

        assertEquals(13L, response.attemptId());
        assertEquals(1, response.correctAnswers());
        assertEquals(50, response.scorePercent());
        assertEquals(false, response.questions().get(1).correct());
    }

    @Test
    void rejectsIncompleteAttempts() {
        assertThrows(
                IllegalArgumentException.class,
                () -> quizService.submit(
                        "coder@example.com",
                        new QuizAttemptRequest("JAVA", Map.of())
                )
        );
    }

    private QuizQuestion question(Long id, String category, String answer) {
        QuizQuestion question = new QuizQuestion(
                category,
                "Prompt",
                "Option A",
                "Option B",
                "Option C",
                "Option D",
                answer,
                "Explanation"
        );
        question.setId(id);
        return question;
    }
}
