package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ru.biblioteka.api.dto.auth.AuthRequestDto;
import ru.biblioteka.api.dto.auth.LoginRequestDto;
import ru.biblioteka.api.dto.auth.TokenResponseDto;
import ru.biblioteka.api.entity.UserEntity;
import ru.biblioteka.api.mapper.DtoMapper;
import ru.biblioteka.api.repository.UserRepository;
import ru.biblioteka.api.security.JwtTokenProvider;
import ru.biblioteka.api.util.DateTimeUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public TokenResponseDto register(AuthRequestDto request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email уже зарегистрирован");
        });

        UserEntity user = UserEntity.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .hashedPassword(passwordEncoder.encode(request.getPassword()))
                .createdAt(DateTimeUtils.moscowNow())
                .build();
        userRepository.save(user);
        String token = jwtTokenProvider.createToken(user.getId());
        return TokenResponseDto.builder().accessToken(token).tokenType("bearer").build();
    }

    public TokenResponseDto login(LoginRequestDto request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверный email или пароль"));
        if (!passwordEncoder.matches(request.getPassword(), user.getHashedPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверный email или пароль");
        }
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Пользователь заблокирован");
        }
        String token = jwtTokenProvider.createToken(user.getId());
        return TokenResponseDto.builder().accessToken(token).tokenType("bearer").build();
    }
}
