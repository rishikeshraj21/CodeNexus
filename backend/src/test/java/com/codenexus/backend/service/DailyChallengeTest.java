package com.codenexus.backend.service;

import com.codenexus.backend.dto.DailyChallengeResponse;
import com.codenexus.backend.entity.DailyChallenge;
import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.repository.DailyChallengeRepository;
import com.codenexus.backend.repository.ProblemRepository;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.data.domain.Sort;

class DailyChallengeTest {

    @Test
    void selectsTheSameProblemForTheUtcDay() {
        ProblemRepository repository = mock(ProblemRepository.class);
        DailyChallengeRepository challengeRepository =
                mock(DailyChallengeRepository.class);
        List<Problem> problems = List.of(
                new Problem(),
                new Problem(),
                new Problem()
        );
        when(repository.findAll(Sort.by(Sort.Direction.ASC, "id")))
                .thenReturn(problems);
        when(challengeRepository.findById(LocalDate.now(ZoneOffset.UTC)))
                .thenReturn(java.util.Optional.empty());
        DailyChallengeService service =
                new DailyChallengeService(challengeRepository, repository);

        DailyChallengeResponse response = service.getForToday();
        int expectedIndex = (int) Math.floorMod(
                LocalDate.now(ZoneOffset.UTC).toEpochDay(),
                problems.size()
        );

        assertEquals(LocalDate.now(ZoneOffset.UTC), response.date());
        assertEquals(problems.get(expectedIndex), response.problem());
    }

    @Test
    void reportsWhenNoProblemsAreAvailable() {
        ProblemRepository repository = mock(ProblemRepository.class);
        DailyChallengeRepository challengeRepository =
                mock(DailyChallengeRepository.class);
        when(repository.findAll(Sort.by(Sort.Direction.ASC, "id")))
                .thenReturn(List.of());
        when(challengeRepository.findById(LocalDate.now(ZoneOffset.UTC)))
                .thenReturn(java.util.Optional.empty());

        assertThrows(
                IllegalStateException.class,
                () -> new DailyChallengeService(challengeRepository, repository)
                        .getForToday()
        );
    }

    @Test
    void adminCanPinAProblemForADate() {
        Problem problem = new Problem();
        problem.setId(7L);
        ProblemRepository problemRepository = mock(ProblemRepository.class);
        DailyChallengeRepository challengeRepository =
                mock(DailyChallengeRepository.class);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(problemRepository.findById(7L))
                .thenReturn(java.util.Optional.of(problem));

        DailyChallengeResponse response =
                new DailyChallengeService(challengeRepository, problemRepository)
                        .setChallenge(7L, today);

        assertEquals(today, response.date());
        assertEquals(problem, response.problem());
        verify(challengeRepository).save(any(DailyChallenge.class));
    }

    @Test
    void rejectsChallengeDatesInThePast() {
        ProblemRepository problemRepository = mock(ProblemRepository.class);
        DailyChallengeRepository challengeRepository =
                mock(DailyChallengeRepository.class);

        assertThrows(
                IllegalArgumentException.class,
                () -> new DailyChallengeService(
                        challengeRepository,
                        problemRepository
                ).setChallenge(7L, LocalDate.now(ZoneOffset.UTC).minusDays(1))
        );
        verify(problemRepository, never()).findById(7L);
    }
}
