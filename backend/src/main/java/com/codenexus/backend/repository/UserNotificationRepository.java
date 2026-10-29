package com.codenexus.backend.repository;

import com.codenexus.backend.entity.UserNotification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserNotificationRepository
        extends JpaRepository<UserNotification, Long> {

    List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<UserNotification> findByIdAndUserId(Long id, Long userId);

    List<UserNotification> findAllByOrderByCreatedAtDesc();

    List<UserNotification> findByTypeOrderByCreatedAtDesc(String type);

    void deleteById(Long id);
}
