package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.biblioteka.api.dto.book.BookOutDto;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.PurchaseEntity;
import ru.biblioteka.api.entity.UserEntity;
import ru.biblioteka.api.entity.BookTagEntity;
import ru.biblioteka.api.mapper.DtoMapper;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.BookTagRepository;
import ru.biblioteka.api.repository.PurchaseRepository;
import ru.biblioteka.api.repository.UserRepository;
import ru.biblioteka.api.util.DateTimeUtils;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookPurchaseService {

    private final BookRepository bookRepository;
    private final BookTagRepository bookTagRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookOutDto purchase(Long userId, Long bookId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Книга не найдена"));

        if (Boolean.TRUE.equals(book.getIsFree())) {
            // Бесплатная книга: покупка не нужна, но для клиента отметим как доступную
            var tags = bookTagRepository.findByBookId(book.getId()).stream().map(BookTagEntity::getTag).collect(Collectors.toList());
            return DtoMapper.toBookOutDto(book, tags, true);
        }

        if (purchaseRepository.existsByUserIdAndBookId(userId, bookId)) {
            var tags = bookTagRepository.findByBookId(book.getId()).stream().map(BookTagEntity::getTag).collect(Collectors.toList());
            return DtoMapper.toBookOutDto(book, tags, true);
        }

        BigDecimal price = book.getRetailPrice() != null ? book.getRetailPrice() : BigDecimal.ZERO;
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "У книги не задана цена");
        }

        UserEntity buyer = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Несогласованность данных: пользователь из токена отсутствует в БД"));

        UserEntity seller = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "admin".equalsIgnoreCase(u.getRole().trim()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Администратор магазина не найден"));

        BigDecimal buyerBalance = buyer.getBalance() != null ? buyer.getBalance() : BigDecimal.ZERO;
        if (buyerBalance.compareTo(price) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Недостаточно средств на балансе");
        }

        buyer.setBalance(buyerBalance.subtract(price));
        userRepository.save(buyer);

        BigDecimal sellerBalance = seller.getBalance() != null ? seller.getBalance() : BigDecimal.ZERO;
        seller.setBalance(sellerBalance.add(price));
        userRepository.save(seller);

        var now = DateTimeUtils.moscowNow();

        purchaseRepository.save(PurchaseEntity.builder()
                .userId(userId)
                .bookId(bookId)
                .sellerId(seller.getId())
                .amount(price)
                .priceAtPurchase(price)
                .createdAt(now)
                .purchaseDate(now)
                .build());

        // статистика продаж/остатков
        book.setSalesCount((book.getSalesCount() != null ? book.getSalesCount() : 0) + 1);
        if (book.getStockQuantity() != null) {
            book.setStockQuantity(Math.max(0, book.getStockQuantity() - 1));
        }
        bookRepository.save(book);

        var tags = bookTagRepository.findByBookId(book.getId()).stream().map(BookTagEntity::getTag).collect(Collectors.toList());
        return DtoMapper.toBookOutDto(book, tags, true);
    }
}

