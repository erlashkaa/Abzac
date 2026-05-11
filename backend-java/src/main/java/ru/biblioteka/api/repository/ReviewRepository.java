package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.ReviewEntity;

import java.util.List;

public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {
    List<ReviewEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ReviewEntity> findByBookId(Long bookId);
    List<ReviewEntity> findByBookIdOrderByCreatedAtDesc(Long bookId);

    boolean existsByBookIdAndUserId(Long bookId, Long userId);
}
