package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ru.biblioteka.api.dto.comment.CommentOutDto;
import ru.biblioteka.api.dto.forum.ForumTopicOutDto;
import ru.biblioteka.api.dto.review.ReviewOutDto;
import ru.biblioteka.api.dto.user.UserOutDto;
import ru.biblioteka.api.dto.user.UserPublicOutDto;
import ru.biblioteka.api.dto.user.UserPublicProfileResponseDto;
import ru.biblioteka.api.dto.user.UserUpdateRequestDto;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.CommentEntity;
import ru.biblioteka.api.entity.ForumMessageEntity;
import ru.biblioteka.api.entity.ForumTopicEntity;
import ru.biblioteka.api.entity.ReviewEntity;
import ru.biblioteka.api.entity.UserEntity;
import ru.biblioteka.api.mapper.DtoMapper;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.CommentRepository;
import ru.biblioteka.api.repository.ForumMessageRepository;
import ru.biblioteka.api.repository.ForumTopicRepository;
import ru.biblioteka.api.repository.ReviewRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.biblioteka.api.repository.UserRepository;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.util.DateTimeUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final CommentRepository commentRepository;
    private final ForumTopicRepository forumTopicRepository;
    private final ForumMessageRepository forumMessageRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity getActiveUser(AuthenticatedUser principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Необходима авторизация");
        }
        UserEntity user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Пользователь не найден"));
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Пользователь заблокирован");
        }
        return user;
    }

    public UserOutDto getMe(AuthenticatedUser principal) {
        UserEntity user = getActiveUser(principal);
        return DtoMapper.toUserOutDto(user);
    }

    public UserOutDto getProfile(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));
        return DtoMapper.toUserOutDto(user);
    }

    public UserOutDto updateProfile(Long userId, UserUpdateRequestDto request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));
        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            userRepository.findByEmail(request.getEmail())
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email уже используется");
                    });
            user.setEmail(request.getEmail());
        }
        if (request.getAbout() != null) {
            user.setAbout(request.getAbout());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getBanner() != null) {
            user.setBanner(request.getBanner());
        }
        userRepository.save(user);
        return DtoMapper.toUserOutDto(user);
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));
        
        if (!passwordEncoder.matches(oldPassword, user.getHashedPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Неверный старый пароль");
        }
        
        user.setHashedPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<ReviewOutDto> getMyReviews(AuthenticatedUser principal) {
        UserEntity user = getActiveUser(principal);
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(review -> {
                    BookEntity book = bookRepository.findById(review.getBookId()).orElse(null);
                    return DtoMapper.toReviewOutDto(review,
                            book != null ? book.getTitle() : "",
                            user.getUsername(),
                            user.getAvatar(),
                            null,
                            null);
                })
                .collect(Collectors.toList());
    }

    public List<CommentOutDto> getMyComments(AuthenticatedUser principal) {
        UserEntity user = getActiveUser(principal);
        List<CommentOutDto> result = new ArrayList<>();
        List<CommentEntity> comments = commentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (CommentEntity comment : comments) {
            BookEntity book = bookRepository.findById(comment.getBookId()).orElse(null);
            result.add(DtoMapper.toCommentOutDto(comment,
                    book != null ? book.getTitle() : "",
                    user.getUsername(),
                    user.getAvatar(),
                    null,
                    null,
                    new ArrayList<>()));
        }
        List<ForumMessageEntity> messages = forumMessageRepository.findByAuthorId(user.getId());
        for (ForumMessageEntity message : messages) {
            ForumTopicEntity topic = forumTopicRepository.findById(message.getTopicId()).orElse(null);
            CommentOutDto dto = CommentOutDto.builder()
                    .id(message.getId())
                    .bookId(0L)
                    .topicId(message.getTopicId())
                    .topicTitle(topic != null ? topic.getTitle() : "")
                    .userId(message.getAuthorId())
                    .userName(user.getUsername())
                    .userAvatar(user.getAvatar())
                    .content(message.getContent())
                    .likes(message.getLikes())
                    .dislikes(message.getDislikes())
                    .createdAt(message.getCreatedAt())
                    .replies(new ArrayList<>())
                    .build();
            result.add(dto);
        }
        result.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return result;
    }

    public List<ForumTopicOutDto> getMyTopics(AuthenticatedUser principal) {
        UserEntity user = getActiveUser(principal);
        return forumTopicRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(topic -> {
                    Integer replies = forumMessageRepository.findByTopicIdOrderByCreatedAtAsc(topic.getId()).size();
                    return DtoMapper.toForumTopicOutDto(topic, user.getUsername(), replies);
                })
                .collect(Collectors.toList());
    }

    public UserPublicProfileResponseDto getPublicProfile(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));

        List<ReviewOutDto> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(review -> {
                    BookEntity book = bookRepository.findById(review.getBookId()).orElse(null);
                    return DtoMapper.toReviewOutDto(review,
                            book != null ? book.getTitle() : "",
                            user.getUsername(),
                            user.getAvatar(),
                            null,
                            null);
                })
                .collect(Collectors.toList());

        List<CommentOutDto> commentsOut = new ArrayList<>();
        for (CommentEntity comment : commentRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            BookEntity book = bookRepository.findById(comment.getBookId()).orElse(null);
            commentsOut.add(DtoMapper.toCommentOutDto(comment,
                    book != null ? book.getTitle() : "",
                    user.getUsername(),
                    user.getAvatar(),
                    null,
                    null,
                    new ArrayList<>()));
        }
        for (ForumMessageEntity message : forumMessageRepository.findByAuthorId(userId)) {
            ForumTopicEntity topic = forumTopicRepository.findById(message.getTopicId()).orElse(null);
            commentsOut.add(CommentOutDto.builder()
                    .id(message.getId())
                    .bookId(0L)
                    .topicId(message.getTopicId())
                    .topicTitle(topic != null ? topic.getTitle() : "")
                    .userId(message.getAuthorId())
                    .userName(user.getUsername())
                    .userAvatar(user.getAvatar())
                    .content(message.getContent())
                    .likes(message.getLikes())
                    .dislikes(message.getDislikes())
                    .createdAt(message.getCreatedAt())
                    .replies(new ArrayList<>())
                    .build());
        }
        commentsOut.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        List<ForumTopicOutDto> topics = forumTopicRepository.findByAuthorIdOrderByCreatedAtDesc(userId).stream()
                .map(topic -> {
                    Integer replies = forumMessageRepository.findByTopicIdOrderByCreatedAtAsc(topic.getId()).size();
                    return DtoMapper.toForumTopicOutDto(topic, user.getUsername(), replies);
                })
                .collect(Collectors.toList());

        return UserPublicProfileResponseDto.builder()
                .user(DtoMapper.toUserPublicOutDto(user))
                .reviews(reviews)
                .comments(commentsOut)
                .topics(topics)
                .build();
    }
}
