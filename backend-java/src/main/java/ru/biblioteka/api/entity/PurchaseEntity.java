package ru.biblioteka.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "purchases",
        uniqueConstraints = @UniqueConstraint(name = "uk_purchases_user_book", columnNames = {"user_id", "book_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    /** Кому зачислены деньги (админ/владелец магазина). */
    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    /** Цена на момент покупки. */
    @Column(name = "amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    /**
     * Совместимость со старой схемой БД: в таблице есть обязательный столбец price_at_purchase.
     * Храним то же значение, что и {@link #amount}.
     */
    @Column(name = "price_at_purchase", nullable = false, precision = 14, scale = 2)
    private BigDecimal priceAtPurchase;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Совместимость со старой схемой БД: обязательный столбец purchase_date.
     * Храним то же значение, что и {@link #createdAt}.
     */
    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate;
}

