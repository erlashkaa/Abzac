package ru.biblioteka.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.biblioteka.api.dto.report.ReportOutDto;
import ru.biblioteka.api.dto.auth.AuthRequestDto;
import ru.biblioteka.api.dto.user.UserOutDto;
import ru.biblioteka.api.entity.BookEntity;
import ru.biblioteka.api.entity.UserEntity;
import ru.biblioteka.api.mapper.DtoMapper;
import ru.biblioteka.api.repository.BookRepository;
import ru.biblioteka.api.repository.ForumTopicRepository;
import ru.biblioteka.api.repository.ReportRepository;
import ru.biblioteka.api.repository.UserRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ForumTopicRepository topicRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("users_count", userRepository.count());
        stats.put("books_count", bookRepository.count());
        stats.put("topics_count", topicRepository.count());
        stats.put("reports_count", reportRepository.count());
        
        // Additional stats can be added here
        return stats;
    }

    public List<UserOutDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(DtoMapper::toUserOutDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserOutDto createUser(AuthRequestDto request) {
        UserEntity user = UserEntity.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .hashedPassword(passwordEncoder.encode(request.getPassword()))
                .role("reader")
                .isActive(true)
                .violationCount(0)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        return DtoMapper.toUserOutDto(userRepository.save(user));
    }

    @Transactional
    public void blockUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void unblockUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
    }

    public List<ReportOutDto> getReports() {
        return reportRepository.findAll().stream()
                .map(report -> {
                    UserEntity reporter = userRepository.findById(report.getReporterId()).orElse(null);
                    return ReportOutDto.builder()
                            .id(report.getId())
                            .reporterId(report.getReporterId())
                            .reporterName(reporter != null ? reporter.getUsername() : "Unknown")
                            .targetType(report.getTargetType())
                            .targetId(report.getTargetId())
                            .reason(report.getReason())
                            .status(report.getStatus())
                            .createdAt(report.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
