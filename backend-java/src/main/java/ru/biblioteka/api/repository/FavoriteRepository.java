package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.FavoriteEntity;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<FavoriteEntity, Long> {
    List<FavoriteEntity> findByUserId(Long userId);
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    Optional<FavoriteEntity> findByUserIdAndBookId(Long userId, Long bookId);
}
