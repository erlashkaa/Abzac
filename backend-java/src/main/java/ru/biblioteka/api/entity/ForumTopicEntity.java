package ru.biblioteka.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "forum_topics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumTopicEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "is_pinned")
    private Boolean isPinned;

    @Column(name = "is_locked")
    private Boolean isLocked;

    @Column(length = 100)
    private String tag;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_activity")
    private LocalDateTime lastActivity;
}
