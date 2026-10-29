package com.codenexus.backend.service;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.repository.ProblemBookmarkRepository;
import com.codenexus.backend.repository.ProblemRepository;
import com.codenexus.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookmarkServiceTest {

    @Mock
    private ProblemBookmarkRepository bookmarkRepository;

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookmarkService bookmarkService;

    @Test
    void addsBookmarkForAuthenticatedUser() {
        User user = new User();
        user.setId(3L);
        Problem problem = new Problem();
        problem.setId(7L);

        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(user));
        when(problemRepository.findById(7L))
                .thenReturn(Optional.of(problem));
        when(bookmarkRepository.existsByUserIdAndProblemId(3L, 7L))
                .thenReturn(false);

        Problem result = bookmarkService.addBookmark("user@example.com", 7L);

        assertSame(problem, result);
        verify(bookmarkRepository).save(any());
    }

    @Test
    void addingExistingBookmarkIsIdempotent() {
        User user = new User();
        user.setId(3L);
        Problem problem = new Problem();
        problem.setId(7L);

        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(user));
        when(problemRepository.findById(7L))
                .thenReturn(Optional.of(problem));
        when(bookmarkRepository.existsByUserIdAndProblemId(3L, 7L))
                .thenReturn(true);

        bookmarkService.addBookmark("user@example.com", 7L);

        verify(bookmarkRepository, never()).save(any());
    }
}
