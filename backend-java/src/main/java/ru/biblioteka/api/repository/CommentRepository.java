package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.CommentEntity;

import java.util.List;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<CommentEntity> findByBookIdOrderByCreatedAtDesc(Long bookId);

    boolean existsByBookIdAndUserId(Long bookId, Long userId);
}
