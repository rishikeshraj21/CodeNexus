package com.codenexus.backend.service;

import com.codenexus.backend.dto.QuizAttemptRequest;
import com.codenexus.backend.dto.QuizQuestionResponse;
import com.codenexus.backend.dto.QuizResultResponse;
import com.codenexus.backend.dto.QuizQuestionRequest;
import com.codenexus.backend.entity.QuizAttempt;
import com.codenexus.backend.entity.QuizQuestion;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.repository.QuizAttemptRepository;
import com.codenexus.backend.repository.QuizQuestionRepository;
import com.codenexus.backend.repository.UserRepository;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuizService {

    private static final Set<String> CATEGORIES =
            Set.of("JAVA", "DSA", "DBMS", "OS", "CN");

    private final QuizQuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final UserRepository userRepository;

    public QuizService(
            QuizQuestionRepository questionRepository,
            QuizAttemptRepository attemptRepository,
            UserRepository userRepository
    ) {
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<QuizQuestionResponse> getQuestions(String category) {
        String normalizedCategory = normalizeCategory(category);
        return questionRepository
                .findByCategoryIgnoreCaseAndActiveTrueOrderByIdAsc(
                        normalizedCategory
                )
                .stream()
                .map(QuizQuestionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuizQuestion> getAllQuestionsForAdmin() {
        return questionRepository.findAllByOrderByCategoryAscIdAsc();
    }

    @Transactional
    public QuizQuestion saveQuestion(Long id, QuizQuestionRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Question details are required");
        }
        String category = normalizeCategory(request.category());
        QuizQuestion question = id == null
                ? new QuizQuestion()
                : questionRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Quiz question not found"
                        ));
        question.setCategory(category);
        question.setPrompt(request.prompt().trim());
        question.setOptionA(request.optionA().trim());
        question.setOptionB(request.optionB().trim());
        question.setOptionC(request.optionC().trim());
        question.setOptionD(request.optionD().trim());
        question.setCorrectOption(request.correctOption().trim());
        question.setExplanation(request.explanation().trim());
        question.setActive(request.active());
        return questionRepository.save(question);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new IllegalArgumentException("Quiz question not found");
        }
        questionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AdminAttemptEntry> getAllAttemptsForAdmin() {
        return attemptRepository.findAllByOrderBySubmittedAtDesc()
                .stream()
                .map(attempt -> new AdminAttemptEntry(
                        attempt.getId(),
                        attempt.getUser().getId(),
                        attempt.getUser().getName(),
                        attempt.getUser().getEmail(),
                        attempt.getCategory(),
                        attempt.getCorrectAnswers(),
                        attempt.getTotalQuestions(),
                        attempt.getTotalQuestions() == 0
                                ? 0
                                : Math.round(
                                        attempt.getCorrectAnswers() * 100.0f
                                                / attempt.getTotalQuestions()
                                ),
                        attempt.getSubmittedAt()
                ))
                .toList();
    }

    public record AdminAttemptEntry(
            Long attemptId,
            Long userId,
            String userName,
            String userEmail,
            String category,
            int correctAnswers,
            int totalQuestions,
            int scorePercent,
            java.time.LocalDateTime submittedAt
    ) {
    }

    @Transactional
    public QuizResultResponse submit(
            String email,
            QuizAttemptRequest request
    ) {
        if (request == null || request.answers() == null
                || request.answers().isEmpty()) {
            throw new IllegalArgumentException("Answers are required");
        }
        String category = normalizeCategory(request.category());
        List<QuizQuestion> questions =
                questionRepository
                        .findByCategoryIgnoreCaseAndActiveTrueOrderByIdAsc(
                                category
                        );
        if (questions.isEmpty()) {
            throw new IllegalArgumentException(
                    "No questions are available for this subject"
            );
        }
        if (request.answers().size() != questions.size()
                || questions.stream().anyMatch(
                        question -> !request.answers().containsKey(question.getId())
                )) {
            throw new IllegalArgumentException(
                    "Submit one answer for every question in this quiz"
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        int correctAnswers = 0;
        List<QuizResultResponse.QuestionResult> outcomes =
                new java.util.ArrayList<>();
        for (QuizQuestion question : questions) {
            String answer = request.answers().get(question.getId());
            if (answer == null || answer.isBlank()) {
                throw new IllegalArgumentException(
                        "Choose an answer for every question"
                );
            }
            String selectedOption = answer.trim().toUpperCase(Locale.ROOT);
            if (!Set.of("A", "B", "C", "D").contains(selectedOption)) {
                throw new IllegalArgumentException(
                        "Answers must use option A, B, C, or D"
                );
            }
            boolean correct = selectedOption.equals(question.getCorrectOption());
            if (correct) {
                correctAnswers++;
            }
            outcomes.add(new QuizResultResponse.QuestionResult(
                    question.getId(),
                    question.getPrompt(),
                    selectedOption,
                    question.getCorrectOption(),
                    question.getExplanation(),
                    correct
            ));
        }

        QuizAttempt attempt = attemptRepository.save(
                new QuizAttempt(user, category, correctAnswers, questions.size())
        );
        int scorePercent = Math.round(
                correctAnswers * 100.0f / questions.size()
        );
        return new QuizResultResponse(
                attempt.getId(),
                category,
                correctAnswers,
                questions.size(),
                scorePercent,
                attempt.getSubmittedAt(),
                outcomes
        );
    }

    @Transactional(readOnly = true)
    public List<QuizHistoryEntry> getHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return attemptRepository.findByUserIdOrderBySubmittedAtDesc(user.getId())
                .stream()
                .map(attempt -> new QuizHistoryEntry(
                        attempt.getId(),
                        attempt.getCategory(),
                        attempt.getCorrectAnswers(),
                        attempt.getTotalQuestions(),
                        attempt.getTotalQuestions() == 0
                                ? 0
                                : Math.round(
                                        attempt.getCorrectAnswers() * 100.0f
                                                / attempt.getTotalQuestions()
                                ),
                        attempt.getSubmittedAt()
                ))
                .toList();
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("Subject is required");
        }
        String normalized = category.trim().toUpperCase(Locale.ROOT);
        if (!CATEGORIES.contains(normalized)) {
            throw new IllegalArgumentException(
                    "Subject must be Java, DSA, DBMS, OS, or CN"
            );
        }
        return normalized;
    }

    public record QuizHistoryEntry(
            Long attemptId,
            String category,
            int correctAnswers,
            int totalQuestions,
            int scorePercent,
            java.time.LocalDateTime submittedAt
    ) {
    }
}
