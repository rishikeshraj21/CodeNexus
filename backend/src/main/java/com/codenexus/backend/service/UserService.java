package com.codenexus.backend.service;

import com.codenexus.backend.entity.Submission;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.repository.SubmissionRepository;
import com.codenexus.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;

    public UserService(
            UserRepository userRepository,
            SubmissionRepository submissionRepository
    ) {
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
    }

    // ============================================================
    // CREATE USER
    // ============================================================

    public User createUser(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User data is required"
            );
        }

        if (user.getName() == null
                || user.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "Name is required"
            );
        }

        if (user.getEmail() == null
                || user.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (user.getPassword() == null
                || user.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        String email =
                user.getEmail()
                        .trim()
                        .toLowerCase();

        if (userRepository.existsByEmail(email)) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        user.setName(user.getName().trim());
        user.setEmail(email);

        return userRepository.save(user);
    }

    // ============================================================
    // GET ALL USERS
    // ============================================================

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard() {
        return submissionRepository.findLeaderboardSummary()
                .stream()
                .map(summary -> {
                    long totalSubmissions =
                            summary.getTotalSubmissions();
                    long acceptedSubmissions =
                            summary.getAcceptedSubmissions();
                    int acceptanceRate =
                            totalSubmissions == 0
                                    ? 0
                                    : (int) Math.round(
                                            acceptedSubmissions * 100.0
                                                    / totalSubmissions
                                    );

                    return new LeaderboardEntry(
                            summary.getId(),
                            summary.getName(),
                            summary.getSolvedProblems(),
                            acceptedSubmissions,
                            totalSubmissions,
                            acceptanceRate
                    );
                })
                .sorted(
                        Comparator.<LeaderboardEntry>comparingLong(
                                        entry -> entry.solvedProblems()
                                )
                                .thenComparingLong(
                                        entry -> entry.acceptedSubmissions()
                                )
                                .thenComparingInt(
                                        entry -> entry.acceptanceRate()
                                )
                                .reversed()
                )
                .toList();
    }

    public record LeaderboardEntry(
            Long id,
            String name,
            long solvedProblems,
            long acceptedSubmissions,
            long totalSubmissions,
            int acceptanceRate
    ) {
    }

    // ============================================================
    // GET USER BY ID
    // ============================================================

    public User getUserById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        return userRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    // ============================================================
    // UPDATE USER ROLE
    // ============================================================

    public User updateUserRole(
            Long id,
            String role
    ) {

        User user = getUserById(id);

        if (role == null || role.isBlank()) {

            throw new IllegalArgumentException(
                    "Role is required"
            );
        }

        String normalizedRole =
                role.trim().toUpperCase();

        if (!normalizedRole.equals("USER")
                && !normalizedRole.equals("ADMIN")) {

            throw new IllegalArgumentException(
                    "Role must be USER or ADMIN"
            );
        }

        user.setRole(normalizedRole);

        return userRepository.save(user);
    }

    // ============================================================
    // DELETE USER
    // ============================================================

    @Transactional
    public void deleteUser(Long id) {

        User user = getUserById(id);

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalStateException(
                    "Admin accounts cannot be deleted"
            );
        }

        /*
         * Delete the user's submissions first because
         * submissions contain a foreign-key reference to users.
         */
        List<Submission> submissions =
                submissionRepository.findByUserId(id);

        if (submissions != null
                && !submissions.isEmpty()) {

            submissionRepository.deleteAll(submissions);
        }

        userRepository.delete(user);
    }
}