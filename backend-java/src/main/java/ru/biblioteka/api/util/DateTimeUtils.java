package ru.biblioteka.api.util;

import java.time.LocalDateTime;
import java.time.ZoneId;

public class DateTimeUtils {

    public static LocalDateTime moscowNow() {
        return LocalDateTime.now(ZoneId.of("Europe/Moscow"));
    }
}
