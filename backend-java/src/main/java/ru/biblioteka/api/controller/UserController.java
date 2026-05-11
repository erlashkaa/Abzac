package ru.biblioteka.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.biblioteka.api.dto.comment.CommentOutDto;
import ru.biblioteka.api.dto.forum.ForumTopicOutDto;
import ru.biblioteka.api.dto.review.ReviewOutDto;
import ru.biblioteka.api.dto.user.UserOutDto;
import ru.biblioteka.api.dto.user.UserPublicProfileResponseDto;
import ru.biblioteka.api.dto.user.UserUpdateRequestDto;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserOutDto> getProfile(@AuthenticationPrincipal AuthenticatedUser authUser) {
        return ResponseEntity.ok(userService.getProfile(authUser.getId()));
    }

    @GetMapping("/me/reviews")
    public ResponseEntity<List<ReviewOutDto>> getMyReviews(@AuthenticationPrincipal AuthenticatedUser authUser) {
        return ResponseEntity.ok(userService.getMyReviews(authUser));
    }

    @GetMapping("/me/comments")
    public ResponseEntity<List<CommentOutDto>> getMyComments(@AuthenticationPrincipal AuthenticatedUser authUser) {
        return ResponseEntity.ok(userService.getMyComments(authUser));
    }

    @GetMapping("/me/topics")
    public ResponseEntity<List<ForumTopicOutDto>> getMyTopics(@AuthenticationPrincipal AuthenticatedUser authUser) {
        return ResponseEntity.ok(userService.getMyTopics(authUser));
    }

    @PutMapping("/me")
    public ResponseEntity<UserOutDto> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @Valid @RequestBody UserUpdateRequestDto request) {
        return ResponseEntity.ok(userService.updateProfile(authUser.getId(), request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal AuthenticatedUser authUser,
            @RequestBody Map<String, String> passwords) {
        String oldPw = passwords.containsKey("old_password")
                ? passwords.get("old_password")
                : passwords.get("current_password");
        userService.changePassword(authUser.getId(), oldPw, passwords.get("new_password"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserPublicProfileResponseDto> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getPublicProfile(id));
    }
}
