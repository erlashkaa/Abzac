package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.PurchaseEntity;

import java.util.List;
import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<PurchaseEntity, Long> {
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    Optional<PurchaseEntity> findByUserIdAndBookId(Long userId, Long bookId);
    List<PurchaseEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}

