package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.BookmarkEntity;

public interface BookmarkRepository extends JpaRepository<BookmarkEntity, Long> {
}
