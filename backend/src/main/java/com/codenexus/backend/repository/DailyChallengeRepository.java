package com.codenexus.backend.repository;

import com.codenexus.backend.entity.DailyChallenge;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyChallengeRepository
        extends JpaRepository<DailyChallenge, LocalDate> {
}
