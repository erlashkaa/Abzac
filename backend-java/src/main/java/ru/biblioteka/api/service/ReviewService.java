package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.biblioteka.api.dto.common.ReactionCountsDto;
import ru.biblioteka.api.dto.review.ReviewOutDto;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.ReviewEntity;
import ru.biblioteka.api.entity.ReviewReactionEntity;
import ru.biblioteka.api.entity.UserEntity;
import ru.biblioteka.api.mapper.DtoMapper;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.ReviewReactionRepository;
import ru.biblioteka.api.repository.ReviewRepository;
import ru.biblioteka.api.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewReactionRepository reactionRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public List<ReviewOutDto> getBookReviews(Long bookId, Long currentUserId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId).stream()
                .map(review -> {
                    UserEntity user = userRepository.findById(review.getUserId()).orElse(null);
                    String userName = user != null ? user.getUsername() : "Deleted User";
                    String userAvatar = user != null ? user.getAvatar() : null;

                    Boolean liked = currentUserId != null && reactionRepository.existsByReviewIdAndUserIdAndReactionType(review.getId(), currentUserId, "like");
                    Boolean disliked = currentUserId != null && reactionRepository.existsByReviewIdAndUserIdAndReactionType(review.getId(), currentUserId, "dislike");

                    return DtoMapper.toReviewOutDto(review, book.getTitle(), userName, userAvatar, liked, disliked);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewOutDto createReview(Long bookId, Long userId, Integer rating, String text) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ReviewEntity review = ReviewEntity.builder()
                .bookId(bookId)
                .userId(userId)
                .rating(rating)
                .text(text)
                .likes(0)
                .dislikes(0)
                .createdAt(LocalDateTime.now())
                .build();

        review = reviewRepository.save(review);

        // Update book rating and reviews count
        updateBookStats(bookId);

        return DtoMapper.toReviewOutDto(review, book.getTitle(), user.getUsername(), user.getAvatar(), false, false);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId, String role) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUserId().equals(userId) && !"admin".equals(role)) {
            throw new RuntimeException("Unauthorized");
        }

        Long bookId = review.getBookId();
        reviewRepository.delete(review);
        updateBookStats(bookId);
    }

    @Transactional
    public ReactionCountsDto reactToReview(Long reviewId, Long userId, String reactionType) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        reactionRepository.findByReviewIdAndUserId(reviewId, userId).ifPresent(reactionRepository::delete);

        if (reactionType != null && (reactionType.equals("like") || reactionType.equals("dislike"))) {
            ReviewReactionEntity reaction = ReviewReactionEntity.builder()
                    .reviewId(reviewId)
                    .userId(userId)
                    .reactionType(reactionType)
                    .build();
            reactionRepository.save(reaction);
        }

        review.setLikes((int) reactionRepository.countByReviewIdAndReactionType(reviewId, "like"));
        review.setDislikes((int) reactionRepository.countByReviewIdAndReactionType(reviewId, "dislike"));
        reviewRepository.save(review);

        return ReactionCountsDto.builder()
                .likes(review.getLikes())
                .dislikes(review.getDislikes())
                .build();
    }

    private void updateBookStats(Long bookId) {
        BookEntity book = bookRepository.findById(bookId).orElse(null);
        if (book != null) {
            List<ReviewEntity> reviews = reviewRepository.findByBookId(bookId);
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
