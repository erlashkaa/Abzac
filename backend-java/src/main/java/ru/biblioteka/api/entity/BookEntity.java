package ru.biblioteka.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, length = 200)
    private String author;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 500)
    private String cover;

    @Column(columnDefinition = "text")
    private String genre;

    private Integer year;

    @Column(name = "is_free")
    private Boolean isFree;

    private Double rating;

    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @Column(name = "wholesale_price", precision = 12, scale = 2)
    private BigDecimal wholesalePrice;

    @Column(name = "retail_price", precision = 12, scale = 2)
    private BigDecimal retailPrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "sales_count")
    private Integer salesCount;

    @Column(columnDefinition = "text")
    private String content;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
