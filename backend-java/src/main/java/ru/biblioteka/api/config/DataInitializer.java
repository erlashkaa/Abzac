package ru.biblioteka.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ru.biblioteka.api.entity.*;
import ru.biblioteka.api.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BookTagRepository tagRepository;
    private final ForumTopicRepository topicRepository;
    private final ForumMessageRepository messageRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewReactionRepository reviewReactionRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReadingHistoryRepository readingHistoryRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            UserEntity admin = UserEntity.builder()
                    .username("admin")
                    .email("admin@example.com")
                    .hashedPassword(passwordEncoder.encode("admin123"))
                    .role("admin")
                    .isActive(true)
                    .violationCount(0)
                    .about("Администратор платформы «Абзац»")
                    .createdAt(LocalDateTime.now())
                    .build();
            admin = userRepository.save(admin);

            createBook("The Great Gatsby", "F. Scott Fitzgerald", "A story of wealth and love.", "Classic", 1925, 0.0, 0);
            createBook("1984", "George Orwell", "Dystopian future.", "Sci-Fi", 1949, 0.0, 0);
            createBook("The Witcher", "Andrzej Sapkowski", "Fantasy adventures.", "Fantasy", 1993, 0.0, 0);
            createBook("Crime and Punishment", "Fyodor Dostoevsky", "Psychological drama.", "Classic", 1866, 0.0, 0);
            createBook("The Hobbit", "J.R.R. Tolkien", "Adventure in Middle-earth.", "Fantasy", 1937, 0.0, 0);

            seedForumBasics(admin.getId());
        }

        ensureStoreBooksExist();

        migrateLegacyForumTags();
        seedCommunityReadersAndContent();
        ensureSeedAdminHasAdminRole();
        ensureReadersHaveBookEngagement();
    }

    private void ensureStoreBooksExist() {
        addStoreBookIfMissing("Clean Code", "Robert C. Martin", "A Handbook of Agile Software Craftsmanship.", "Programming", 2008, 350.00, 99);
        addStoreBookIfMissing("Design Patterns", "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides", "Elements of Reusable Object-Oriented Software.", "Programming", 1994, 500.00, 50);
        addStoreBookIfMissing("Effective Java", "Joshua Bloch", "Best practices for the Java platform.", "Programming", 2018, 420.00, 80);
        addStoreBookIfMissing("Refactoring", "Martin Fowler", "Improving the Design of Existing Code.", "Programming", 2018, 480.00, 60);
        addStoreBookIfMissing("The Pragmatic Programmer", "Andrew Hunt, David Thomas", "Your Journey to Mastery.", "Programming", 1999, 390.00, 70);
        addStoreBookIfMissing("Капитанская дочка", "А. С. Пушкин", "Повесть о чести и долге.", "Классика", 1836, 120.00, 200);
        addStoreBookIfMissing("Мастер и Маргарита", "М. А. Булгаков", "Роман о любви, свободе и правде.", "Классика", 1967, 250.00, 150);
        addStoreBookIfMissing("451° по Фаренгейту", "Рэй Брэдбери", "Dystopian novel about censorship.", "Sci-Fi", 1953, 220.00, 120);
        addStoreBookIfMissing("Пикник на обочине", "Аркадий и Борис Стругацкие", "Фантастика о зоне и сталкерах.", "Sci-Fi", 1972, 210.00, 110);
    }

    private void addStoreBookIfMissing(String title,
                                       String author,
                                       String desc,
                                       String genre,
                                       int year,
                                       double retailPrice,
                                       int stockQuantity) {
        boolean exists = bookRepository.findAll().stream().anyMatch(b -> b.getTitle() != null && title.equalsIgnoreCase(b.getTitle().trim()));
        if (exists) {
            return;
        }

        BookEntity book = BookEntity.builder()
                .title(title)
                .author(author)
                .description(desc)
                .genre(genre)
                .year(year)
                .rating(0.0)
                .reviewsCount(0)
                .isFree(false)
                .wholesalePrice(BigDecimal.ZERO)
                .retailPrice(BigDecimal.valueOf(retailPrice))
                .stockQuantity(stockQuantity)
                .salesCount(0)
                .cover("https://picsum.photos/seed/" + title.replace(" ", "") + "/400/600")
                .content("")
                .createdAt(LocalDateTime.now())
                .build();
        book = bookRepository.save(book);

        BookTagEntity tag = new BookTagEntity();
        tag.setBookId(book.getId());
        tag.setTag(genre.toLowerCase());
        tagRepository.save(tag);
    }

    /**
     * Для всех активных пользователей кроме admin: отзывы с оценкой, комментарии к книге,
     * избранное и запись истории чтения (идемпотентно, без дублей отзыва/коммента на ту же книгу).
     */
    private void ensureReadersHaveBookEngagement() {
        List<BookEntity> books = bookRepository.findAll().stream()
                .sorted(Comparator.comparing(BookEntity::getId))
                .collect(Collectors.toList());
        if (books.isEmpty()) {
            return;
        }

        List<UserEntity> readers = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .filter(u -> {
                    String r = u.getRole();
                    if (r == null) {
                        return true;
                    }
                    return !"admin".equalsIgnoreCase(r.trim());
                })
                .sorted(Comparator.comparing(UserEntity::getId))
                .collect(Collectors.toList());
        if (readers.isEmpty()) {
            return;
        }

        String[] reviewTexts = new String[] {
                "Сильная книга, затягивает с первых страниц. Рекомендую.",
                "Читал(а) неспешно — много мыслей оставляет после себя.",
                "Не идеально, но атмосфера и идея того стоят.",
                "Одна из лучших в жанре, что попадались за последнее время.",
                "Местами затянуто, зато финал отличный.",
                "Перечитаю ещё: есть на что обратить внимание.",
                "Зашло не сразу, но ко второй трети уже не оторваться.",
                "Хороший язык, живые диалоги.",
        };
        String[] commentTexts = new String[] {
                "Кто-нибудь читал в оригинале — как перевод?",
                "Очень понравился этот фрагмент в середине, эмоции на пике.",
                "Думаю взять в избранное и дочитать на выходных.",
                "Жду обсуждения сюжетного поворота без спойлеров :)",
                "Поставил(а) высокую оценку за идею, реализация на четвёрку.",
                "Классика жанра или нет — но читается легко.",
        };

        int n = books.size();
        for (UserEntity user : readers) {
            long uid = user.getId();
            for (int k = 0; k < 3; k++) {
                BookEntity book = books.get((int) ((uid + k * 2L) % n + n) % n);
                Long bid = book.getId();

                if (!reviewRepository.existsByBookIdAndUserId(bid, uid)) {
                    int rating = 4 + (int) ((uid + bid) % 2);
                    String text = reviewTexts[(int) ((uid + bid + k) % reviewTexts.length)];
                    ReviewEntity rev = saveReview(bid, uid, rating, text);
                    recalcReviewCounts(rev);
                }

                if (!commentRepository.existsByBookIdAndUserId(bid, uid)) {
                    saveBookComment(bid, uid, commentTexts[(int) ((uid * 3 + bid + k) % commentTexts.length)]);
                }

                addFavorite(uid, bid);

                int bookIdx = (int) ((uid + k + 1) % n);
                BookEntity readBook = books.get(bookIdx);
                ensureReadingHistory(uid, readBook.getId(), 12 + (int) ((uid + readBook.getId()) % 73), 3 + k * 5);
            }
        }

        for (BookEntity b : books) {
            updateBookStats(b.getId());
        }
    }

    private void saveBookComment(Long bookId, Long userId, String text) {
        commentRepository.save(CommentEntity.builder()
                .bookId(bookId)
                .userId(userId)
                .parentId(null)
                .content(text)
                .likes(0)
                .dislikes(0)
                .createdAt(LocalDateTime.now().minusHours(6 + (int) (userId % 48)))
                .build());
    }

    private void ensureReadingHistory(Long userId, Long bookId, int progressPercent, int currentPage) {
        if (readingHistoryRepository.findByUserIdAndBookId(userId, bookId).isPresent()) {
            return;
        }
        readingHistoryRepository.save(ReadingHistoryEntity.builder()
                .userId(userId)
                .bookId(bookId)
                .progressPercent(progressPercent)
                .currentPage(currentPage)
                .lastReadAt(LocalDateTime.now().minusDays(1 + (int) (userId % 5)))
                .build());
    }

    /** Если в БД у сидера сменили роль — снова даём admin, иначе PUT /api/books даёт 403 при живом JWT */
    private void ensureSeedAdminHasAdminRole() {
        userRepository.findByEmail("admin@example.com").ifPresent(u -> {
            String role = u.getRole();
            if (role == null || !"admin".equalsIgnoreCase(role.trim())) {
                u.setRole("admin");
                userRepository.save(u);
            }
        });
    }

    private void migrateLegacyForumTags() {
        for (ForumTopicEntity t : topicRepository.findAll()) {
            String tag = t.getTag();
            boolean changed = false;
            if ("general".equals(tag)) {
                t.setTag("Обсуждение");
                changed = true;
            } else if ("books".equals(tag)) {
                t.setTag("Поиск книг");
                changed = true;
            } else if ("support".equals(tag)) {
                t.setTag("Обсуждение");
                changed = true;
            }
            if (changed) {
                topicRepository.save(t);
            }
        }
    }

    private void seedForumBasics(Long adminId) {
        ForumTopicEntity t1 = saveTopic("Добро пожаловать на форум", adminId, "Обсуждение");
        ForumTopicEntity t2 = saveTopic("Что почитать из фэнтези в этом месяце?", adminId, "Поиск книг");
        ForumTopicEntity t3 = saveTopic("Как сохранять прогресс чтения?", adminId, "Обсуждение");
        postMessage(t1.getId(), adminId, "Коротко о правилах: уважаем друг друга, без спама. Приятного общения!");
        postMessage(t2.getId(), adminId, "Поделитесь находками — что вас зацепило последним?");
        postMessage(t3.getId(), adminId, "Если что-то не работает, опишите шаги — поможем разобраться.");
    }

    private ForumTopicEntity saveTopic(String title, Long authorId, String tag) {
        ForumTopicEntity topic = ForumTopicEntity.builder()
                .title(title)
                .authorId(authorId)
                .tag(tag)
                .isPinned(false)
                .isLocked(false)
                .createdAt(LocalDateTime.now())
                .lastActivity(LocalDateTime.now())
                .build();
        return topicRepository.save(topic);
    }

    private void postMessage(Long topicId, Long authorId, String content) {
        ForumMessageEntity m = ForumMessageEntity.builder()
                .topicId(topicId)
                .authorId(authorId)
                .content(content)
                .likes(0)
                .dislikes(0)
                .parentId(null)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(m);
    }

    private void seedCommunityReadersAndContent() {
        if (userRepository.existsByUsername("maria_reader")) {
            return;
        }

        UserEntity maria = userRepository.save(UserEntity.builder()
                .username("maria_reader")
                .email("maria.reader@example.com")
                .hashedPassword(passwordEncoder.encode("Maria2026!"))
                .role("reader")
                .about("Люблю научную фантастику и детективы.")
                .isActive(true)
                .violationCount(0)
                .createdAt(LocalDateTime.now().minusDays(40))
                .build());

        UserEntity alex = userRepository.save(UserEntity.builder()
                .username("alex_reader")
                .email("alex.reader@example.com")
                .hashedPassword(passwordEncoder.encode("Alex2026!"))
                .role("reader")
                .about("Читаю по вечерам, много фэнтези.")
                .isActive(true)
                .violationCount(0)
                .createdAt(LocalDateTime.now().minusDays(35))
                .build());

        UserEntity ivan = userRepository.save(UserEntity.builder()
                .username("ivan_reader")
                .email("ivan.reader@example.com")
                .hashedPassword(passwordEncoder.encode("Ivan2026!"))
                .role("reader")
                .about("Классика и немного нон-фикшн.")
                .isActive(true)
                .violationCount(0)
                .createdAt(LocalDateTime.now().minusDays(28))
                .build());

        UserEntity elena = userRepository.save(UserEntity.builder()
                .username("elena_reader")
                .email("elena.reader@example.com")
                .hashedPassword(passwordEncoder.encode("Elena2026!"))
                .role("reader")
                .about("Ищу книги с сильным финалом.")
                .isActive(true)
                .violationCount(0)
                .createdAt(LocalDateTime.now().minusDays(20))
                .build());

        List<BookEntity> books = bookRepository.findAll();
        if (books.isEmpty()) {
            return;
        }

        BookEntity gatsby = books.stream().filter(b -> b.getTitle().contains("Gatsby")).findFirst().orElse(books.get(0));
        BookEntity n1984 = books.stream().filter(b -> "1984".equals(b.getTitle())).findFirst().orElse(books.get(1 % books.size()));
        BookEntity witcher = books.stream().filter(b -> b.getTitle().contains("Witcher")).findFirst().orElse(books.get(2 % books.size()));
        BookEntity crime = books.stream().filter(b -> b.getTitle().contains("Crime")).findFirst().orElse(books.get(3 % books.size()));

        ReviewEntity r1 = saveReview(gatsby.getId(), maria.getId(), 5, "Атмосфера безупречна — читается за один вечер, но остаётся с тобой надолго.");
        ReviewEntity r2 = saveReview(gatsby.getId(), alex.getId(), 4, "Сильные образы, но местами хотелось чуть больше динамики во второй половине.");
        ReviewEntity r3 = saveReview(n1984.getId(), ivan.getId(), 5, "Тревожно актуально. Обязательно к прочтению.");
        ReviewEntity r4 = saveReview(witcher.getId(), elena.getId(), 5, "Мир проработан отлично, герои живые.");
        ReviewEntity r5 = saveReview(crime.getId(), maria.getId(), 4, "Тяжёлая, но очень честная книга.");

        saveReviewReaction(r2.getId(), ivan.getId(), "like");
        saveReviewReaction(r2.getId(), elena.getId(), "like");
        saveReviewReaction(r1.getId(), alex.getId(), "like");
        saveReviewReaction(r3.getId(), maria.getId(), "like");
        saveReviewReaction(r4.getId(), alex.getId(), "dislike");

        recalcReviewCounts(r1);
        recalcReviewCounts(r2);
        recalcReviewCounts(r3);
        recalcReviewCounts(r4);
        recalcReviewCounts(r5);

        addFavorite(maria.getId(), gatsby.getId());
        addFavorite(maria.getId(), witcher.getId());
        addFavorite(alex.getId(), n1984.getId());
        addFavorite(ivan.getId(), crime.getId());
        addFavorite(elena.getId(), gatsby.getId());

        saveHistory(maria.getId(), gatsby.getId(), 42, 12);
        saveHistory(alex.getId(), witcher.getId(), 18, 4);
        saveHistory(ivan.getId(), n1984.getId(), 67, 20);
        saveHistory(elena.getId(), crime.getId(), 9, 2);

        updateBookStats(gatsby.getId());
        updateBookStats(n1984.getId());
        updateBookStats(witcher.getId());
        updateBookStats(crime.getId());

        List<ForumTopicEntity> topics = topicRepository.findAll();
        ForumTopicEntity discuss = topics.stream().filter(t -> "Обсуждение".equals(t.getTag())).findFirst().orElse(null);
        ForumTopicEntity bookSearch = topics.stream().filter(t -> "Поиск книг".equals(t.getTag())).findFirst().orElse(null);

        if (discuss != null) {
            postMessage(discuss.getId(), maria.getId(), "Только дочитала «1984» — как вам сравнение с «451 по Фаренгейту»?");
            ForumMessageEntity mAlex = messageRepository.save(ForumMessageEntity.builder()
                    .topicId(discuss.getId())
                    .authorId(alex.getId())
                    .content("Я бы сказал, у Оруэлла больше про контроль мысли, у Брэдбери — про культуру. Обе шикарные.")
                    .likes(0)
                    .dislikes(0)
                    .parentId(null)
                    .createdAt(LocalDateTime.now().minusHours(2))
                    .build());
            messageRepository.save(ForumMessageEntity.builder()
                    .topicId(discuss.getId())
                    .authorId(ivan.getId())
                    .content("Согласен, но у Оруэлла холоднее и реалистичнее ощущается мир.")
                    .likes(0)
                    .dislikes(0)
                    .parentId(mAlex.getId())
                    .createdAt(LocalDateTime.now().minusHours(1))
                    .build());
        }

        if (bookSearch != null) {
            postMessage(bookSearch.getId(), elena.getId(), "Ищу что-то в духе «Хоббита», но посовременнее — есть идеи?");
            postMessage(bookSearch.getId(), alex.getId(), "Попробуйте «Имя ветра» Патрика Ротфусса, если ещё не читали.");
        }

        ForumTopicEntity theories = saveTopic("Теории: чем закончится серия, если автор затянет сюжет?", maria.getId(), "Теории");
        postMessage(theories.getId(), ivan.getId(), "Иногда лучше короткая история, чем бесконечное растягивание. А вы как думаете?");
        postMessage(theories.getId(), elena.getId(), "Главное — не терять логику мира. Читатели это сразу чувствуют.");

        ForumTopicEntity spoilers = saveTopic("Спойлеры: разбор финала «Преступления и наказания»", alex.getId(), "Спойлеры");
        postMessage(spoilers.getId(), maria.getId(), "Финал для меня про искупление через действие, а не только через слова.");
    }

    private ReviewEntity saveReview(Long bookId, Long userId, int rating, String text) {
        ReviewEntity r = ReviewEntity.builder()
                .bookId(bookId)
                .userId(userId)
                .rating(rating)
                .text(text)
                .likes(0)
                .dislikes(0)
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();
        return reviewRepository.save(r);
    }

    private void saveReviewReaction(Long reviewId, Long userId, String type) {
        reviewReactionRepository.save(ReviewReactionEntity.builder()
                .reviewId(reviewId)
                .userId(userId)
                .reactionType(type)
                .build());
    }

    private void recalcReviewCounts(ReviewEntity review) {
        long likes = reviewReactionRepository.countByReviewIdAndReactionType(review.getId(), "like");
        long dislikes = reviewReactionRepository.countByReviewIdAndReactionType(review.getId(), "dislike");
        review.setLikes((int) likes);
        review.setDislikes((int) dislikes);
        reviewRepository.save(review);
    }

    private void addFavorite(Long userId, Long bookId) {
        if (!favoriteRepository.existsByUserIdAndBookId(userId, bookId)) {
            favoriteRepository.save(FavoriteEntity.builder()
                    .userId(userId)
                    .bookId(bookId)
                    .createdAt(LocalDateTime.now())
                    .build());
        }
    }

    private void saveHistory(Long userId, Long bookId, int pct, int page) {
        readingHistoryRepository.save(ReadingHistoryEntity.builder()
                .userId(userId)
                .bookId(bookId)
                .progressPercent(pct)
                .currentPage(page)
                .lastReadAt(LocalDateTime.now().minusDays(1))
                .build());
    }

    private void updateBookStats(Long bookId) {
        List<ReviewEntity> list = reviewRepository.findByBookId(bookId);
        BookEntity book = bookRepository.findById(bookId).orElse(null);
        if (book == null) {
            return;
        }
        book.setReviewsCount(list.size());
        if (list.isEmpty()) {
            book.setRating(0.0);
        } else {
            double avg = list.stream().mapToInt(ReviewEntity::getRating).average().orElse(0.0);
            book.setRating(avg);
        }
        bookRepository.save(book);
    }

    private void createBook(String title, String author, String desc, String genre, int year, double rating, int reviewsCount) {
        BookEntity book = BookEntity.builder()
                .title(title)
                .author(author)
                .description(desc)
                .genre(genre)
                .year(year)
                .rating(rating)
                .reviewsCount(reviewsCount)
                .isFree(true)
                .cover("https://picsum.photos/seed/" + title.replace(" ", "") + "/400/600")
                .content("This is the sample content for " + title + "...")
                .createdAt(LocalDateTime.now())
                .build();
        book = bookRepository.save(book);

        BookTagEntity tag = new BookTagEntity();
        tag.setBookId(book.getId());
        tag.setTag(genre.toLowerCase());
        tagRepository.save(tag);
    }
}
