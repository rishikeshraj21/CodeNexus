package com.codenexus.backend.service;

import com.codenexus.backend.dto.NotificationResponse;
import com.codenexus.backend.dto.AdminAnnouncementRequest;
import com.codenexus.backend.entity.Problem;
import com.codenexus.backend.entity.User;
import com.codenexus.backend.entity.UserNotification;
import com.codenexus.backend.repository.UserNotificationRepository;
import com.codenexus.backend.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final UserNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            UserNotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(String email) {
        User user = getUser(email);
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public void markRead(String email, Long notificationId) {
        User user = getUser(email);
        UserNotification notification = notificationRepository
                .findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Notification not found"
                ));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void recordAcceptedSubmission(User user, Problem problem, Long submissionId) {
        UserNotification notification = new UserNotification(
                user,
                "Submission accepted",
                "Submission #" + submissionId
                        + " passed all test cases for " + problem.getTitle() + "."
        );
        notification.setType("SUBMISSION_ACCEPTED");
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllForAdmin() {
        return notificationRepository
                .findByTypeOrderByCreatedAtDesc("ANNOUNCEMENT")
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public int broadcast(AdminAnnouncementRequest request) {
        if (request == null
                || request.title() == null
                || request.title().isBlank()
                || request.message() == null
                || request.message().isBlank()) {
            throw new IllegalArgumentException(
                    "Announcement title and message are required"
            );
        }
        List<UserNotification> announcements = userRepository.findAll()
                .stream()
                .map(user -> new UserNotification(
                        user,
                        request.title().trim(),
                        request.message().trim()
                ))
                .toList();
        notificationRepository.saveAll(announcements);
        return announcements.size();
    }

    @Transactional
    public void deleteForAdmin(Long id) {
        UserNotification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Announcement not found"
                ));
        if (!"ANNOUNCEMENT".equals(notification.getType())) {
            throw new IllegalArgumentException("Announcement not found");
        }
        notificationRepository.deleteById(id);
    }

    private User getUser(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authenticated user is required");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
