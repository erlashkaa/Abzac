package ru.biblioteka.api.dto.book;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookListOutDto {
    private List<BookOutDto> books;
    private Integer total;
    private Integer page;
    private Integer perPage;
}
