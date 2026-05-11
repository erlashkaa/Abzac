package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.ForumMessageReactionEntity;

import java.util.Optional;

public interface ForumMessageReactionRepository extends JpaRepository<ForumMessageReactionEntity, Long> {
    Optional<ForumMessageReactionEntity> findByMessageIdAndUserId(Long messageId, Long userId);

    boolean existsByMessageIdAndUserIdAndReactionType(Long messageId, Long userId, String reactionType);

    long countByMessageIdAndReactionType(Long messageId, String reactionType);
}
