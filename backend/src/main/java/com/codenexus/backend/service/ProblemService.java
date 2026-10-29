package com.codenexus.backend.service;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.entity.Submission;
import com.codenexus.backend.repository.ProblemRepository;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.ArrayList;
import java.util.Locale;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(
            ProblemRepository problemRepository
    ) {
        this.problemRepository = problemRepository;
    }

    // ============================================================
    // CREATE PROBLEM
    // ============================================================

    public Problem createProblem(Problem problem) {

        validateProblem(problem);

        return problemRepository.save(problem);
    }

    // ============================================================
    // GET ALL PROBLEMS
    // ============================================================

    public List<Problem> getAllProblems() {
        return problemRepository.findAll(
                Sort.by(Sort.Direction.ASC, "id")
        );
    }

    public Page<Problem> searchProblems(
            String search,
            String category,
            String difficulty,
            String tag,
            String progress,
            String userEmail,
            int page,
            int size,
            String sort,
            String direction
    ) {
        if (page < 0) {
            throw new IllegalArgumentException("Page must be zero or greater");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("Page size must be between 1 and 100");
        }

        String sortKey = normalizeSort(sort);
        Sort.Direction sortDirection;
        try {
            sortDirection = Sort.Direction.fromString(
                    direction == null
                            ? ("newest".equals(sortKey) ? "desc" : "asc")
                            : direction
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Direction must be either asc or desc"
            );
        }

        Specification<Problem> specification =
                (root, query, builder) -> {
                    List<Predicate> predicates = new ArrayList<>();
                    String normalizedSearch = normalize(search);
                    String normalizedCategory = normalize(category);
                    String normalizedDifficulty = normalize(difficulty);
                    String normalizedTag = normalize(tag);
                    String normalizedProgress = normalize(progress);

                    if (!normalizedSearch.isEmpty()) {
                        String pattern = "%" + normalizedSearch + "%";
                        Join<Problem, String> problemTags =
                                root.join("tags", JoinType.LEFT);
                        predicates.add(builder.or(
                                builder.like(
                                        builder.lower(root.get("title")),
                                        pattern
                                ),
                                builder.like(
                                        builder.lower(root.get("description")),
                                        pattern
                                ),
                                builder.like(
                                        builder.lower(root.get("topic")),
                                        pattern
                                ),
                                builder.like(
                                        builder.lower(root.get("difficulty")),
                                        pattern
                                ),
                                builder.like(
                                        builder.lower(root.get("category")),
                                        pattern
                                ),
                                builder.like(
                                        builder.lower(problemTags),
                                        pattern
                                )
                        ));
                        query.distinct(true);
                    }

                    if (!normalizedCategory.isEmpty()) {
                        predicates.add(builder.equal(
                                builder.lower(builder.coalesce(
                                        root.get("category"),
                                        root.get("topic")
                                )),
                                normalizedCategory
                        ));
                    }

                    if (!normalizedDifficulty.isEmpty()) {
                        predicates.add(builder.equal(
                                builder.lower(root.get("difficulty")),
                                normalizedDifficulty
                        ));
                    }

                    if (!normalizedTag.isEmpty()) {
                        Join<Problem, String> problemTags =
                                root.join("tags", JoinType.INNER);
                        predicates.add(builder.equal(
                                builder.lower(problemTags),
                                normalizedTag
                        ));
                        query.distinct(true);
                    }

                    if (!normalizedProgress.isEmpty()
                            && !"all".equals(normalizedProgress)) {
                        if (userEmail == null || userEmail.isBlank()) {
                            throw new IllegalArgumentException(
                                    "Authentication is required to filter by progress"
                            );
                        }
                        Subquery<Long> userSubmissions =
                                userSubmissionQuery(
                                        root,
                                        query,
                                        builder,
                                        userEmail,
                                        false
                                );
                        Subquery<Long> acceptedUserSubmissions =
                                userSubmissionQuery(
                                        root,
                                        query,
                                        builder,
                                        userEmail,
                                        true
                                );
                        switch (normalizedProgress) {
                            case "solved" ->
                                    predicates.add(builder.exists(
                                            acceptedUserSubmissions
                                    ));
                            case "attempted" -> predicates.add(
                                    builder.and(
                                            builder.exists(userSubmissions),
                                            builder.not(builder.exists(
                                                    acceptedUserSubmissions
                                            ))
                                    )
                            );
                            case "unsolved" ->
                                    predicates.add(builder.not(
                                            builder.exists(userSubmissions)
                                    ));
                            default -> throw new IllegalArgumentException(
                                    "Progress must be all, solved, attempted, or unsolved"
                            );
                        }
                    }

                    if (query != null
                            && !Long.class.equals(query.getResultType())
                            && !long.class.equals(query.getResultType())) {
                        applyOrdering(
                                root,
                                query,
                                builder,
                                sortKey,
                                sortDirection
                        );
                    }

                    return builder.and(predicates.toArray(Predicate[]::new));
                };

        Pageable pageable = PageRequest.of(page, size);
        return problemRepository.findAll(specification, pageable);
    }

    // ============================================================
    // GET PROBLEM BY ID
    // ============================================================

    public Problem getProblemById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Problem ID is required"
            );
        }

        return problemRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Problem not found"
                        )
                );
    }

    // ============================================================
    // UPDATE PROBLEM
    // ============================================================

    public Problem updateProblem(
            Long id,
            Problem updatedProblem
    ) {

        if (updatedProblem == null) {
            throw new IllegalArgumentException(
                    "Problem data is required"
            );
        }

        Problem problem =
                getProblemById(id);

        validateProblem(updatedProblem);

        problem.setTitle(
                updatedProblem.getTitle()
        );

        problem.setDescription(
                updatedProblem.getDescription()
        );

        problem.setDifficulty(
                updatedProblem.getDifficulty()
        );

        problem.setTopic(
                valueOrFallback(
                        updatedProblem.getTopic(),
                        updatedProblem.getCategory()
                )
        );

        problem.setCategory(
                valueOrFallback(
                        updatedProblem.getCategory(),
                        updatedProblem.getTopic()
                )
        );

        if (updatedProblem.getTags() != null
                && (!updatedProblem.getTags().isEmpty()
                || updatedProblem.getCategory() != null)) {
            problem.setTags(updatedProblem.getTags());
        }

        problem.setConstraints(
                updatedProblem.getConstraints()
        );

        problem.setInputFormat(
                updatedProblem.getInputFormat()
        );

        problem.setOutputFormat(
                updatedProblem.getOutputFormat()
        );

        problem.setSampleInput(
                updatedProblem.getSampleInput()
        );

        problem.setSampleOutput(
                updatedProblem.getSampleOutput()
        );

        problem.setSampleInput2(
                updatedProblem.getSampleInput2()
        );

        problem.setSampleOutput2(
                updatedProblem.getSampleOutput2()
        );

        return problemRepository.save(problem);
    }

    // ============================================================
    // DELETE PROBLEM
    // ============================================================

    @Transactional
    public void deleteProblem(Long id) {

        Problem problem =
                getProblemById(id);

        problemRepository.delete(problem);
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    private void validateProblem(
            Problem problem
    ) {

        if (problem == null) {
            throw new IllegalArgumentException(
                    "Problem data is required"
            );
        }

        if (problem.getTitle() == null
                || problem.getTitle().isBlank()) {

            throw new IllegalArgumentException(
                    "Problem title is required"
            );
        }

        if (problem.getDescription() == null
                || problem.getDescription().isBlank()) {

            throw new IllegalArgumentException(
                    "Problem description is required"
            );
        }

        if (problem.getDifficulty() == null
                || problem.getDifficulty().isBlank()) {

            throw new IllegalArgumentException(
                    "Problem difficulty is required"
            );
        }

        if ((problem.getTopic() == null || problem.getTopic().isBlank())
                && (problem.getCategory() == null
                || problem.getCategory().isBlank())) {

            throw new IllegalArgumentException(
                    "Problem category is required"
            );
        }

        if (problem.getTags() != null
                && problem.getTags().size() > 20) {
            throw new IllegalArgumentException(
                    "A problem cannot have more than 20 tags"
            );
        }
        if (problem.getTags() != null
                && problem.getTags().stream()
                .anyMatch(tag -> tag == null || tag.trim().length() > 100)) {
            throw new IllegalArgumentException(
                    "Problem tags must be 100 characters or fewer"
            );
        }

        problem.setTopic(valueOrFallback(
                problem.getTopic(),
                problem.getCategory()
        ));
        problem.setCategory(valueOrFallback(
                problem.getCategory(),
                problem.getTopic()
        ));
    }

    private void applyOrdering(
            Root<Problem> root,
            CriteriaQuery<?> query,
            CriteriaBuilder builder,
            String sort,
            Sort.Direction direction
    ) {
        boolean ascending = direction.isAscending();
        switch (sort) {
            case "difficulty" -> query.orderBy(
                    ascending
                            ? builder.asc(root.get("difficulty"))
                            : builder.desc(root.get("difficulty")),
                    builder.asc(root.get("id"))
            );
            case "popular" -> {
                Subquery<Long> totalSubmissions =
                        submissionCountQuery(root, query, builder, false);
                query.orderBy(
                        ascending
                                ? builder.asc(totalSubmissions)
                                : builder.desc(totalSubmissions),
                        builder.asc(root.get("id"))
                );
            }
            case "solved_percentage" -> {
                Subquery<Long> totalSubmissions =
                        submissionCountQuery(root, query, builder, false);
                Subquery<Long> acceptedSubmissions =
                        submissionCountQuery(root, query, builder, true);
                var completionRate = builder.<Double>selectCase()
                        .when(builder.equal(totalSubmissions, 0L), 0.0)
                        .otherwise(builder.quot(
                                builder.toDouble(acceptedSubmissions),
                                builder.toDouble(totalSubmissions)
                        ).as(Double.class));
                query.orderBy(
                        ascending
                                ? builder.asc(completionRate)
                                : builder.desc(completionRate),
                        builder.asc(root.get("id"))
                );
            }
            case "newest" -> query.orderBy(
                    ascending
                            ? builder.asc(root.get("createdAt"))
                            : builder.desc(root.get("createdAt")),
                    builder.asc(root.get("id"))
            );
            default -> query.orderBy(
                    ascending
                            ? builder.asc(root.get("title"))
                            : builder.desc(root.get("title")),
                    builder.asc(root.get("id"))
            );
        }
    }

    private Subquery<Long> submissionCountQuery(
            Root<Problem> problem,
            CriteriaQuery<?> query,
            CriteriaBuilder builder,
            boolean acceptedOnly
    ) {
        Subquery<Long> countQuery = query.subquery(Long.class);
        Root<Submission> submission = countQuery.from(Submission.class);
        countQuery.select(builder.count(submission.get("id")));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(builder.equal(submission.get("problem"), problem));
        if (acceptedOnly) {
            predicates.add(builder.equal(
                    submission.get("status"),
                    "ACCEPTED"
            ));
        }
        countQuery.where(predicates.toArray(Predicate[]::new));
        return countQuery;
    }

    private Subquery<Long> userSubmissionQuery(
            Root<Problem> problem,
            CriteriaQuery<?> query,
            CriteriaBuilder builder,
            String userEmail,
            boolean acceptedOnly
    ) {
        Subquery<Long> submissionsQuery = query.subquery(Long.class);
        Root<Submission> submission = submissionsQuery.from(Submission.class);
        submissionsQuery.select(submission.get("id"));
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(builder.equal(submission.get("problem"), problem));
        predicates.add(builder.equal(
                builder.lower(submission.get("user").get("email")),
                userEmail.trim().toLowerCase(Locale.ROOT)
        ));
        if (acceptedOnly) {
            predicates.add(builder.equal(
                    submission.get("status"),
                    "ACCEPTED"
            ));
        }
        submissionsQuery.where(predicates.toArray(Predicate[]::new));
        return submissionsQuery;
    }

    private String normalizeSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return "newest";
        }
        String normalized = sort.trim()
                .toLowerCase(Locale.ROOT)
                .replace('-', '_');
        if (!List.of(
                "newest",
                "difficulty",
                "popular",
                "solved_percentage",
                "title"
        ).contains(normalized)) {
            throw new IllegalArgumentException(
                    "Unsupported sort. Use newest, difficulty, popular, solved_percentage, or title"
            );
        }
        return normalized;
    }

    private String normalize(String value) {
        return value == null
                ? ""
                : value.trim().toLowerCase(Locale.ROOT);
    }

    private String valueOrFallback(String value, String fallback) {
        return value == null || value.isBlank()
                ? fallback
                : value.trim();
    }
}