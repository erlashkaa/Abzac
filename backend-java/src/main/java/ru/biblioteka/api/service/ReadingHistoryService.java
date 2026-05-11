package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.biblioteka.api.dto.history.ReadingHistoryOutDto;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.ReadingHistoryEntity;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.ReadingHistoryRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReadingHistoryService {

    private final ReadingHistoryRepository historyRepository;
    private final BookRepository bookRepository;

    public List<ReadingHistoryOutDto> getUserHistory(Long userId) {
        return historyRepository.findByUserIdOrderByLastReadAtDesc(userId).stream()
                .map(this::toOutDto)
                .collect(Collectors.toList());
    }

    private ReadingHistoryOutDto toOutDto(ReadingHistoryEntity h) {
        BookEntity book = bookRepository.findById(h.getBookId()).orElse(null);
        String title = book != null ? book.getTitle() : "Книга удалена";
        String cover = book != null ? book.getCover() : "";
        return ReadingHistoryOutDto.builder()
                .bookId(h.getBookId())
                .bookTitle(title)
                .bookCover(cover)
                .progressPercent(h.getProgressPercent() != null ? h.getProgressPercent() : 0)
                .currentPage(h.getCurrentPage() != null ? h.getCurrentPage() : 0)
                .lastReadAt(h.getLastReadAt())
                .build();
    }

    @Transactional
    public void updateProgress(Long userId, Long bookId, Integer progressPercent, Integer currentPage) {
        ReadingHistoryEntity history = historyRepository.findByUserIdAndBookId(userId, bookId)
                .orElse(ReadingHistoryEntity.builder()
                        .userId(userId)
                        .bookId(bookId)
                        .build());

        history.setProgressPercent(progressPercent);
        history.setCurrentPage(currentPage);
        history.setLastReadAt(LocalDateTime.now());

        historyRepository.save(history);
    }
}
