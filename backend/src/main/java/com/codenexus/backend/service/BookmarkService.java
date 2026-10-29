package com.codenexus.backend.service;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.entity.ProblemBookmark;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.repository.ProblemBookmarkRepository;
import com.codenexus.backend.repository.ProblemRepository;
import com.codenexus.backend.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookmarkService {

    private final ProblemBookmarkRepository bookmarkRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    public BookmarkService(
            ProblemBookmarkRepository bookmarkRepository,
            ProblemRepository problemRepository,
            UserRepository userRepository
    ) {
        this.bookmarkRepository = bookmarkRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Problem> getBookmarks(String email) {
        User user = getUser(email);
        List<Problem> problems = new java.util.ArrayList<>();
        for (ProblemBookmark bookmark :
                bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId())) {
            if (bookmark != null && bookmark.getProblem() != null) {
                problems.add(bookmark.getProblem());
            }
        }
        return problems;
    }

    @Transactional
    public Problem addBookmark(String email, Long problemId) {
        User user = getUser(email);
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found"));

        if (!bookmarkRepository.existsByUserIdAndProblemId(user.getId(), problemId)) {
            bookmarkRepository.save(new ProblemBookmark(user, problem));
        }
        return problem;
    }

    @Transactional
    public void removeBookmark(String email, Long problemId) {
        User user = getUser(email);
        bookmarkRepository.deleteByUserIdAndProblemId(user.getId(), problemId);
    }

    private User getUser(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authenticated user is required");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
