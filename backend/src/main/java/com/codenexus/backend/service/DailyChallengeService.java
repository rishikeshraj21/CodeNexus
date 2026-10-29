package com.codenexus.backend.service;

import com.codenexus.backend.dto.DailyChallengeResponse;
import com.codenexus.backend.entity.DailyChallenge;
import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.repository.DailyChallengeRepository;
import com.codenexus.backend.repository.ProblemRepository;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DailyChallengeService {

    private final DailyChallengeRepository challengeRepository;
    private final ProblemRepository problemRepository;

    public DailyChallengeService(
            DailyChallengeRepository challengeRepository,
            ProblemRepository problemRepository
    ) {
        this.challengeRepository = challengeRepository;
        this.problemRepository = problemRepository;
    }

    @Transactional(readOnly = true)
    public DailyChallengeResponse getForToday() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        DailyChallenge pinned = challengeRepository.findById(today).orElse(null);
        if (pinned != null) {
            return new DailyChallengeResponse(today, pinned.getProblem());
        }
        List<Problem> problems =
                problemRepository.findAll(org.springframework.data.domain.Sort
                        .by(org.springframework.data.domain.Sort.Direction.ASC, "id"));
        if (problems.isEmpty()) {
            throw new IllegalStateException("No problems are available");
        }
        int index = (int) Math.floorMod(today.toEpochDay(), problems.size());
        return new DailyChallengeResponse(today, problems.get(index));
    }

    @Transactional
    public DailyChallengeResponse setChallenge(
            Long problemId,
            LocalDate date
    ) {
        if (problemId == null || date == null) {
            throw new IllegalArgumentException(
                    "Challenge problem and date are required"
            );
        }
        if (date.isBefore(LocalDate.now(ZoneOffset.UTC))) {
            throw new IllegalArgumentException(
                    "Challenge date cannot be in the past"
            );
        }
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Problem not found"
                ));
        challengeRepository.save(new DailyChallenge(date, problem));
        return new DailyChallengeResponse(date, problem);
    }
}
