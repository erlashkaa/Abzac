package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.biblioteka.api.entity.UserEntity;
import ru.biblioteka.api.repository.UserRepository;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class UserBalanceService {

    private final UserRepository userRepository;

    @Transactional
    public BigDecimal topUp(Long userId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Сумма должна быть больше 0");
        }
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));
        BigDecimal current = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        user.setBalance(current.add(amount));
        userRepository.save(user);
        return user.getBalance();
    }
}

