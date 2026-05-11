package ru.biblioteka.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.service.UserBalanceService;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/user/balance")
@RequiredArgsConstructor
public class UserBalanceController {

    private final UserBalanceService userBalanceService;

    @PostMapping("/topup")
    public ResponseEntity<Map<String, BigDecimal>> topUp(
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, Object> body
    ) {
        if (authUser == null) {
            return ResponseEntity.status(401).build();
        }
        Object amountRaw = body.get("amount");
        BigDecimal amount;
        try {
            amount = new BigDecimal(String.valueOf(amountRaw));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        BigDecimal newBalance = userBalanceService.topUp(authUser.getId(), amount);
        return ResponseEntity.ok(Map.of("balance", newBalance));
    }
}

