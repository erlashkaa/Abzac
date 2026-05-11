package ru.biblioteka.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.biblioteka.api.dto.common.ReactionCountsDto;
import ru.biblioteka.api.dto.forum.ForumMessageOutDto;
import ru.biblioteka.api.dto.forum.ForumTopicDetailDto;
import ru.biblioteka.api.dto.forum.ForumTopicOutDto;
import ru.biblioteka.api.dto.forum.PinStateDto;
import ru.biblioteka.api.entity.ForumMessageEntity;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.security.SecurityUtils;
import ru.biblioteka.api.service.ForumService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @GetMapping("/topics")
    public ResponseEntity<Page<ForumTopicOutDto>> getTopics(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag) {
        return ResponseEntity.ok(forumService.getTopics(page, size, search, tag));
    }

    @GetMapping("/topics/{id}")
    public ResponseEntity<ForumTopicDetailDto> getTopic(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(forumService.getTopicDetail(id, userId));
    }

    @PostMapping("/topics")
    public ResponseEntity<ForumTopicOutDto> createTopic(
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, String> request) {
        String content = request.get("content");
        return ResponseEntity.ok(forumService.createTopic(
                authUser.getId(),
                request.get("title"),
                request.get("tag"),
                content));
    }

    @DeleteMapping("/topics/{id}")
    public ResponseEntity<Void> deleteTopic(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        forumService.deleteTopic(id, authUser.getUser().getRole());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/topics/{id}/pin")
    public ResponseEntity<PinStateDto> togglePin(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        boolean pinned = forumService.togglePin(id, authUser.getUser().getRole());
        return ResponseEntity.ok(PinStateDto.builder().isPinned(pinned).build());
    }

    @GetMapping("/topics/{id}/messages")
    public ResponseEntity<List<ForumMessageEntity>> getTopicMessages(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getTopicMessages(id));
    }

    @PostMapping("/topics/{id}/messages")
    public ResponseEntity<ForumMessageOutDto> createMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, Object> request) {
        String content = (String) request.get("content");
        Long parentId = request.get("parent_id") != null ? Long.valueOf(request.get("parent_id").toString()) : null;
        return ResponseEntity.ok(forumService.createMessage(id, authUser.getId(), content, parentId));
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser authUser) {
        forumService.deleteMessage(id, authUser.getId(), authUser.getUser().getRole());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/messages/{id}/react")
    public ResponseEntity<ReactionCountsDto> reactToMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(forumService.reactToMessage(id, authUser.getId(), request.get("reaction_type")));
    }
}
