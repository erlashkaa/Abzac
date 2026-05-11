package ru.biblioteka.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.biblioteka.api.dto.book.BookOutDto;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.service.BookPurchaseService;

import java.util.Map;

/**
 * Отдельный префикс, чтобы не пересекаться с {@code POST /api/books} (создание книги только для admin).
 */
@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final BookPurchaseService bookPurchaseService;

    @PostMapping("/books/{bookId}")
    public ResponseEntity<?> purchaseBook(
            @PathVariable Long bookId,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Сессия недействительна: пользователь из токена не найден или секрет JWT изменился. "
                                    + "Выйдите из аккаунта и войдите снова."));
        }
        return ResponseEntity.ok(bookPurchaseService.purchase(authUser.getId(), bookId));
    }
}
