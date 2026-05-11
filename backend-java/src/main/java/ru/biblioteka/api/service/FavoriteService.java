package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.biblioteka.api.dto.book.BookOutDto;
import ru.biblioteka.api.dto.favorite.FavoriteCheckDto;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.FavoriteEntity;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.BookTagRepository;
import ru.biblioteka.api.repository.FavoriteRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final BookRepository bookRepository;
    private final BookTagRepository tagRepository;

    public List<BookOutDto> getUserFavorites(Long userId) {
        List<FavoriteEntity> favorites = favoriteRepository.findByUserId(userId);
        List<Long> bookIds = favorites.stream().map(FavoriteEntity::getBookId).collect(Collectors.toList());
        
        return bookRepository.findAllById(bookIds).stream()
                .map(book -> BookOutDto.builder()
                        .id(book.getId())
                        .title(book.getTitle())
                        .author(book.getAuthor())
                        .cover(book.getCover())
                        .rating(book.getRating())
                        .tags(tagRepository.findByBookId(book.getId()).stream().map(t -> t.getTag()).collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(Long userId, Long bookId) {
        if (!favoriteRepository.existsByUserIdAndBookId(userId, bookId)) {
            FavoriteEntity favorite = FavoriteEntity.builder()
                    .userId(userId)
                    .bookId(bookId)
                    .createdAt(LocalDateTime.now())
                    .build();
            favoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorite(Long userId, Long bookId) {
        favoriteRepository.findByUserIdAndBookId(userId, bookId)
                .ifPresent(favoriteRepository::delete);
    }

    public FavoriteCheckDto checkFavorite(Long userId, Long bookId) {
        return FavoriteCheckDto.builder()
                .isFavorite(favoriteRepository.existsByUserIdAndBookId(userId, bookId))
                .build();
    }
}
