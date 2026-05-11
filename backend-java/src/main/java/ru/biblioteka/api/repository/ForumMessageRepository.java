package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.ForumMessageEntity;

import java.util.List;

public interface ForumMessageRepository extends JpaRepository<ForumMessageEntity, Long> {
    List<ForumMessageEntity> findByAuthorId(Long authorId);
    List<ForumMessageEntity> findByTopicIdOrderByCreatedAtAsc(Long topicId);
}
