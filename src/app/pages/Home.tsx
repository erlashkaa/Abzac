import React, { useMemo, useState, useEffect } from 'react';
import { BookCard } from '../components/BookCard';
import { ArrowRight, Sparkles, TrendingUp, Clock, Bookmark, Info, Zap, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksApi, type Book } from '../api/booksApi';
import { usersApi, type ReadingHistoryItem } from '../api/usersApi';
import { mergeWithDemoBooks } from '../demo/demoData';

const Section: React.FC<{ title: string; icon: React.ReactNode; books: Book[]; isLoading?: boolean; emptyText?: string }> = ({ title, icon, books, isLoading, emptyText }) => {
  const navigate = useNavigate();

  return (
    <section className="py-10">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl glass-effect-light border border-border-color/30 flex items-center justify-center text-accent-color shadow-soft">
            {icon}
          </span>
          <div className="leading-tight">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">{title}</h2>
            <p className="text-xs text-tertiary">Подборка для быстрого старта</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/catalog')}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl glass-effect-light border border-border-color/30 text-sm font-bold text-text-secondary hover:text-text-primary smooth-transition ring-soft"
          type="button"
        >
          Смотреть всё
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-[26px] border border-border-color/35 bg-bg-secondary/20 overflow-hidden shadow-soft">
              <div className="p-3">
                <div className="aspect-[2/3] rounded-[22px] skeleton" />
              </div>
              <div className="px-4 pb-4 space-y-2">
                <div className="h-4 w-4/5 rounded-full skeleton" />
                <div className="h-3 w-2/3 rounded-full skeleton" />
                <div className="h-3 w-1/2 rounded-full skeleton mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-[28px] glass-effect border border-border-color/35 p-10 text-center shadow-soft">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-accent-color/10 border border-accent-color/20 flex items-center justify-center text-accent-color mb-4">
            <Info className="w-5 h-5" />
          </div>
          <div className="font-black text-lg">Пока пусто</div>
          <p className="text-sm text-secondary mt-1">{emptyText || 'Не удалось загрузить подборку. Попробуйте позже.'}</p>
          <button onClick={() => navigate('/catalog')} className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft" type="button">
            Перейти в каталог <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
};

export const Home: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isBooksLoading, setIsBooksLoading] = useState(true);
  const [lastRead, setLastRead] = useState<ReadingHistoryItem | null>(null);
  const [lastReadBook, setLastReadBook] = useState<Book | null>(null);

  useEffect(() => {
    setIsBooksLoading(true);
    booksApi
      .getBooks({ per_page: 10, sort: 'popular' })
      .then((r) => setBooks(r.data?.books || []))
      .catch(() => setBooks(mergeWithDemoBooks([], { targetSize: 10 })))
      .finally(() => setIsBooksLoading(false));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      usersApi.getReadingHistory().then(r => {
        if (r.data.length > 0) {
          setLastRead(r.data[0]);
          booksApi.getBook(r.data[0].book_id).then(br => setLastReadBook(br.data)).catch(() => {});
        }
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const popular = useMemo(() => books || [], [books]);
  const newest = useMemo(() => (books || []).slice(0, 6), [books]);
  const picks = useMemo(() => (books || []).slice(2, 10), [books]);

  return (
    <div className="container mx-auto px-4 md:px-6">
      {/* New Hero */}
      <section className="pt-10 md:pt-14 pb-10 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full glass-effect-light border border-border-color/30 text-xs font-black tracking-wide text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent-color shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" />
              Premium dark reading UI
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight leading-[1.02]">
              Читайте быстрее.
              <span className="block gradient-text">Думайте глубже.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-secondary leading-relaxed max-w-2xl">
              «Абзац» — платформа чтения с чистой визуальной иерархией: каталог, прогресс, избранное и обсуждения — без шума.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/catalog" className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft">
                Открыть каталог <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass-effect-light border border-border-color/30 text-text-secondary hover:text-text-primary smooth-transition ring-soft">
                <Info className="w-5 h-5 text-accent-color" />
                Как это работает
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: <Zap className="w-5 h-5" />, title: 'Быстро', desc: 'Лёгкий интерфейс и плавные переходы' },
                { icon: <Layers className="w-5 h-5" />, title: 'Структурно', desc: 'Каталог, профиль и форум — без хаоса' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: 'Надёжно', desc: 'Авторизация и прогресс чтения' },
              ].map((f) => (
                <div key={f.title} className="rounded-[22px] glass-effect-light border border-border-color/30 p-4 shadow-soft">
                  <div className="w-10 h-10 rounded-2xl bg-accent-color/10 border border-accent-color/15 flex items-center justify-center text-accent-color">
                    {f.icon}
                  </div>
                  <div className="mt-3 font-black">{f.title}</div>
                  <div className="mt-1 text-xs text-tertiary leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-5">
            <div className="rounded-[30px] border border-border-color/35 glass-effect shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border-color/30 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">Сегодня в фокусе</div>
                  <div className="text-xs text-tertiary">Книги, которые читают чаще всего</div>
                </div>
                <span className="kbd">top</span>
              </div>
              <div className="p-5 space-y-4">
                {isBooksLoading ? (
                  <>
                    <div className="h-14 rounded-2xl skeleton" />
                    <div className="h-14 rounded-2xl skeleton" />
                    <div className="h-14 rounded-2xl skeleton" />
                  </>
                ) : (
                  (popular || []).slice(0, 3).map((b) => (
                    <Link key={b.id} to={`/book/${b.id}`} className="block rounded-2xl bg-bg-secondary/30 border border-border-color/30 hover:bg-bg-secondary/45 smooth-transition p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-accent-color/10 border border-accent-color/15 flex items-center justify-center text-accent-color font-black">
                          {String(b.title || '?').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black line-clamp-1">{b.title}</div>
                          <div className="text-xs text-tertiary line-clamp-1">{b.author}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 ml-auto text-tertiary" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Continue Reading */}
      {isLoggedIn && lastRead && lastReadBook && (
        <section className="pb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] glass-effect border border-border-color/35 p-6 md:p-8 shadow-soft overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-accent-color/10 border border-accent-color/20 text-accent-color text-xs font-black uppercase tracking-wide">
                  <Clock className="w-4 h-4" />
                  Продолжить чтение
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-snug">{lastReadBook.title}</h2>
                <p className="text-sm md:text-base text-secondary max-w-2xl">
                  Вы остановились здесь в прошлый раз. Продолжайте с того же места — прогресс сохранён.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Link to={`/reader?bookId=${lastReadBook.id}`} className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft">
                    Читать дальше <ArrowRight className="w-5 h-5" />
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-tertiary">
                      <span className="font-bold">Прогресс</span>
                      <span className="font-black text-accent-color">{lastRead.progress_percent}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-bg-tertiary/40 border border-border-color/30 overflow-hidden">
                      <div className="h-full bg-[linear-gradient(90deg,var(--accent-color),var(--accent-secondary),var(--accent-cyan))]" style={{ width: `${lastRead.progress_percent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4">
                <div className="relative mx-auto w-44 md:w-full max-w-[220px] aspect-[2/3] rounded-[26px] overflow-hidden border border-border-color/35 bg-bg-tertiary/30 shadow-soft">
                  <img src={lastReadBook.cover} alt={lastReadBook.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      <Section title="Популярные книги" icon={<TrendingUp className="w-6 h-6" />} books={popular} isLoading={isBooksLoading} />
      <Section title="Новинки" icon={<Sparkles className="w-6 h-6" />} books={newest} isLoading={isBooksLoading} emptyText="Новинки появятся, как только каталог обновится." />
      <Section title="Подборка редакции" icon={<Bookmark className="w-6 h-6" />} books={picks} isLoading={isBooksLoading} emptyText="Собираем персональные рекомендации." />
    </div>
  );
};