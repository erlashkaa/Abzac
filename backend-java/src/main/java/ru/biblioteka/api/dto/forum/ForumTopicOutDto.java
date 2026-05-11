package ru.biblioteka.api.dto.forum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumTopicOutDto {
    private Long id;
    private String title;
    private Long authorId;
    private String authorName;
    private Boolean isPinned;
    private Boolean isLocked;
    private String tag;
    private Integer repliesCount;
    private LocalDateTime lastActivity;
    private LocalDateTime createdAt;
}
