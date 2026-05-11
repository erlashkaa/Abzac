package ru.biblioteka.api.dto.book;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookCreateRequestDto {
    private String title;
    private String author;
    private String description;
    private String cover;
    private String genre;
    private Integer year;
    private Boolean isFree;
    private BigDecimal wholesalePrice;
    private BigDecimal retailPrice;
    private Integer stockQuantity;
    private List<String> tags;
    private String content;
}
