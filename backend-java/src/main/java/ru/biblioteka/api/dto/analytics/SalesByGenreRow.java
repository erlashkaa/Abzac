package ru.biblioteka.api.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesByGenreRow {
    private String genre;
    private Integer salesCount;
    private BigDecimal revenue;
}

