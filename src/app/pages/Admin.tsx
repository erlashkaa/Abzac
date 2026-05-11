import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, Users, Settings, Plus, Trash2, Edit3, Lock, Unlock, Search, X, Save, Shield, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { AVATAR_PLACEHOLDER } from '../constants';
import { useAuth } from '../context/AuthContext';
import { adminApi, type StatsResponse, type FinanceAnalyticsResponse, type ReportItem } from '../api/adminApi';
import { booksApi, type Book, type BookCreateData } from '../api/booksApi';
import type { UserProfile } from '../api/authApi';

const TARGET_TYPE_LABELS: Record<string, string> = {
  comment: 'Комментарий',
  review: 'Отзыв',
  forum_topic: 'Тема форума',
  forum_message: 'Сообщение форума',
};

function countCyrillicLetters(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.codePointAt(i)!;
    if ((c >= 0x0410 && c <= 0x044f) || c === 0x0401 || c === 0x0451) n++;
    if (c > 0xffff) i++;
  }
  return n;
}

/** .txt в Windows часто в CP1251; читаем UTF-8 строго, иначе или при «обмане» — windows-1251 */
async function readPlainTextBookFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let utf8 = '';
  let utf8StrictOk = true;
  try {
    utf8 = new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    utf8StrictOk = false;
  }
  const cp1251 = new TextDecoder('windows-1251').decode(buf);
  if (!utf8StrictOk) return cp1251;
  if (countCyrillicLetters(cp1251) > countCyrillicLetters(utf8) + 20) return cp1251;
  return utf8;
}

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [finance, setFinance] = useState<FinanceAnalyticsResponse | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  // Book modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState<BookCreateData>({ 
    title: '', 
    author: '', 
    description: '', 
    cover: '', 
    genre: '', 
    year: 2024, 
    is_free: false, 
    tags: [],
    content: '',
    retail_price: 0,
    stock_quantity: 0,
  });
  const genres = ["Фантастика", "Фэнтези", "Детектив", "Романтика", "Триллер", "Ужасы", "Приключения", "Научпоп", "Проза", "Классика"];

  // User create modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const [searchBooks, setSearchBooks] = useState('');
  const [searchUsers, setSearchUsers] = useState('');

  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

  const txtInputRef = useRef<HTMLInputElement>(null);
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [txtImportState, setTxtImportState] = useState<'idle' | 'reading' | 'done' | 'error'>('idle');

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).catch(() => {});
    adminApi.getFinanceAnalytics().then(r => setFinance(r.data)).catch(() => {});
    booksApi.getBooks({ per_page: 100 }).then(r => setBooks(r.data.books)).catch(() => {});
    adminApi.getUsers().then(r => setUsers(r.data)).catch(() => {});
    adminApi.getReports().then(r => setReports(r.data)).catch(() => {});
    booksApi.getGenres().then(r => setAvailableGenres(r.data)).catch(() => {});
  }, []);

  const handleDeleteBook = async (bookId: number) => {
    try {
      await booksApi.deleteBook(bookId);
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch {}
  };

  const handleSaveBook = async () => {
    if (!bookForm.title?.trim() || !bookForm.author?.trim()) {
      toast.error('Укажите название и автора книги');
      return;
    }
    setIsSavingBook(true);
    try {
      const { content, ...meta } = bookForm;
      if (editingBook) {
        const resp = await booksApi.updateBook(editingBook.id, meta);
        await booksApi.updateBookContent(editingBook.id, content ?? '');
        setBooks(prev =>
          prev.map(b => (b.id === editingBook.id ? { ...resp.data, content: content ?? '' } : b)),
        );
        toast.success('Книга сохранена');
      } else {
        const resp = await booksApi.createBook({ ...meta, content: '' });
        await booksApi.updateBookContent(resp.data.id, content ?? '');
        setBooks(prev => [{ ...resp.data, content: content ?? '' }, ...prev]);
        toast.success('Книга добавлена');
      }
      setShowBookModal(false);
      setEditingBook(null);
      setBookForm({ title: '', author: '', description: '', cover: '', genre: '', year: 2024, is_free: false, tags: [], content: '', retail_price: 0, stock_quantity: 0 });
      setTxtImportState('idle');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { detail?: unknown; message?: string } }; message?: string };
      const detail = ax.response?.data?.detail;
      const msg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: { msg?: string }) => d.msg || '').filter(Boolean).join('; ')
            : ax.response?.data?.message || ax.message || 'Не удалось сохранить книгу';
      toast.error(msg);
    } finally {
      setIsSavingBook(false);
    }
  };

  const handleOpenEditBook = async (book: Book) => {
    setTxtImportState('idle');
    setEditingBook(book);
    try {
      const resp = await booksApi.getBook(book.id);
      const fullBook = resp.data;
      setBookForm({
        title: fullBook.title,
        author: fullBook.author,
        description: fullBook.description,
        cover: fullBook.cover,
        genre: fullBook.genre,
        year: fullBook.year,
        is_free: fullBook.is_free,
        tags: fullBook.tags,
        content: fullBook.content,
        retail_price: fullBook.retail_price ? Number(fullBook.retail_price) : 0,
        stock_quantity: fullBook.stock_quantity ?? 0,
      });
    } catch {
      setBookForm({
        title: book.title,
        author: book.author,
        description: book.description,
        cover: book.cover,
        genre: book.genre,
        year: book.year,
        is_free: book.is_free,
        tags: book.tags,
        content: book.content,
        retail_price: book.retail_price ? Number(book.retail_price) : 0,
        stock_quantity: book.stock_quantity ?? 0,
      });
    }
    setShowBookModal(true);
  };

  const handleBlockUser = async (userId: number) => {
    try {
      await adminApi.blockUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: false } : u));
    } catch {}
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      await adminApi.unblockUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: true } : u));
    } catch {}
  };

  const handleCreateUser = async () => {
    try {
      const resp = await adminApi.createUser({ username: newUserName, email: newUserEmail, password: newUserPassword });
      setUsers(prev => [resp.data, ...prev]);
      setShowUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    } catch {}
  };

  const handleResolveReport = async (reportId: number) => {
    try {
      await adminApi.resolveReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch {}
  };

  const handleDismissReport = async (reportId: number) => {
    try {
      await adminApi.dismissReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch {}
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchBooks.toLowerCase()) ||
    b.author.toLowerCase().includes(searchBooks.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const tabs = [
    { key: 'stats', label: 'Статистика', icon: BarChart3 },
    { key: 'library', label: 'Каталог', icon: BookOpen },
    { key: 'users', label: 'Пользователи', icon: Users },
    { key: 'moderation', label: 'Модерация', icon: Shield, badge: reports.length },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-64 shrink-0 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all",
                activeTab === tab.key ? "bg-accent text-white shadow-lg shadow-accent/20" : "hover:bg-secondary"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {'badge' in tab && tab.badge !== undefined && tab.badge > 0 && (
                <span className={clsx("ml-auto text-xs font-bold px-2 py-0.5 rounded-full", activeTab === tab.key ? "bg-white/20" : "bg-rose-500 text-white")}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Книги', value: stats.total_books, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Пользователи', value: stats.total_users, color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'Отзывы и комменты', value: stats.total_comments, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  { label: 'Книг читается', value: stats.total_readings, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map(stat => (
                  <div key={stat.label} className="bg-primary border border-base rounded-2xl p-6">
                    <p className={clsx("text-4xl font-black", stat.color)}>{stat.value}</p>
                    <p className="text-xs font-bold text-secondary uppercase mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>
              {finance && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-primary border border-base rounded-2xl p-6">
                    <p className="text-4xl font-black text-emerald-500">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(finance.total_revenue))}</p>
                    <p className="text-xs font-bold text-secondary uppercase mt-2">Выручка</p>
                  </div>
                  <div className="bg-primary border border-base rounded-2xl p-6">
                    <p className="text-4xl font-black text-fuchsia-500">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(finance.net_profit_estimated))}</p>
                    <p className="text-xs font-bold text-secondary uppercase mt-2">Прибыль</p>
                  </div>
                  <div className="bg-primary border border-base rounded-2xl p-6">
                    <p className="text-4xl font-black text-sky-500">{finance.sales_by_genre.length}</p>
                    <p className="text-xs font-bold text-secondary uppercase mt-2">Жанры продаж</p>
                  </div>
                  <div className="bg-primary border border-base rounded-2xl p-6">
                    <p className="text-4xl font-black text-rose-500">{finance.deficit_books_for_publisher.length}</p>
                    <p className="text-xs font-bold text-secondary uppercase mt-2">Дефицит</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input type="text" value={searchBooks} onChange={(e) => setSearchBooks(e.target.value)} placeholder="Поиск книг..." className="w-full pl-12 pr-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <button onClick={() => { setEditingBook(null); setTxtImportState('idle'); setBookForm({ title: '', author: '', description: '', cover: '', genre: '', year: 2024, is_free: false, tags: [], content: '', retail_price: 0, stock_quantity: 0 }); setShowBookModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold shadow-lg">
                  <Plus className="w-5 h-5" /> Добавить книгу
                </button>
              </div>
              <div className="space-y-3">
                {filteredBooks.map(book => (
                  <div key={book.id} className="flex items-center justify-between p-4 bg-primary border border-base rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                        <img src={book.cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold">{book.title}</p>
                        <p className="text-sm text-secondary">{book.author} • {book.genre} • {book.year}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEditBook(book)} className="p-2 rounded-lg hover:bg-secondary text-accent"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteBook(book.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input type="text" value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)} placeholder="Поиск пользователей..." className="w-full pl-12 pr-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <button onClick={() => setShowUserModal(true)} className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold shadow-lg">
                  <Plus className="w-5 h-5" /> Создать пользователя
                </button>
              </div>
              <div className="space-y-3">
                {filteredUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-primary border border-base rounded-2xl">
                    <div className="flex items-center gap-4">
                      <Link to={`/user/${u.id}`}>
                          <img src={u.avatar || AVATAR_PLACEHOLDER} alt="" className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-accent transition-all" />
                      </Link>
                      <div>
                        <Link to={`/user/${u.id}`} className="font-bold text-sm hover:text-accent transition-colors">{u.username}</Link> {u.role === 'admin' && <span className="text-accent text-xs">(admin)</span>}
                        <p className="text-xs text-secondary">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={clsx("text-xs font-bold px-2 py-1 rounded", u.is_active ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500")}>
                        {u.is_active ? 'Активен' : 'Заблокирован'}
                      </span>
                      {u.role !== 'admin' && (
                        u.is_active ? (
                          <button onClick={() => handleBlockUser(u.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500" title="Заблокировать"><Lock className="w-4 h-4" /></button>
                        ) : (
                          <button onClick={() => handleUnblockUser(u.id)} className="p-2 rounded-lg hover:bg-green-500/10 text-green-500" title="Разблокировать"><Unlock className="w-4 h-4" /></button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Moderation Tab */}
          {activeTab === 'moderation' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-bold">Жалобы на модерации</h2>
              {reports.length === 0 ? (
                <div className="text-center py-16 text-secondary">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Нет жалоб на рассмотрении</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <div key={report.id} className="p-6 bg-primary border border-base rounded-2xl space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full uppercase">{TARGET_TYPE_LABELS[report.target_type] || report.target_type}</span>
                          <span className="text-xs text-secondary">ID: {report.target_id}</span>
                        </div>
                        <span className="text-xs text-secondary">{new Date(report.created_at).toLocaleString('ru-RU')}</span>
                      </div>
                      <div className="p-4 bg-secondary rounded-xl border border-base">
                        <p className="text-sm text-secondary italic">«{report.target_content_preview}»</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary mb-1">Причина жалобы от <Link to={`/user/${report.reporter_id}`} className="font-bold text-accent hover:underline">{report.reporter_name}</Link>:</p>
                        <p className="text-sm font-medium">{report.reason}</p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => handleResolveReport(report.id)} className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors">
                          <Trash2 className="w-4 h-4" /> Удалить объект
                        </button>
                        <button onClick={() => handleDismissReport(report.id)} className="flex items-center gap-2 px-4 py-2 bg-secondary border border-base rounded-xl font-bold text-sm hover:bg-primary transition-colors">
                          <XCircle className="w-4 h-4" /> Отклонить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Book Modal */}
      <AnimatePresence>
        {showBookModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookModal(false)}
              className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-[101] w-full max-w-lg bg-primary rounded-3xl p-8 shadow-2xl border border-base max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button type="button" onClick={() => setShowBookModal(false)} className="absolute top-6 right-6 text-secondary hover:text-primary"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-6">{editingBook ? 'Редактировать книгу' : 'Добавить книгу'}</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Название" value={bookForm.title} onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                <input type="text" placeholder="Автор" value={bookForm.author} onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                <textarea placeholder="Описание" value={bookForm.description} onChange={(e) => setBookForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none h-24" />
                <input type="text" placeholder="Ссылка на обложку" value={bookForm.cover} onChange={(e) => setBookForm(prev => ({ ...prev, cover: e.target.value }))} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-secondary">Жанры</label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map(g => (
                      <button
                        key={g}
                        onClick={() => {
                          const currentGenres = (bookForm.genre || '').split(',').map(x => x.trim()).filter(Boolean);
                          const nextGenres = currentGenres.includes(g)
                            ? currentGenres.filter(x => x !== g)
                            : [...currentGenres, g];
                          setBookForm(prev => ({ ...prev, genre: nextGenres.join(', ') }));
                        }}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          (bookForm.genre || '').split(',').map(x => x.trim()).includes(g)
                            ? "bg-accent text-white border-accent"
                            : "bg-secondary text-secondary border-base hover:border-accent/30"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-secondary ml-1">Год издания</label>
                    <input type="number" placeholder="Год" value={bookForm.year} onChange={(e) => setBookForm(prev => ({ ...prev, year: parseInt(e.target.value) || 2024 }))} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                  </div>
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={bookForm.is_free} onChange={(e) => setBookForm(prev => ({ ...prev, is_free: e.target.checked }))} className="w-4 h-4 accent-accent" />
                      <span className="text-sm font-medium">Бесплатная</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-secondary ml-1">Цена (₽)</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="0"
                      value={Number(bookForm.retail_price ?? 0)}
                      onChange={(e) => setBookForm(prev => ({ ...prev, retail_price: Math.max(0, Number(e.target.value) || 0) }))}
                      disabled={bookForm.is_free === true}
                      className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none disabled:opacity-60"
                    />
                    {bookForm.is_free ? (
                      <p className="text-[11px] text-secondary ml-1 mt-1">Для бесплатной книги цена игнорируется</p>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-secondary ml-1">Остаток (шт.)</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="0"
                      value={Number(bookForm.stock_quantity ?? 0)}
                      onChange={(e) => setBookForm(prev => ({ ...prev, stock_quantity: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-secondary">Контент книги (.txt)</label>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={txtImportState === 'reading'}
                      onClick={() => txtInputRef.current?.click()}
                      className="w-full px-4 py-3 bg-secondary border border-base rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60"
                    >
                      <Plus className="w-4 h-4 text-accent" />
                      {txtImportState === 'reading' ? 'Читаем файл…' : 'Загрузить .txt'}
                    </button>
                    <input
                      ref={txtInputRef}
                      type="file"
                      className="hidden"
                      accept=".txt,text/plain"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setTxtImportState('reading');
                        void (async () => {
                          try {
                            const text = await readPlainTextBookFile(file);
                            setBookForm((prev) => ({ ...prev, content: text }));
                            setTxtImportState('done');
                            toast.success(`Текст загружен: ${text.length.toLocaleString('ru-RU')} символов`);
                          } catch {
                            setTxtImportState('error');
                            toast.error('Не удалось прочитать файл.');
                          }
                        })();
                        e.target.value = '';
                      }}
                    />
                    {editingBook && (
                      <button 
                        type="button"
                        disabled={!bookForm.content}
                        onClick={() => {
                          if (!bookForm.content) return;
                          const blob = new Blob([bookForm.content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${bookForm.title || 'book'}.txt`;
                          a.click();
                        }}
                        className={clsx(
                          "w-full px-4 py-3 border border-base rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium",
                          bookForm.content ? "bg-secondary hover:text-accent" : "bg-secondary/30 text-secondary opacity-50 cursor-not-allowed"
                        )}
                      >
                        <BookOpen className="w-4 h-4" /> 
                        {!bookForm.content ? "Содержание не загружено" : "Скачать текущее содержание"}
                      </button>
                    )}
                  </div>
                </div>
                {bookForm.content ? (
                  <p className="text-xs text-secondary">
                    В форме загружено символов: {bookForm.content.length.toLocaleString('ru-RU')}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={isSavingBook || txtImportState === 'reading'}
                  onClick={handleSaveBook}
                  className="w-full py-3 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />{' '}
                  {isSavingBook ? 'Сохранение…' : editingBook ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Create Modal */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUserModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base">
              <button onClick={() => setShowUserModal(false)} className="absolute top-6 right-6 text-secondary hover:text-primary"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-6">Новый пользователь</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Имя" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                <input type="email" placeholder="Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                <input type="password" placeholder="Пароль" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                <button onClick={handleCreateUser} className="w-full py-3 bg-accent text-white rounded-xl font-bold">Создать</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
