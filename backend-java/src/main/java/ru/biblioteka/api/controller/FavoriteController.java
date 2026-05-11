package ru.biblioteka.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.biblioteka.api.dto.book.BookOutDto;
import ru.biblioteka.api.dto.favorite.FavoriteCheckDto;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.service.FavoriteService;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<BookOutDto>> getFavorites(@AuthenticationPrincipal AuthenticatedUser authUser) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(authUser.getId()));
    }

    @GetMapping("/check/{bookId}")
    public ResponseEntity<FavoriteCheckDto> checkFavorite(
            @PathVariable Long bookId,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        return ResponseEntity.ok(favoriteService.checkFavorite(authUser.getId(), bookId));
    }

    @PostMapping("/{bookId}")
    public ResponseEntity<Void> addFavorite(
            @PathVariable Long bookId,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        favoriteService.addFavorite(authUser.getId(), bookId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long bookId,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        favoriteService.removeFavorite(authUser.getId(), bookId);
        return ResponseEntity.ok().build();
    }
}
