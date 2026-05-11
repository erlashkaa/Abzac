package ru.biblioteka.api.dto.reading_history;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingHistoryUpdateRequestDto {
    private Integer progressPercent;
    private Integer currentPage;
}
