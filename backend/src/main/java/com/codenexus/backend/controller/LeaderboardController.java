package com.codenexus.backend.controller;

import com.codenexus.backend.service.UserService;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final UserService userService;

    public LeaderboardController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserService.LeaderboardEntry> getLeaderboard() {
        return userService.getLeaderboard();
    }
}
