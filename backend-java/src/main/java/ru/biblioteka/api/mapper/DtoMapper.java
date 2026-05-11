package ru.biblioteka.api.mapper;

import ru.biblioteka.api.dto.book.BookOutDto;
import ru.biblioteka.api.dto.comment.CommentOutDto;
import ru.biblioteka.api.dto.forum.ForumTopicOutDto;
import ru.biblioteka.api.dto.review.ReviewOutDto;
import ru.biblioteka.api.dto.user.UserOutDto;
import ru.biblioteka.api.dto.user.UserPublicOutDto;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.CommentEntity;
import ru.biblioteka.api.entity.ForumTopicEntity;
import ru.biblioteka.api.entity.ReviewEntity;
import ru.biblioteka.api.entity.UserEntity;

import java.util.List;

public class DtoMapper {

    public static BookOutDto toBookOutDto(BookEntity book, List<String> tags) {
        return toBookOutDto(book, tags, null);
    }

    public static BookOutDto toBookOutDto(BookEntity book, List<String> tags, Boolean purchased) {
        return BookOutDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .description(book.getDescription())
                .cover(book.getCover())
                .genre(book.getGenre())
                .year(book.getYear())
                .isFree(book.getIsFree())
                .rating(book.getRating())
                .reviewsCount(book.getReviewsCount())
                .wholesalePrice(book.getWholesalePrice())
                .retailPrice(book.getRetailPrice())
                .stockQuantity(book.getStockQuantity())
                .salesCount(book.getSalesCount())
                .purchased(purchased)
                .tags(tags)
                .content(book.getContent())
                .createdAt(book.getCreatedAt())
                .build();
    }

    public static ReviewOutDto toReviewOutDto(ReviewEntity review, String bookTitle, String userName, String userAvatar, Boolean likedByUser, Boolean dislikedByUser) {
        return ReviewOutDto.builder()
                .id(review.getId())
                .bookId(review.getBookId())
                .bookTitle(bookTitle)
                .userId(review.getUserId())
                .userName(userName)
                .userAvatar(userAvatar)
                .rating(review.getRating())
                .text(review.getText())
                .likes(review.getLikes())
                .dislikes(review.getDislikes())
                .likedByUser(likedByUser != null ? likedByUser : false)
                .dislikedByUser(dislikedByUser != null ? dislikedByUser : false)
                .createdAt(review.getCreatedAt())
                .build();
    }

    public static CommentOutDto toCommentOutDto(CommentEntity comment, String bookTitle, String userName, String userAvatar, Boolean likedByUser, Boolean dislikedByUser, List<CommentOutDto> replies) {
        return CommentOutDto.builder()
                .id(comment.getId())
                .bookId(comment.getBookId())
                .bookTitle(bookTitle)
                .userId(comment.getUserId())
                .userName(userName)
                .userAvatar(userAvatar)
                .parentId(comment.getParentId())
                .content(comment.getContent())
                .likes(comment.getLikes())
                .dislikes(comment.getDislikes())
                .likedByUser(likedByUser != null ? likedByUser : false)
                .dislikedByUser(dislikedByUser != null ? dislikedByUser : false)
                .createdAt(comment.getCreatedAt())
                .replies(replies)
                .build();
    }

    public static ForumTopicOutDto toForumTopicOutDto(ForumTopicEntity topic, String authorName, Integer repliesCount) {
        return ForumTopicOutDto.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .authorId(topic.getAuthorId())
                .authorName(authorName)
                .isPinned(topic.getIsPinned())
                .isLocked(topic.getIsLocked())
                .tag(topic.getTag())
                .repliesCount(repliesCount)
                .lastActivity(topic.getLastActivity())
                .createdAt(topic.getCreatedAt())
                .build();
    }

    public static UserOutDto toUserOutDto(UserEntity user) {
        return UserOutDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .banner(user.getBanner())
                .about(user.getAbout())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .violationCount(user.getViolationCount())
                .balance(user.getBalance())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static UserPublicOutDto toUserPublicOutDto(UserEntity user) {
        return UserPublicOutDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .banner(user.getBanner())
                .about(user.getAbout())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
