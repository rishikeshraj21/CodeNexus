package com.codenexus.backend.controller;

import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.service.BookmarkService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @GetMapping
    public ResponseEntity<?> getBookmarks(Authentication authentication) {
        try {
            List<Problem> bookmarks =
                    bookmarkService.getBookmarks(authentication.getName());
            return ResponseEntity.ok(bookmarks);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @PutMapping("/{problemId}")
    public ResponseEntity<?> addBookmark(
            @PathVariable Long problemId,
            Authentication authentication
    ) {
        try {
            return ResponseEntity.ok(
                    bookmarkService.addBookmark(authentication.getName(), problemId)
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    @DeleteMapping("/{problemId}")
    public ResponseEntity<?> removeBookmark(
            @PathVariable Long problemId,
            Authentication authentication
    ) {
        bookmarkService.removeBookmark(authentication.getName(), problemId);
        return ResponseEntity.noContent().build();
    }
}
