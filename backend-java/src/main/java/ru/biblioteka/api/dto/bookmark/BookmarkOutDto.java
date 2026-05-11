package ru.biblioteka.api.dto.bookmark;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkOutDto {
    private Long id;
    private Long bookId;
    private Integer paragraphIndex;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}
