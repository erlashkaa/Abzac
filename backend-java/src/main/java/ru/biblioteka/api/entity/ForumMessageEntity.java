package ru.biblioteka.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "forum_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(columnDefinition = "text", nullable = false)
    private String content;

    private Integer likes;
    private Integer dislikes;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
