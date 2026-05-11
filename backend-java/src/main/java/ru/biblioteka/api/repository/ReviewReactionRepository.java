package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.ReviewReactionEntity;

import java.util.Optional;

public interface ReviewReactionRepository extends JpaRepository<ReviewReactionEntity, Long> {
    Optional<ReviewReactionEntity> findByReviewIdAndUserId(Long reviewId, Long userId);
    long countByReviewIdAndReactionType(Long reviewId, String reactionType);
    boolean existsByReviewIdAndUserIdAndReactionType(Long reviewId, Long userId, String reactionType);
}
