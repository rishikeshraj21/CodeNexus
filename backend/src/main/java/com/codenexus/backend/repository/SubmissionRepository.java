package com.codenexus.backend.repository;

import com.codenexus.backend.entity.Submission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    /*
     * Returns all submissions made by a particular user.
     */
    List<Submission> findByUserId(Long userId);

    /*
     * Returns all submissions for a particular problem.
     */
    List<Submission> findByProblemId(Long problemId);

    @Query("""
            SELECT u.id AS id,
                   u.name AS name,
                   COUNT(s.id) AS totalSubmissions,
                   SUM(CASE WHEN s.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS acceptedSubmissions,
                   COUNT(DISTINCT CASE WHEN s.status = 'ACCEPTED' THEN p.id ELSE NULL END) AS solvedProblems
            FROM User u
            LEFT JOIN Submission s ON s.user = u
            LEFT JOIN s.problem p
            GROUP BY u.id, u.name
            """)
    List<LeaderboardSummary> findLeaderboardSummary();

    interface LeaderboardSummary {
        Long getId();

        String getName();

        Long getTotalSubmissions();

        Long getAcceptedSubmissions();

        Long getSolvedProblems();
    }
}