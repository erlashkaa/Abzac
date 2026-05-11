package ru.biblioteka.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.biblioteka.api.dto.auth.AuthRequestDto;
import ru.biblioteka.api.dto.auth.LoginRequestDto;
import ru.biblioteka.api.dto.auth.TokenResponseDto;
import ru.biblioteka.api.dto.user.UserOutDto;
import ru.biblioteka.api.mapper.DtoMapper;
import ru.biblioteka.api.security.AuthenticatedUser;
import ru.biblioteka.api.service.AuthService;
import ru.biblioteka.api.service.UserService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<TokenResponseDto> register(@Valid @RequestBody AuthRequestDto request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserOutDto> getMe(@AuthenticationPrincipal AuthenticatedUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(DtoMapper.toUserOutDto(authUser.getUser()));
    }
}
