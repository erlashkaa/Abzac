package ru.biblioteka.api.dto.finance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySalesOutDto {
    private String genre;
    private BigDecimal revenue;
    private Long unitsSold;
}
