package com.codenexus.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "daily_challenges")
@Getter
@Setter
@NoArgsConstructor
public class DailyChallenge {

    @Id
    private LocalDate challengeDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    public DailyChallenge(LocalDate challengeDate, Problem problem) {
        this.challengeDate = challengeDate;
        this.problem = problem;
    }
}
