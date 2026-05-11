package ru.biblioteka.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.biblioteka.api.dto.common.ReactionCountsDto;
import ru.biblioteka.api.dto.review.ReviewOutDto;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.security.SecurityUtils;
import ru.biblioteka.api.service.ReviewService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/books/{bookId}/reviews")
    public ResponseEntity<List<ReviewOutDto>> getBookReviews(@PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(reviewService.getBookReviews(bookId, userId));
    }

    @PostMapping("/books/{bookId}/reviews")
    public ResponseEntity<ReviewOutDto> createReview(
            @PathVariable Long bookId,
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, Object> request) {
        Object ratingRaw = request.get("rating");
        int rating = 0;
        if (ratingRaw instanceof Number n) {
            rating = n.intValue();
        }
        String text = (String) request.get("text");
        return ResponseEntity.ok(reviewService.createReview(bookId, authUser.getId(), rating, text));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        reviewService.deleteReview(id, authUser.getId(), authUser.getUser().getRole());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reviews/{id}/react")
    public ResponseEntity<ReactionCountsDto> reactToReview(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(reviewService.reactToReview(id, authUser.getId(), request.get("reaction_type")));
    }
}
