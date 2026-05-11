package ru.biblioteka.api.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import ru.biblioteka.api.dto.comment.CommentOutDto;
import ru.biblioteka.api.dto.forum.ForumTopicOutDto;
import ru.biblioteka.api.dto.review.ReviewOutDto;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPublicProfileResponseDto {
    private UserPublicOutDto user;
    private List<ReviewOutDto> reviews;
    private List<CommentOutDto> comments;
    private List<ForumTopicOutDto> topics;
}
