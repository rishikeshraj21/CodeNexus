package com.codenexus.backend.controller;

import com.codenexus.backend.dto.QuizAttemptRequest;
import com.codenexus.backend.service.QuizService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(
            @RequestParam String category
    ) {
        try {
            return ResponseEntity.ok(quizService.getQuestions(category));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @PostMapping("/attempts")
    public ResponseEntity<?> submit(
            Authentication authentication,
            @RequestBody QuizAttemptRequest request
    ) {
        try {
            return ResponseEntity.ok(
                    quizService.submit(authentication.getName(), request)
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @GetMapping("/attempts/me")
    public ResponseEntity<?> getHistory(Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    quizService.getHistory(authentication.getName())
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }
}
