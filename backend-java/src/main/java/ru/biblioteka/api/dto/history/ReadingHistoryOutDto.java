package ru.biblioteka.api.dto.history;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingHistoryOutDto {
    private Long bookId;
    private String bookTitle;
    private String bookCover;
    private Integer progressPercent;
    private Integer currentPage;
    private LocalDateTime lastReadAt;
}
