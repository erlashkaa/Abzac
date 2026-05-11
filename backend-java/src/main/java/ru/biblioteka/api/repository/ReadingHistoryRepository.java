package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.ReadingHistoryEntity;

import java.util.List;
import java.util.Optional;

public interface ReadingHistoryRepository extends JpaRepository<ReadingHistoryEntity, Long> {
    List<ReadingHistoryEntity> findByUserIdOrderByLastReadAtDesc(Long userId);
    Optional<ReadingHistoryEntity> findByUserIdAndBookId(Long userId, Long bookId);
}
