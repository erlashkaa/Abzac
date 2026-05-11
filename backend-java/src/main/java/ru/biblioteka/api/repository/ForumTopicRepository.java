package ru.biblioteka.api.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.biblioteka.api.entity.ForumTopicEntity;

import java.util.List;

public interface ForumTopicRepository extends JpaRepository<ForumTopicEntity, Long> {
    List<ForumTopicEntity> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @Query("SELECT t FROM ForumTopicEntity t ORDER BY t.isPinned DESC, t.lastActivity DESC")
    Page<ForumTopicEntity> findAllPaged(Pageable pageable);

    @Query("SELECT t FROM ForumTopicEntity t WHERE (:tag IS NULL OR t.tag = :tag) "
            + "AND (:search IS NULL OR :search = '' OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))) "
            + "ORDER BY t.isPinned DESC, t.lastActivity DESC")
    Page<ForumTopicEntity> searchTopics(@Param("tag") String tag, @Param("search") String search, Pageable pageable);

    long countByTag(String tag);
}
