package ru.biblioteka.api.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.biblioteka.api.entity.BookEntity;

import java.util.List;

public interface BookRepository extends JpaRepository<BookEntity, Long> {

    @Query("SELECT b FROM BookEntity b WHERE lower(b.title) LIKE lower(concat('%', :search, '%')) OR lower(b.author) LIKE lower(concat('%', :search, '%'))")
    Page<BookEntity> searchByTitleOrAuthor(@Param("search") String search, Pageable pageable);

    @Query("SELECT DISTINCT b.genre FROM BookEntity b")
    List<String> findDistinctGenres();

    Page<BookEntity> findByGenreContainingIgnoreCase(String genre, Pageable pageable);
}
