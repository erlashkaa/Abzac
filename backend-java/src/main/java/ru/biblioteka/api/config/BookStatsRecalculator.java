package ru.biblioteka.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.ReviewEntity;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.ReviewRepository;

import java.util.List;

/**
 * Синхронизирует reviews_count и средний рейтинг с фактическими отзывами (устаревшие значения из сида/миграций).
 */
@Component
@Order(100)
@RequiredArgsConstructor
public class BookStatsRecalculator implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public void run(String... args) {
        for (BookEntity book : bookRepository.findAll()) {
            List<ReviewEntity> reviews = reviewRepository.findByBookId(book.getId());
            book.setReviewsCount(reviews.size());
            if (reviews.isEmpty()) {
                book.setRating(0.0);
            } else {
                double avg = reviews.stream().mapToInt(ReviewEntity::getRating).average().orElse(0.0);
                book.setRating(avg);
            }
            bookRepository.save(book);
        }
    }
}
