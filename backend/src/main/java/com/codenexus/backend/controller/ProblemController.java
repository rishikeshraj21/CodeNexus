package com.codenexus.backend.controller;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.dto.DailyChallengeResponse;
import com.codenexus.backend.dto.ProblemPageResponse;
import com.codenexus.backend.service.ProblemService;
import com.codenexus.backend.service.DailyChallengeService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import java.util.Map;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
})
public class ProblemController {

    private final ProblemService problemService;
    private final DailyChallengeService dailyChallengeService;

    public ProblemController(
            ProblemService problemService,
            DailyChallengeService dailyChallengeService
    ) {
        this.problemService = problemService;
        this.dailyChallengeService = dailyChallengeService;
    }

    @GetMapping("/daily")
    public ResponseEntity<?> getDailyChallenge() {
        try {
            DailyChallengeResponse challenge =
                    dailyChallengeService.getForToday();
            return ResponseEntity.ok(challenge);
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    // ============================================================
    // CREATE PROBLEM
    // ============================================================

    @PostMapping
    public ResponseEntity<?> createProblem(
            @RequestBody Problem problem
    ) {

        try {

            Problem savedProblem =
                    problemService.createProblem(
                            problem
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedProblem);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );

        } catch (Exception exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Problem creation failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // GET ALL PROBLEMS
    // ============================================================

    @GetMapping
    public ResponseEntity<?> getAllProblems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String progress,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String direction,
            Authentication authentication
    ) {
        boolean usesSearchOptions = search != null
                || category != null
                || difficulty != null
                || tag != null
                || progress != null
                || page != null
                || size != null
                || sort != null
                || direction != null;

        if (!usesSearchOptions) {
            return ResponseEntity.ok(problemService.getAllProblems());
        }

        try {
            Page<Problem> result = problemService.searchProblems(
                    search,
                    category,
                    difficulty,
                    tag,
                    progress,
                    authentication == null ? null : authentication.getName(),
                    page == null ? 0 : page,
                    size == null ? 20 : size,
                    sort,
                    direction
            );
            return ResponseEntity.ok(ProblemPageResponse.from(result));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    // ============================================================
    // GET PROBLEM BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getProblemById(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    problemService.getProblemById(id)
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    "Problem not found"
                            )
                    );
        }
    }

    // ============================================================
    // UPDATE PROBLEM
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProblem(
            @PathVariable Long id,
            @RequestBody Problem problem
    ) {

        try {

            Problem updatedProblem =
                    problemService.updateProblem(
                            id,
                            problem
                    );

            return ResponseEntity.ok(
                    updatedProblem
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(exception)
                            )
                    );

        } catch (Exception exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Problem update failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // DELETE PROBLEM
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProblem(
            @PathVariable Long id
    ) {

        try {

            problemService.deleteProblem(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Problem deleted successfully"
                    )
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    safeMessage(exception)
                            )
                    );

        } catch (Exception exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Problem deletion failed",
                                    "error",
                                    safeMessage(exception)
                            )
                    );
        }
    }

    // ============================================================
    // SAFE ERROR MESSAGE
    // ============================================================

    private String safeMessage(
            Exception exception
    ) {

        if (exception == null) {
            return "Unknown error";
        }

        String message =
                exception.getMessage();

        if (message == null
                || message.isBlank()) {

            return exception
                    .getClass()
                    .getSimpleName();
        }

        return message;
    }
}