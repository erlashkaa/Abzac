import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Grid, List as ListIcon, ChevronDown, Loader2, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { BookCard } from '../components/BookCard';
import { booksApi, type Book } from '../api/booksApi';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { mergeWithDemoBooks } from '../demo/demoData';

// Default genres as fallback
const DEFAULT_GENRES = ['Все', 'Фантастика', 'Фэнтези', 'Проза', 'Детектив', 'Триллер', 'Образование', 'Психология'];

export const Catalog: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Все');
  const [showFilters, setShowFilters] = useState(false);
  const genres = ["Все", "Фантастика", "Фэнтези", "Детектив", "Романтика", "Триллер", "Ужасы", "Приключения", "Научпоп", "Проза", "Классика"];
  const [sortBy, setSortBy] = useState('popular');
  
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [availableGenres, setAvailableGenres] = useState<string[]>(DEFAULT_GENRES);
  const observerTarget = useRef(null);

  const fetchBooks = async (pageNum: number, append: boolean = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const resp = await booksApi.getBooks({
        search: search || undefined,
        genre: selectedGenre !== 'Все' ? selectedGenre : undefined,
        sort: sortBy,
        page: pageNum,
        per_page: 20,
      });
      if (append) {
        setBooks(prev => [...prev, ...resp.data.books]);
      } else {
        // Только книги с API — демо не подмешиваем (иначе «Тайны древнего кода» и т.п. при малой БД)
        setBooks(resp.data.books);
      }
      setTotal(resp.data.total);
      setHasMore(resp.data.books.length === 20);
    } catch {
      // silently fail
      if (pageNum === 1) {
        setBooks(mergeWithDemoBooks([], { targetSize: 20 }));
        setTotal(20);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchBooks(1, false);
  }, [search, selectedGenre, sortBy]);

  // Load available genres
  useEffect(() => {
    booksApi.getGenres().then(r => {
      if (r.data.length > 0) {
        setAvailableGenres(['Все', ...r.data]);
      }
    }).catch(() => {});
  }, []);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchBooks(nextPage, true);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, isLoading]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full glass-effect-light border border-border-color/30 text-xs font-black tracking-wide text-text-secondary">
              <Sparkles className="w-4 h-4 text-accent-color" />
              Каталог / поиск / фильтры
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">Каталог</h1>
            <p className="mt-2 text-sm text-secondary">Найдите книгу по названию, жанру или сортировке. Лента подгружается автоматически.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-2xl glass-effect-light border border-border-color/30 shadow-soft">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  "p-2.5 rounded-xl smooth-transition ring-soft",
                  viewMode === 'grid' ? "bg-accent-color/15 border border-accent-color/25 text-text-primary" : "text-text-secondary hover:text-text-primary"
                )}
                type="button"
                aria-label="Сетка"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  "p-2.5 rounded-xl smooth-transition ring-soft",
                  viewMode === 'list' ? "bg-accent-color/15 border border-accent-color/25 text-text-primary" : "text-text-secondary hover:text-text-primary"
                )}
                type="button"
                aria-label="Список"
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft"
              type="button"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Фильтры
            </button>
          </div>
        </div>

        {/* Search row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="text"
              placeholder="Поиск по названию, автору или жанру…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[22px] glass-effect-light border border-border-color/30 text-sm ring-soft"
            />
          </div>
          <div className="lg:col-span-4 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none px-4 py-4 rounded-[22px] glass-effect-light border border-border-color/30 text-sm ring-soft"
            >
              <option value="popular">По популярности</option>
              <option value="new">По новизне</option>
              <option value="rating">По рейтингу</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-secondary">
          <span className="kbd">Всего: {total || 0}</span>
          <span className="kbd">Жанр: {selectedGenre}</span>
          <span className="kbd">Режим: {viewMode === 'grid' ? 'grid' : 'list'}</span>
        </div>
      </div>

      {/* Grid */}
      {books.length === 0 && !isLoading ? (
        <div className="rounded-[32px] glass-effect border border-border-color/35 p-12 text-center shadow-soft">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-accent-color/10 border border-accent-color/20 flex items-center justify-center text-accent-color mb-4">
            <Filter className="w-5 h-5" />
          </div>
          <div className="text-xl font-black">Ничего не найдено</div>
          <p className="text-sm text-secondary mt-2 max-w-xl mx-auto">
            Попробуйте изменить запрос или сбросить жанр. Иногда помогает поиск по части названия или автора.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => setSearch('')} className="px-5 py-3 rounded-2xl glass-effect-light border border-border-color/30 font-black text-text-secondary hover:text-text-primary smooth-transition ring-soft" type="button">
              Очистить поиск
            </button>
            <button onClick={() => setSelectedGenre('Все')} className="px-5 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft" type="button">
              Сбросить жанр
            </button>
          </div>
        </div>
      ) : (
        <div className={clsx("grid gap-6 md:gap-8 mb-10", viewMode === 'grid' ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-1")}>
          {books.map((book) =>
            viewMode === 'grid' ? (
              <BookCard key={book.id} book={book} />
            ) : (
              <motion.article
                layout
                key={book.id}
                className="rounded-[28px] glass-effect border border-border-color/35 shadow-soft overflow-hidden"
              >
                <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  <div className="md:col-span-3">
                    <div className="aspect-[2/3] rounded-[22px] overflow-hidden border border-border-color/30 bg-bg-tertiary/30">
                      <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="md:col-span-9 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xl font-black tracking-tight">{book.title}</div>
                        <div className="text-sm text-secondary font-semibold">{book.author}</div>
                      </div>
                      <span className="kbd">{book.year}</span>
                    </div>

                    <p className="text-sm text-secondary/90 leading-relaxed line-clamp-3">{book.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {(book.genre || '').split(',').map((g) => g.trim()).filter(Boolean).slice(0, 6).map((label) => (
                        <span key={label} className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-accent-color/10 text-accent-color border border-accent-color/15">
                          {label}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                      <a href={`/book/${book.id}`} className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft">
                        Открыть
                      </a>
                      <a href={`/reader?bookId=${book.id}`} className="inline-flex items-center justify-center px-5 py-3 rounded-2xl glass-effect-light border border-border-color/30 font-black text-text-secondary hover:text-text-primary smooth-transition ring-soft">
                        Читать
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          )}
        </div>
      )}

      {/* Loader for infinite scroll */}
      <div ref={observerTarget} className="flex justify-center py-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-accent-color font-black">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Загрузка новых книг…</span>
          </div>
        )}
      </div>

      {/* Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <motion.aside
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              className="absolute right-3 top-3 bottom-3 w-[min(520px,calc(100vw-24px))] rounded-[30px] glass-effect border border-border-color/35 shadow-soft overflow-hidden"
            >
              <div className="p-5 border-b border-border-color/30 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Фильтры</div>
                  <div className="text-xs text-tertiary">Жанры и быстрый сброс</div>
                </div>
                <button onClick={() => setShowFilters(false)} className="p-2.5 rounded-2xl hover:bg-bg-secondary/40 text-text-secondary hover:text-text-primary smooth-transition ring-soft" type="button" aria-label="Закрыть">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                <div className="rounded-[22px] glass-effect-light border border-border-color/30 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-tertiary mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-accent-color" />
                    Жанры
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(availableGenres?.length ? availableGenres : genres).map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={clsx(
                          "px-3 py-2 rounded-full text-xs font-black transition-all border ring-soft",
                          selectedGenre === genre
                            ? "bg-accent-color text-white border-accent-color"
                            : "bg-bg-secondary/40 text-text-secondary border-border-color/35 hover:text-text-primary hover:border-accent-color/25"
                        )}
                        type="button"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { setSearch(''); setSelectedGenre('Все'); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass-effect-light border border-border-color/30 font-black text-text-secondary hover:text-text-primary smooth-transition ring-soft"
                    type="button"
                  >
                    Сбросить <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft"
                    type="button"
                  >
                    Готово <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
