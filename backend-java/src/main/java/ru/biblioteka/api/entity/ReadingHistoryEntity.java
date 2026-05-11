package ru.biblioteka.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(name = "progress_percent")
    private Integer progressPercent;

    @Column(name = "current_page")
    private Integer currentPage;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;
}
