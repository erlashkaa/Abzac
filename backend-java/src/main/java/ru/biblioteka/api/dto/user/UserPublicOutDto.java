package ru.biblioteka.api.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPublicOutDto {
    private Long id;
    private String username;
    private String avatar;
    private String banner;
    private String about;
    private String role;
    private LocalDateTime createdAt;
}
