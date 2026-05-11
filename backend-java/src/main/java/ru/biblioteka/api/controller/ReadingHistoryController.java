package ru.biblioteka.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.biblioteka.api.dto.history.ReadingHistoryOutDto;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.service.ReadingHistoryService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reading-history")
@RequiredArgsConstructor
public class ReadingHistoryController {

    private final ReadingHistoryService historyService;

    @GetMapping
    public ResponseEntity<List<ReadingHistoryOutDto>> getHistory(@AuthenticationPrincipal AuthenticatedUser authUser) {
        return ResponseEntity.ok(historyService.getUserHistory(authUser.getId()));
    }

    @PutMapping("/{bookId}")
    public ResponseEntity<Void> updateProgress(
            @PathVariable Long bookId,
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, Integer> request) {
        historyService.updateProgress(authUser.getId(), bookId, request.get("progress_percent"), request.get("current_page"));
        return ResponseEntity.ok().build();
    }
}
