package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.biblioteka.api.dto.analytics.DeficitBookRow;
import ru.biblioteka.api.dto.analytics.FinanceAnalyticsResponse;
import ru.biblioteka.api.dto.analytics.SalesByGenreRow;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.PurchaseEntity;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.PurchaseRepository;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreAnalyticsService {

    private final PurchaseRepository purchaseRepository;
    private final BookRepository bookRepository;

    public FinanceAnalyticsResponse getFinanceAnalytics() {
        List<PurchaseEntity> purchases = purchaseRepository.findAll();

        BigDecimal totalRevenue = purchases.stream()
                .map(p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Упрощённо: чистая прибыль ~= выручка (себестоимость не ведём)
        BigDecimal netProfit = totalRevenue;

        Map<String, List<PurchaseEntity>> byGenre = new HashMap<>();
        Map<Long, BookEntity> booksById = bookRepository.findAll().stream()
                .collect(Collectors.toMap(BookEntity::getId, b -> b, (a, b) -> a));
        for (PurchaseEntity p : purchases) {
            BookEntity b = booksById.get(p.getBookId());
            String genre = (b != null && b.getGenre() != null && !b.getGenre().isBlank()) ? b.getGenre() : "Без жанра";
            byGenre.computeIfAbsent(genre, k -> new ArrayList<>()).add(p);
        }

        List<SalesByGenreRow> salesByGenre = byGenre.entrySet().stream()
                .map(e -> SalesByGenreRow.builder()
                        .genre(e.getKey())
                        .salesCount(e.getValue().size())
                        .revenue(e.getValue().stream()
                                .map(p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .sorted(Comparator.comparing(SalesByGenreRow::getRevenue).reversed())
                .collect(Collectors.toList());

        // Дефицит: платные книги с низким остатком
        List<DeficitBookRow> deficit = booksById.values().stream()
                .filter(b -> b.getRetailPrice() != null && b.getRetailPrice().compareTo(BigDecimal.ZERO) > 0)
                .filter(b -> b.getStockQuantity() != null && b.getStockQuantity() <= 3)
                .sorted(Comparator.comparing(BookEntity::getStockQuantity))
                .map(b -> DeficitBookRow.builder()
                        .bookId(b.getId())
                        .title(b.getTitle())
                        .stockQuantity(b.getStockQuantity() != null ? b.getStockQuantity() : 0)
                        .recommendedRestock(10)
                        .build())
                .limit(20)
                .collect(Collectors.toList());

        return FinanceAnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .netProfitEstimated(netProfit)
                .salesByGenre(salesByGenre)
                .deficitBooksForPublisher(deficit)
                .build();
    }
}

