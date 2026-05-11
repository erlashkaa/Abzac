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
public class ForumMessageOutDto {
    private Long id;
    private Long topicId;
    private Long authorId;
    private String authorName;
    private String authorAvatar;
    private String authorRole;
    private String content;
    private Integer likes;
    private Integer dislikes;
    private Boolean likedByUser;
    private Boolean dislikedByUser;
    private Long parentId;
    private LocalDateTime createdAt;
}
