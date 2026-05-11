package ru.biblioteka.api.dto.forum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumTopicDetailDto {
    private ForumTopicOutDto topic;
    private List<ForumMessageOutDto> messages;
}
