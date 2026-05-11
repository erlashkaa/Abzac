package ru.biblioteka.api.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentOutDto {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private Long topicId;
    private String topicTitle;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Long parentId;
    private String content;
    private Integer likes;
    private Integer dislikes;
    private Boolean likedByUser;
    private Boolean dislikedByUser;
    private LocalDateTime createdAt;
    private List<CommentOutDto> replies;
}
