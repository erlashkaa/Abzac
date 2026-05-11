package ru.biblioteka.api.dto.bookmark;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkCreateRequestDto {
    private Long bookId;
    private Integer paragraphIndex;
    private String name;
    private String description;
}
