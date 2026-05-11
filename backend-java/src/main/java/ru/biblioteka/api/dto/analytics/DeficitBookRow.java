package ru.biblioteka.api.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeficitBookRow {
    private Long bookId;
    private String title;
    private Integer stockQuantity;
    private Integer recommendedRestock;
}

