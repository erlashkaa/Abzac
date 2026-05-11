package ru.biblioteka.api.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ru.biblioteka.api.repository.UserRepository;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null) {
            String h = header.trim();
            if (h.regionMatches(true, 0, "Bearer ", 0, 7)) {
                String token = h.substring(7).trim();
                try {
                    Claims claims = tokenProvider.parseClaims(token);
                    String subject = claims.getSubject();
                    if (subject != null) {
                        Long userId = Long.valueOf(subject);
                        userRepository.findById(userId).ifPresentOrElse(
                                userEntity -> {
                                    AuthenticatedUser principal = new AuthenticatedUser(userEntity);
                                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                            principal,
                                            null,
                                            principal.getAuthorities()
                                    );
                                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                    SecurityContextHolder.getContext().setAuthentication(authentication);
                                },
                                () -> {
                                    SecurityContextHolder.clearContext();
                                    log.warn(
                                            "JWT подпись верна (sub={}), но пользователя с таким id нет в БД — "
                                                    + "скорее всего база пересоздана; нужен новый вход. Путь: {}",
                                            userId,
                                            request.getRequestURI());
                                }
                        );
                    } else {
                        SecurityContextHolder.clearContext();
                        log.warn("JWT без поля sub — игнорируем");
                    }
                } catch (Exception ex) {
                    // Не отвечаем 401 здесь: axios всегда шлёт старый Bearer, и тогда
                    // POST /api/auth/login|register не доходил бы до контроллера.
                    SecurityContextHolder.clearContext();
                    log.warn(
                            "JWT не принят (истёк, другой секрет или битый токен): {} — путь: {}",
                            ex.getMessage(),
                            request.getRequestURI());
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
