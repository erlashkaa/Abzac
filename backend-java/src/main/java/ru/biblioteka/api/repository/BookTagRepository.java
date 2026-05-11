package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.BookTagEntity;

import java.util.List;

public interface BookTagRepository extends JpaRepository<BookTagEntity, Long> {
    List<BookTagEntity> findByBookId(Long bookId);
    void deleteByBookId(Long bookId);
}
