package com.codenexus.backend.dto;

import com.codenexus.backend.entity.UserNotification;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        LocalDateTime createdAt,
        boolean read
) {

    public static NotificationResponse from(UserNotification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt(),
                notification.isRead()
        );
    }
}
