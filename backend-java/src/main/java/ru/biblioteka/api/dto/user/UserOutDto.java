package ru.biblioteka.api.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserOutDto {
    private Long id;
    private String username;
    private String email;
    private String avatar;
    private String banner;
    private String about;
    private String role;
    private Boolean isActive;
    private Integer violationCount;
    private BigDecimal balance;
    private LocalDateTime createdAt;
}
