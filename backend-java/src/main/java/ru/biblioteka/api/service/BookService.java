package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ru.biblioteka.api.dto.book.BookCreateRequestDto;
import ru.biblioteka.api.dto.book.BookListOutDto;
import ru.biblioteka.api.dto.book.BookOutDto;
import ru.biblioteka.api.dto.book.BookUpdateRequestDto;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.BookTagEntity;
import ru.biblioteka.api.mapper.DtoMapper;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.BookTagRepository;
import ru.biblioteka.api.util.DateTimeUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BookTagRepository bookTagRepository;

    public BookListOutDto getBooks(String search, String genre, String sort, int page, int perPage) {
        PageRequest pageRequest;
        if ("rating".equals(sort)) {
            pageRequest = PageRequest.of(page - 1, perPage, Sort.by(Sort.Direction.DESC, "rating"));
        } else if ("new".equals(sort)) {
            pageRequest = PageRequest.of(page - 1, perPage, Sort.by(Sort.Direction.DESC, "year").and(Sort.by(Sort.Direction.DESC, "createdAt")));
        } else {
            pageRequest = PageRequest.of(page - 1, perPage, Sort.by(Sort.Direction.DESC, "reviewsCount"));
        }

        var pageResult = (search != null && !search.isBlank())
                ? bookRepository.searchByTitleOrAuthor(search, pageRequest)
                : bookRepository.findAll(pageRequest);

        if (genre != null && !genre.isBlank() && !"Все".equals(genre)) {
            pageResult = bookRepository.findByGenreContainingIgnoreCase(genre, pageRequest);
        }

        List<BookOutDto> books = pageResult.stream()
                .map(book -> DtoMapper.toBookOutDto(book, bookTagRepository.findByBookId(book.getId()).stream().map(BookTagEntity::getTag).collect(Collectors.toList())))
                .collect(Collectors.toList());

        return BookListOutDto.builder()
                .books(books)
                .total((int) pageResult.getTotalElements())
                .page(page)
                .perPage(perPage)
                .build();
    }

    public List<String> getGenres() {
        Set<String> result = new HashSet<>();
        for (String genre : bookRepository.findDistinctGenres()) {
            if (genre != null && !genre.isBlank()) {
                for (String part : genre.split(",")) {
                    result.add(part.trim());
                }
            }
        }
        var sorted = new ArrayList<>(result);
        sorted.sort(String::compareTo);
        return sorted;
    }

    public BookOutDto getBook(Long bookId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Книга не найдена"));
        var tags = bookTagRepository.findByBookId(book.getId()).stream().map(BookTagEntity::getTag).collect(Collectors.toList());
        return DtoMapper.toBookOutDto(book, tags);
    }

    public Map<String, String> getBookContent(Long bookId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Книга не найдена"));
        return Map.of("content", book.getContent(), "title", book.getTitle());
    }

    public BookOutDto createBook(BookCreateRequestDto request) {
        BookEntity book = BookEntity.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .description(request.getDescription() != null ? request.getDescription() : "")
                .cover(request.getCover() != null ? request.getCover() : "")
                .genre(request.getGenre() != null ? request.getGenre() : "")
                .year(request.getYear() != null ? request.getYear() : 2024)
                .isFree(request.getIsFree() != null ? request.getIsFree() : false)
                .content(request.getContent() != null ? request.getContent() : "")
                .createdAt(DateTimeUtils.moscowNow())
                .build();
        bookRepository.save(book);
        if (request.getTags() != null) {
            for (String tag : request.getTags()) {
                bookTagRepository.save(BookTagEntity.builder().bookId(book.getId()).tag(tag).build());
            }
        }
        var tags = bookTagRepository.findByBookId(book.getId()).stream().map(BookTagEntity::getTag).collect(Collectors.toList());
        return DtoMapper.toBookOutDto(book, tags);
    }

    public BookOutDto updateBook(Long bookId, BookUpdateRequestDto request) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Книга не найдена"));
        if (request.getTitle() != null) book.setTitle(request.getTitle());
        if (request.getAuthor() != null) book.setAuthor(request.getAuthor());
        if (request.getDescription() != null) book.setDescription(request.getDescription());
        if (request.getCover() != null) book.setCover(request.getCover());
        if (request.getGenre() != null) book.setGenre(request.getGenre());
        if (request.getYear() != null) book.setYear(request.getYear());
        if (request.getIsFree() != null) book.setIsFree(request.getIsFree());
        if (request.getContent() != null) book.setContent(request.getContent());
        if (request.getTags() != null) {
            bookTagRepository.deleteByBookId(book.getId());
            for (String tag : request.getTags()) {
                bookTagRepository.save(BookTagEntity.builder().bookId(book.getId()).tag(tag).build());
            }
        }
        bookRepository.save(book);
        var tags = bookTagRepository.findByBookId(book.getId()).stream().map(BookTagEntity::getTag).collect(Collectors.toList());
        return DtoMapper.toBookOutDto(book, tags);
    }

    public void updateBookContent(Long bookId, String content) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Книга не найдена"));
        book.setContent(content != null ? content : "");
        bookRepository.save(book);
    }

    public void deleteBook(Long bookId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Книга не найдена"));
        bookRepository.delete(book);
    }
}
