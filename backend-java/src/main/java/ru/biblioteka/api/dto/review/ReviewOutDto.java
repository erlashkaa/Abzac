package ru.biblioteka.api.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewOutDto {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String text;
    private Integer likes;
    private Integer dislikes;
    private Boolean likedByUser;
    private Boolean dislikedByUser;
    private LocalDateTime createdAt;
}
