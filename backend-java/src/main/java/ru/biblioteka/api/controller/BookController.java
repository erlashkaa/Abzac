package ru.biblioteka.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.biblioteka.api.dto.book.BookCreateRequestDto;
import ru.biblioteka.api.dto.book.BookListOutDto;
import ru.biblioteka.api.dto.book.BookOutDto;
import ru.biblioteka.api.dto.book.BookUpdateRequestDto;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.service.BookService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<BookListOutDto> getBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            /** Совместимость: фронт шлёт {@code per_page}, старый клиент — {@code size}. */
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(name = "per_page", required = false) Integer perPage,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        Long userId = authUser != null ? authUser.getId() : null;
        int pageSize = (perPage != null && perPage > 0) ? perPage : size;
        return ResponseEntity.ok(bookService.getBooks(search, genre, sort, page, pageSize, userId));
    }

    @GetMapping("/genres")
    public ResponseEntity<List<String>> getGenres() {
        return ResponseEntity.ok(bookService.getGenres());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookOutDto> getBook(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser authUser) {
        Long userId = authUser != null ? authUser.getId() : null;
        return ResponseEntity.ok(bookService.getBook(id, userId));
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<Map<String, String>> getBookContent(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookContent(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<BookOutDto> createBook(@Valid @RequestBody BookCreateRequestDto request) {
        return ResponseEntity.ok(bookService.createBook(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<BookOutDto> updateBook(@PathVariable Long id, @Valid @RequestBody BookUpdateRequestDto request) {
        return ResponseEntity.ok(bookService.updateBook(id, request));
    }

    /** Текст книги отдельно (text/plain), без раздувания JSON — стабильнее для больших файлов */
    @PutMapping(value = "/{id}/content", consumes = MediaType.TEXT_PLAIN_VALUE)
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> updateBookContent(@PathVariable Long id, @RequestBody String content) {
        bookService.updateBookContent(id, content);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}
