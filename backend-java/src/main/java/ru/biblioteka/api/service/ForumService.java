package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.biblioteka.api.dto.common.ReactionCountsDto;
import ru.biblioteka.api.dto.forum.ForumMessageOutDto;
import ru.biblioteka.api.dto.forum.ForumTopicDetailDto;
import ru.biblioteka.api.dto.forum.ForumTopicOutDto;
import ru.biblioteka.api.entity.ForumMessageEntity;
import ru.biblioteka.api.entity.ForumMessageReactionEntity;
import ru.biblioteka.api.entity.ForumTopicEntity;
import ru.biblioteka.api.entity.UserEntity;
import ru.biblioteka.api.mapper.DtoMapper;
import ru.biblioteka.api.repository.ForumMessageReactionRepository;
import ru.biblioteka.api.repository.ForumMessageRepository;
import ru.biblioteka.api.repository.ForumTopicRepository;
import ru.biblioteka.api.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumTopicRepository topicRepository;
    private final ForumMessageRepository messageRepository;
    private final ForumMessageReactionRepository reactionRepository;
    private final UserRepository userRepository;

    public Page<ForumTopicOutDto> getTopics(int page, int size, String search, String tag) {
        String searchTrimmed = search != null && !search.isBlank() ? search.trim() : null;
        String tagParam = tag != null && !tag.isBlank() ? tag.trim() : null;
        return topicRepository.searchTopics(tagParam, searchTrimmed, PageRequest.of(page, size))
                .map(topic -> {
                    UserEntity author = userRepository.findById(topic.getAuthorId()).orElse(null);
                    String authorName = author != null ? author.getUsername() : "Deleted User";
                    int repliesCount = messageRepository.findByTopicIdOrderByCreatedAtAsc(topic.getId()).size();
                    return DtoMapper.toForumTopicOutDto(topic, authorName, repliesCount);
                });
    }

    public ForumTopicOutDto getTopic(Long id) {
        ForumTopicEntity topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        UserEntity author = userRepository.findById(topic.getAuthorId()).orElse(null);
        String authorName = author != null ? author.getUsername() : "Deleted User";
        int repliesCount = messageRepository.findByTopicIdOrderByCreatedAtAsc(topic.getId()).size();
        return DtoMapper.toForumTopicOutDto(topic, authorName, repliesCount);
    }

    public ForumTopicDetailDto getTopicDetail(Long id, Long currentUserId) {
        ForumTopicOutDto topic = getTopic(id);
        List<ForumMessageOutDto> messages = messageRepository.findByTopicIdOrderByCreatedAtAsc(id).stream()
                .map(m -> toMessageOutDto(m, currentUserId))
                .collect(Collectors.toList());
        return ForumTopicDetailDto.builder()
                .topic(topic)
                .messages(messages)
                .build();
    }

    private ForumMessageOutDto toMessageOutDto(ForumMessageEntity message, Long currentUserId) {
        UserEntity author = userRepository.findById(message.getAuthorId()).orElse(null);
        String authorName = author != null ? author.getUsername() : "Deleted User";
        String authorAvatar = author != null ? author.getAvatar() : null;
        String authorRole = author != null ? author.getRole() : "reader";

        boolean liked = currentUserId != null
                && reactionRepository.existsByMessageIdAndUserIdAndReactionType(message.getId(), currentUserId, "like");
        boolean disliked = currentUserId != null
                && reactionRepository.existsByMessageIdAndUserIdAndReactionType(message.getId(), currentUserId, "dislike");

        return ForumMessageOutDto.builder()
                .id(message.getId())
                .topicId(message.getTopicId())
                .authorId(message.getAuthorId())
                .authorName(authorName)
                .authorAvatar(authorAvatar)
                .authorRole(authorRole)
                .content(message.getContent())
                .likes(message.getLikes() != null ? message.getLikes() : 0)
                .dislikes(message.getDislikes() != null ? message.getDislikes() : 0)
                .likedByUser(liked)
                .dislikedByUser(disliked)
                .parentId(message.getParentId())
                .createdAt(message.getCreatedAt())
                .build();
    }

    @Transactional
    public ForumTopicOutDto createTopic(Long authorId, String title, String tag, String content) {
        UserEntity author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumTopicEntity topic = ForumTopicEntity.builder()
                .title(title)
                .authorId(authorId)
                .tag(tag)
                .isPinned(false)
                .isLocked(false)
                .createdAt(LocalDateTime.now())
                .lastActivity(LocalDateTime.now())
                .build();

        topic = topicRepository.save(topic);

        if (content != null && !content.isBlank()) {
            ForumMessageEntity message = ForumMessageEntity.builder()
                    .topicId(topic.getId())
                    .authorId(authorId)
                    .content(content.trim())
                    .parentId(null)
                    .likes(0)
                    .dislikes(0)
                    .createdAt(LocalDateTime.now())
                    .build();
            messageRepository.save(message);
        }

        int repliesCount = messageRepository.findByTopicIdOrderByCreatedAtAsc(topic.getId()).size();
        return DtoMapper.toForumTopicOutDto(topic, author.getUsername(), repliesCount);
    }

    @Transactional
    public void deleteTopic(Long id, String role) {
        if (!"admin".equals(role)) {
            throw new RuntimeException("Unauthorized");
        }
        List<ForumMessageEntity> msgs = messageRepository.findByTopicIdOrderByCreatedAtAsc(id);
        messageRepository.deleteAll(msgs);
        topicRepository.deleteById(id);
    }

    @Transactional
    public boolean togglePin(Long id, String role) {
        if (!"admin".equals(role)) {
            throw new RuntimeException("Unauthorized");
        }
        ForumTopicEntity topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        topic.setIsPinned(!topic.getIsPinned());
        topicRepository.save(topic);
        return topic.getIsPinned();
    }

    public List<ForumMessageEntity> getTopicMessages(Long topicId) {
        return messageRepository.findByTopicIdOrderByCreatedAtAsc(topicId);
    }

    @Transactional
    public ForumMessageOutDto createMessage(Long topicId, Long authorId, String content, Long parentId) {
        ForumTopicEntity topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        ForumMessageEntity message = ForumMessageEntity.builder()
                .topicId(topicId)
                .authorId(authorId)
                .content(content)
                .parentId(parentId)
                .likes(0)
                .dislikes(0)
                .createdAt(LocalDateTime.now())
                .build();

        message = messageRepository.save(message);

        topic.setLastActivity(LocalDateTime.now());
        topicRepository.save(topic);

        return toMessageOutDto(message, authorId);
    }

    @Transactional
    public void deleteMessage(Long id, Long userId, String role) {
        ForumMessageEntity message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getAuthorId().equals(userId) && !"admin".equals(role)) {
            throw new RuntimeException("Unauthorized");
        }

        messageRepository.delete(message);
    }

    @Transactional
    public ReactionCountsDto reactToMessage(Long messageId, Long userId, String reactionType) {
        ForumMessageEntity message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        reactionRepository.findByMessageIdAndUserId(messageId, userId).ifPresent(reactionRepository::delete);

        if (reactionType != null && (reactionType.equals("like") || reactionType.equals("dislike"))) {
            ForumMessageReactionEntity reaction = ForumMessageReactionEntity.builder()
                    .messageId(messageId)
                    .userId(userId)
                    .reactionType(reactionType)
                    .build();
            reactionRepository.save(reaction);
        }

        message.setLikes((int) reactionRepository.countByMessageIdAndReactionType(messageId, "like"));
        message.setDislikes((int) reactionRepository.countByMessageIdAndReactionType(messageId, "dislike"));
        messageRepository.save(message);

        return ReactionCountsDto.builder()
                .likes(message.getLikes())
                .dislikes(message.getDislikes())
                .build();
    }
}
