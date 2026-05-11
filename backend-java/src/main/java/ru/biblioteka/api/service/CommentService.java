package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.biblioteka.api.dto.comment.CommentOutDto;
import ru.biblioteka.api.dto.common.ReactionCountsDto;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.CommentEntity;
import ru.biblioteka.api.entity.CommentReactionEntity;
import ru.biblioteka.api.entity.UserEntity;
import ru.biblioteka.api.mapper.DtoMapper;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.CommentReactionRepository;
import ru.biblioteka.api.repository.CommentRepository;
import ru.biblioteka.api.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentReactionRepository reactionRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public List<CommentOutDto> getBookComments(Long bookId, Long currentUserId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        List<CommentEntity> allComments = commentRepository.findByBookIdOrderByCreatedAtDesc(bookId);
        
        // Filter top-level comments and map to DTO with replies
        return allComments.stream()
                .filter(c -> c.getParentId() == null)
                .map(comment -> mapToDtoWithReplies(comment, book.getTitle(), currentUserId, allComments))
                .collect(Collectors.toList());
    }

    private CommentOutDto mapToDtoWithReplies(CommentEntity comment, String bookTitle, Long currentUserId, List<CommentEntity> allComments) {
        UserEntity user = userRepository.findById(comment.getUserId()).orElse(null);
        String userName = user != null ? user.getUsername() : "Deleted User";
        String userAvatar = user != null ? user.getAvatar() : null;

        Boolean liked = currentUserId != null && reactionRepository.existsByCommentIdAndUserIdAndReactionType(comment.getId(), currentUserId, "like");
        Boolean disliked = currentUserId != null && reactionRepository.existsByCommentIdAndUserIdAndReactionType(comment.getId(), currentUserId, "dislike");

        List<CommentOutDto> replies = allComments.stream()
                .filter(c -> comment.getId().equals(c.getParentId()))
                .map(reply -> mapToDtoWithReplies(reply, bookTitle, currentUserId, allComments))
                .collect(Collectors.toList());

        return DtoMapper.toCommentOutDto(comment, bookTitle, userName, userAvatar, liked, disliked, replies);
    }

    @Transactional
    public CommentOutDto createComment(Long bookId, Long userId, Long parentId, String content) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommentEntity comment = CommentEntity.builder()
                .bookId(bookId)
                .userId(userId)
                .parentId(parentId)
                .content(content)
                .likes(0)
                .dislikes(0)
                .createdAt(LocalDateTime.now())
                .build();

        comment = commentRepository.save(comment);

        return DtoMapper.toCommentOutDto(comment, book.getTitle(), user.getUsername(), user.getAvatar(), false, false, List.of());
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId, String role) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId) && !"admin".equals(role)) {
            throw new RuntimeException("Unauthorized");
        }

        commentRepository.delete(comment);
    }

    @Transactional
    public ReactionCountsDto reactToComment(Long commentId, Long userId, String reactionType) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        reactionRepository.findByCommentIdAndUserId(commentId, userId).ifPresent(reactionRepository::delete);

        if (reactionType != null && (reactionType.equals("like") || reactionType.equals("dislike"))) {
            CommentReactionEntity reaction = CommentReactionEntity.builder()
                    .commentId(commentId)
                    .userId(userId)
                    .reactionType(reactionType)
                    .build();
            reactionRepository.save(reaction);
        }

        comment.setLikes((int) reactionRepository.countByCommentIdAndReactionType(commentId, "like"));
        comment.setDislikes((int) reactionRepository.countByCommentIdAndReactionType(commentId, "dislike"));
        commentRepository.save(comment);

        return ReactionCountsDto.builder()
                .likes(comment.getLikes())
                .dislikes(comment.getDislikes())
                .build();
    }
}
