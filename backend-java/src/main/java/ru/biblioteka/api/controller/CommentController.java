package ru.biblioteka.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.biblioteka.api.dto.comment.CommentOutDto;
import ru.biblioteka.api.dto.common.ReactionCountsDto;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.security.SecurityUtils;
import ru.biblioteka.api.service.CommentService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/books/{bookId}/comments")
    public ResponseEntity<List<CommentOutDto>> getBookComments(@PathVariable Long bookId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(commentService.getBookComments(bookId, userId));
    }

    @PostMapping("/books/{bookId}/comments")
    public ResponseEntity<CommentOutDto> createComment(
            @PathVariable Long bookId,
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, Object> request) {
        String content = (String) request.get("content");
        Long parentId = request.get("parent_id") != null ? Long.valueOf(request.get("parent_id").toString()) : null;
        return ResponseEntity.ok(commentService.createComment(bookId, authUser.getId(), parentId, content));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        commentService.deleteComment(id, authUser.getId(), authUser.getUser().getRole());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/comments/{id}/react")
    public ResponseEntity<ReactionCountsDto> reactToComment(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(commentService.reactToComment(id, authUser.getId(), request.get("reaction_type")));
    }
}
