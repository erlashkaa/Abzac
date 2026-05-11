package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.CommentReactionEntity;

import java.util.Optional;

public interface CommentReactionRepository extends JpaRepository<CommentReactionEntity, Long> {
    Optional<CommentReactionEntity> findByCommentIdAndUserId(Long commentId, Long userId);
    long countByCommentIdAndReactionType(Long commentId, String reactionType);
    boolean existsByCommentIdAndUserIdAndReactionType(Long commentId, Long userId, String reactionType);
}
