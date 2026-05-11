package ru.biblioteka.api.dto.book;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookOutDto {
    private Long id;
    private String title;
    private String author;
    private String description;
    private String cover;
    private String genre;
    private Integer year;
    private Boolean isFree;
    private Double rating;
    private Integer reviewsCount;
    private BigDecimal wholesalePrice;
    private BigDecimal retailPrice;
    private Integer stockQuantity;
    private Integer salesCount;
    /** null — неизвестно (гость), true/false для авторизованного */
    private Boolean purchased;
    private List<String> tags;
    private String content;
    private LocalDateTime createdAt;
}
