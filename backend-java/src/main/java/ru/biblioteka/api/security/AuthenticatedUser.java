package ru.biblioteka.api.security;

import lombok.Getter;
import ru.biblioteka.api.entity.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Locale;

@Getter
public class AuthenticatedUser implements UserDetails {
    private final UserEntity user;
    private final Long id;
    private final String username;
    private final String email;
    private final String role;
    private final boolean active;

    public AuthenticatedUser(UserEntity user) {
        this.user = user;
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole() != null ? user.getRole().trim() : "reader";
        this.active = user.getIsActive();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String raw = user.getRole() != null ? user.getRole().trim() : "reader";
        String normalized = raw.toLowerCase(Locale.ROOT);
        return List.of(new SimpleGrantedAuthority("ROLE_" + normalized));
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return active;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return active;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
