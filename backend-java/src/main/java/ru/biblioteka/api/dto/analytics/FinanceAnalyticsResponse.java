package ru.biblioteka.api.dto.analytics;

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
public class FinanceAnalyticsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal netProfitEstimated;
    private List<SalesByGenreRow> salesByGenre;
    private List<DeficitBookRow> deficitBooksForPublisher;
}

