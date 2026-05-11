package ru.biblioteka.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.biblioteka.api.entity.ReportEntity;

public interface ReportRepository extends JpaRepository<ReportEntity, Long> {
}
