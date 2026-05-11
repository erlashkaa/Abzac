package ru.biblioteka.api.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.biblioteka.api.entity.UserEntity;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM UserEntity u WHERE lower(u.username) LIKE lower(concat('%', :search, '%')) OR lower(u.email) LIKE lower(concat('%', :search, '%'))")
    Page<UserEntity> search(@Param("search") String search, Pageable pageable);
}
