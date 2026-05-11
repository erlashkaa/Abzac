package ru.biblioteka.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false)
    private String username;

    @Column(length = 255, nullable = false, unique = true)
    private String email;

    @Column(name = "hashed_password", length = 255, nullable = false)
    private String hashedPassword;

    @Column(columnDefinition = "text")
    private String avatar;

    @Column(columnDefinition = "text")
    private String banner;

    @Builder.Default
    @Column(columnDefinition = "text", nullable = false)
    private String about = "";

    @Builder.Default
    @Column(length = 20, nullable = false)
    private String role = "reader";

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "violation_count", nullable = false)
    private Integer violationCount = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
