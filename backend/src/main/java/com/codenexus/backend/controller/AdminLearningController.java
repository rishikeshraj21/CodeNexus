package com.codenexus.backend.controller;

import com.codenexus.backend.dto.AdminAnnouncementRequest;
import com.codenexus.backend.dto.DailyChallengeRequest;
import com.codenexus.backend.dto.QuizQuestionRequest;
import com.codenexus.backend.service.DailyChallengeService;
import com.codenexus.backend.service.NotificationService;
import com.codenexus.backend.service.QuizService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminLearningController {

    private final QuizService quizService;
    private final NotificationService notificationService;
    private final DailyChallengeService dailyChallengeService;

    public AdminLearningController(
            QuizService quizService,
            NotificationService notificationService,
            DailyChallengeService dailyChallengeService
    ) {
        this.quizService = quizService;
        this.notificationService = notificationService;
        this.dailyChallengeService = dailyChallengeService;
    }

    @GetMapping("/quiz-questions")
    public ResponseEntity<?> getQuizQuestions() {
        return ResponseEntity.ok(quizService.getAllQuestionsForAdmin());
    }

    @PostMapping("/quiz-questions")
    public ResponseEntity<?> createQuizQuestion(
            @Valid @RequestBody QuizQuestionRequest request
    ) {
        try {
            return ResponseEntity.ok(quizService.saveQuestion(null, request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @PutMapping("/quiz-questions/{id}")
    public ResponseEntity<?> updateQuizQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuizQuestionRequest request
    ) {
        try {
            return ResponseEntity.ok(quizService.saveQuestion(id, request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @DeleteMapping("/quiz-questions/{id}")
    public ResponseEntity<?> deleteQuizQuestion(@PathVariable Long id) {
        try {
            quizService.deleteQuestion(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(404).body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @GetMapping("/quiz-attempts")
    public ResponseEntity<?> getQuizAttempts() {
        return ResponseEntity.ok(quizService.getAllAttemptsForAdmin());
    }

    @PutMapping("/daily-challenge")
    public ResponseEntity<?> setDailyChallenge(
            @Valid @RequestBody DailyChallengeRequest request
    ) {
        try {
            return ResponseEntity.ok(dailyChallengeService.setChallenge(
                    request.problemId(),
                    request.date()
            ));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @PostMapping("/announcements")
    public ResponseEntity<?> broadcast(
            @Valid @RequestBody AdminAnnouncementRequest request
    ) {
        try {
            int recipients = notificationService.broadcast(request);
            return ResponseEntity.ok(Map.of(
                    "message",
                    "Announcement sent",
                    "recipients",
                    recipients
            ));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @GetMapping("/announcements")
    public ResponseEntity<?> getAnnouncements() {
        return ResponseEntity.ok(notificationService.getAllForAdmin());
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        try {
            notificationService.deleteForAdmin(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(404).body(
                    Map.of("message", exception.getMessage())
            );
        }
    }
}
