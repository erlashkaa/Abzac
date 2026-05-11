import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, Users, Plus, Trash2, Edit3, Lock, Unlock, Search, X, Save, Shield, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { AVATAR_PLACEHOLDER } from '../constants';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/adminApi';
import { booksApi } from '../api/booksApi';
const TARGET_TYPE_LABELS = {
    comment: 'Комментарий',
    review: 'Отзыв',
    forum_topic: 'Тема форума',
    forum_message: 'Сообщение форума',
};
function countCyrillicLetters(s) {
    let n = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s.codePointAt(i);
        if ((c >= 0x0410 && c <= 0x044f) || c === 0x0401 || c === 0x0451)
            n++;
        if (c > 0xffff)
            i++;
    }
    return n;
}
/** .txt в Windows часто в CP1251; читаем UTF-8 строго, иначе или при «обмане» — windows-1251 */
async function readPlainTextBookFile(file) {
    const buf = await file.arrayBuffer();
    let utf8 = '';
    let utf8StrictOk = true;
    try {
        utf8 = new TextDecoder('utf-8', { fatal: true }).decode(buf);
    }
    catch {
        utf8StrictOk = false;
    }
    const cp1251 = new TextDecoder('windows-1251').decode(buf);
    if (!utf8StrictOk)
        return cp1251;
    if (countCyrillicLetters(cp1251) > countCyrillicLetters(utf8) + 20)
        return cp1251;
    return utf8;
}
export const Admin = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [finance, setFinance] = useState(null);
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    // Book modal state
    const [showBookModal, setShowBookModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [bookForm, setBookForm] = useState({
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
    const [availableGenres, setAvailableGenres] = useState([]);
    const txtInputRef = useRef(null);
    const [isSavingBook, setIsSavingBook] = useState(false);
    const [txtImportState, setTxtImportState] = useState('idle');
    useEffect(() => {
        adminApi.getStats().then(r => setStats(r.data)).catch(() => { });
        adminApi.getFinanceAnalytics().then(r => setFinance(r.data)).catch(() => { });
        booksApi.getBooks({ per_page: 100 }).then(r => setBooks(r.data.books)).catch(() => { });
        adminApi.getUsers().then(r => setUsers(r.data)).catch(() => { });
        adminApi.getReports().then(r => setReports(r.data)).catch(() => { });
        booksApi.getGenres().then(r => setAvailableGenres(r.data)).catch(() => { });
    }, []);
    const handleDeleteBook = async (bookId) => {
        try {
            await booksApi.deleteBook(bookId);
            setBooks(prev => prev.filter(b => b.id !== bookId));
        }
        catch { }
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
                setBooks(prev => prev.map(b => (b.id === editingBook.id ? { ...resp.data, content: content ?? '' } : b)));
                toast.success('Книга сохранена');
            }
            else {
                const resp = await booksApi.createBook({ ...meta, content: '' });
                await booksApi.updateBookContent(resp.data.id, content ?? '');
                setBooks(prev => [{ ...resp.data, content: content ?? '' }, ...prev]);
                toast.success('Книга добавлена');
            }
            setShowBookModal(false);
            setEditingBook(null);
            setBookForm({ title: '', author: '', description: '', cover: '', genre: '', year: 2024, is_free: false, tags: [], content: '', retail_price: 0, stock_quantity: 0 });
            setTxtImportState('idle');
        }
        catch (err) {
            const ax = err;
            const detail = ax.response?.data?.detail;
            const msg = typeof detail === 'string'
                ? detail
                : Array.isArray(detail)
                    ? detail.map((d) => d.msg || '').filter(Boolean).join('; ')
                    : ax.response?.data?.message || ax.message || 'Не удалось сохранить книгу';
            toast.error(msg);
        }
        finally {
            setIsSavingBook(false);
        }
    };
    const handleOpenEditBook = async (book) => {
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
        }
        catch {
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
    const handleBlockUser = async (userId) => {
        try {
            await adminApi.blockUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: false } : u));
        }
        catch { }
    };
    const handleUnblockUser = async (userId) => {
        try {
            await adminApi.unblockUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: true } : u));
        }
        catch { }
    };
    const handleCreateUser = async () => {
        try {
            const resp = await adminApi.createUser({ username: newUserName, email: newUserEmail, password: newUserPassword });
            setUsers(prev => [resp.data, ...prev]);
            setShowUserModal(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
        }
        catch { }
    };
    const handleResolveReport = async (reportId) => {
        try {
            await adminApi.resolveReport(reportId);
            setReports(prev => prev.filter(r => r.id !== reportId));
        }
        catch { }
    };
    const handleDismissReport = async (reportId) => {
        try {
            await adminApi.dismissReport(reportId);
            setReports(prev => prev.filter(r => r.id !== reportId));
        }
        catch { }
    };
    const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchBooks.toLowerCase()) ||
        b.author.toLowerCase().includes(searchBooks.toLowerCase()));
    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchUsers.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUsers.toLowerCase()));
    const tabs = [
        { key: 'stats', label: 'Статистика', icon: BarChart3 },
        { key: 'library', label: 'Каталог', icon: BookOpen },
        { key: 'users', label: 'Пользователи', icon: Users },
        { key: 'moderation', label: 'Модерация', icon: Shield, badge: reports.length },
    ];
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8", children: "\u041F\u0430\u043D\u0435\u043B\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430" }), _jsxs("div", { className: "flex flex-col md:flex-row gap-8", children: [_jsx("div", { className: "md:w-64 shrink-0 space-y-2", children: tabs.map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab.key), className: clsx("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all", activeTab === tab.key ? "bg-accent text-white shadow-lg shadow-accent/20" : "hover:bg-secondary"), children: [_jsx(tab.icon, { className: "w-5 h-5" }), tab.label, 'badge' in tab && tab.badge !== undefined && tab.badge > 0 && (_jsx("span", { className: clsx("ml-auto text-xs font-bold px-2 py-0.5 rounded-full", activeTab === tab.key ? "bg-white/20" : "bg-rose-500 text-white"), children: tab.badge }))] }, tab.key))) }), _jsxs("div", { className: "flex-1", children: [activeTab === 'stats' && stats && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
                                            { label: 'Книги', value: stats.total_books, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                            { label: 'Пользователи', value: stats.total_users, color: 'text-green-500', bg: 'bg-green-500/10' },
                                            { label: 'Отзывы и комменты', value: stats.total_comments, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                            { label: 'Книг читается', value: stats.total_readings, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                        ].map(stat => (_jsxs("div", { className: "bg-primary border border-base rounded-2xl p-6", children: [_jsx("p", { className: clsx("text-4xl font-black", stat.color), children: stat.value }), _jsx("p", { className: "text-xs font-bold text-secondary uppercase mt-2", children: stat.label })] }, stat.label))) }), finance && (_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-primary border border-base rounded-2xl p-6", children: [_jsx("p", { className: "text-4xl font-black text-emerald-500", children: new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(finance.total_revenue)) }), _jsx("p", { className: "text-xs font-bold text-secondary uppercase mt-2", children: "\u0412\u044B\u0440\u0443\u0447\u043A\u0430" })] }), _jsxs("div", { className: "bg-primary border border-base rounded-2xl p-6", children: [_jsx("p", { className: "text-4xl font-black text-fuchsia-500", children: new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(finance.net_profit_estimated)) }), _jsx("p", { className: "text-xs font-bold text-secondary uppercase mt-2", children: "\u041F\u0440\u0438\u0431\u044B\u043B\u044C" })] }), _jsxs("div", { className: "bg-primary border border-base rounded-2xl p-6", children: [_jsx("p", { className: "text-4xl font-black text-sky-500", children: finance.sales_by_genre.length }), _jsx("p", { className: "text-xs font-bold text-secondary uppercase mt-2", children: "\u0416\u0430\u043D\u0440\u044B \u043F\u0440\u043E\u0434\u0430\u0436" })] }), _jsxs("div", { className: "bg-primary border border-base rounded-2xl p-6", children: [_jsx("p", { className: "text-4xl font-black text-rose-500", children: finance.deficit_books_for_publisher.length }), _jsx("p", { className: "text-xs font-bold text-secondary uppercase mt-2", children: "\u0414\u0435\u0444\u0438\u0446\u0438\u0442" })] })] }))] })), activeTab === 'library' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" }), _jsx("input", { type: "text", value: searchBooks, onChange: (e) => setSearchBooks(e.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A \u043A\u043D\u0438\u0433...", className: "w-full pl-12 pr-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" })] }), _jsxs("button", { onClick: () => { setEditingBook(null); setTxtImportState('idle'); setBookForm({ title: '', author: '', description: '', cover: '', genre: '', year: 2024, is_free: false, tags: [], content: '', retail_price: 0, stock_quantity: 0 }); setShowBookModal(true); }, className: "flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold shadow-lg", children: [_jsx(Plus, { className: "w-5 h-5" }), " \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043A\u043D\u0438\u0433\u0443"] })] }), _jsx("div", { className: "space-y-3", children: filteredBooks.map(book => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-primary border border-base rounded-2xl", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-16 rounded-lg overflow-hidden bg-secondary shrink-0", children: _jsx("img", { src: book.cover, alt: "", className: "w-full h-full object-cover" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold", children: book.title }), _jsxs("p", { className: "text-sm text-secondary", children: [book.author, " \u2022 ", book.genre, " \u2022 ", book.year] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleOpenEditBook(book), className: "p-2 rounded-lg hover:bg-secondary text-accent", children: _jsx(Edit3, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDeleteBook(book.id), className: "p-2 rounded-lg hover:bg-rose-500/10 text-rose-500", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, book.id))) })] })), activeTab === 'users' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" }), _jsx("input", { type: "text", value: searchUsers, onChange: (e) => setSearchUsers(e.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439...", className: "w-full pl-12 pr-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" })] }), _jsxs("button", { onClick: () => setShowUserModal(true), className: "flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold shadow-lg", children: [_jsx(Plus, { className: "w-5 h-5" }), " \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F"] })] }), _jsx("div", { className: "space-y-3", children: filteredUsers.map(u => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-primary border border-base rounded-2xl", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Link, { to: `/user/${u.id}`, children: _jsx("img", { src: u.avatar || AVATAR_PLACEHOLDER, alt: "", className: "w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-accent transition-all" }) }), _jsxs("div", { children: [_jsx(Link, { to: `/user/${u.id}`, className: "font-bold text-sm hover:text-accent transition-colors", children: u.username }), " ", u.role === 'admin' && _jsx("span", { className: "text-accent text-xs", children: "(admin)" }), _jsx("p", { className: "text-xs text-secondary", children: u.email })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: clsx("text-xs font-bold px-2 py-1 rounded", u.is_active ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"), children: u.is_active ? 'Активен' : 'Заблокирован' }), u.role !== 'admin' && (u.is_active ? (_jsx("button", { onClick: () => handleBlockUser(u.id), className: "p-2 rounded-lg hover:bg-rose-500/10 text-rose-500", title: "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: _jsx(Lock, { className: "w-4 h-4" }) })) : (_jsx("button", { onClick: () => handleUnblockUser(u.id), className: "p-2 rounded-lg hover:bg-green-500/10 text-green-500", title: "\u0420\u0430\u0437\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: _jsx(Unlock, { className: "w-4 h-4" }) })))] })] }, u.id))) })] })), activeTab === 'moderation' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-bold", children: "\u0416\u0430\u043B\u043E\u0431\u044B \u043D\u0430 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438" }), reports.length === 0 ? (_jsxs("div", { className: "text-center py-16 text-secondary", children: [_jsx(Shield, { className: "w-12 h-12 mx-auto mb-3 opacity-20" }), _jsx("p", { children: "\u041D\u0435\u0442 \u0436\u0430\u043B\u043E\u0431 \u043D\u0430 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u0438\u0438" })] })) : (_jsx("div", { className: "space-y-4", children: reports.map(report => (_jsxs("div", { className: "p-6 bg-primary border border-base rounded-2xl space-y-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full uppercase", children: TARGET_TYPE_LABELS[report.target_type] || report.target_type }), _jsxs("span", { className: "text-xs text-secondary", children: ["ID: ", report.target_id] })] }), _jsx("span", { className: "text-xs text-secondary", children: new Date(report.created_at).toLocaleString('ru-RU') })] }), _jsx("div", { className: "p-4 bg-secondary rounded-xl border border-base", children: _jsxs("p", { className: "text-sm text-secondary italic", children: ["\u00AB", report.target_content_preview, "\u00BB"] }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-xs text-secondary mb-1", children: ["\u041F\u0440\u0438\u0447\u0438\u043D\u0430 \u0436\u0430\u043B\u043E\u0431\u044B \u043E\u0442 ", _jsx(Link, { to: `/user/${report.reporter_id}`, className: "font-bold text-accent hover:underline", children: report.reporter_name }), ":"] }), _jsx("p", { className: "text-sm font-medium", children: report.reason })] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs("button", { onClick: () => handleResolveReport(report.id), className: "flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors", children: [_jsx(Trash2, { className: "w-4 h-4" }), " \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043E\u0431\u044A\u0435\u043A\u0442"] }), _jsxs("button", { onClick: () => handleDismissReport(report.id), className: "flex items-center gap-2 px-4 py-2 bg-secondary border border-base rounded-xl font-bold text-sm hover:bg-primary transition-colors", children: [_jsx(XCircle, { className: "w-4 h-4" }), " \u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C"] })] })] }, report.id))) }))] }))] })] }), _jsx(AnimatePresence, { children: showBookModal && (_jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setShowBookModal(false), className: "absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm", "aria-hidden": true }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "relative z-[101] w-full max-w-lg bg-primary rounded-3xl p-8 shadow-2xl border border-base max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), role: "dialog", "aria-modal": "true", children: [_jsx("button", { type: "button", onClick: () => setShowBookModal(false), className: "absolute top-6 right-6 text-secondary hover:text-primary", children: _jsx(X, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-black mb-6", children: editingBook ? 'Редактировать книгу' : 'Добавить книгу' }), _jsxs("div", { className: "space-y-4", children: [_jsx("input", { type: "text", placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", value: bookForm.title, onChange: (e) => setBookForm(prev => ({ ...prev, title: e.target.value })), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" }), _jsx("input", { type: "text", placeholder: "\u0410\u0432\u0442\u043E\u0440", value: bookForm.author, onChange: (e) => setBookForm(prev => ({ ...prev, author: e.target.value })), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" }), _jsx("textarea", { placeholder: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", value: bookForm.description, onChange: (e) => setBookForm(prev => ({ ...prev, description: e.target.value })), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none h-24" }), _jsx("input", { type: "text", placeholder: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043E\u0431\u043B\u043E\u0436\u043A\u0443", value: bookForm.cover, onChange: (e) => setBookForm(prev => ({ ...prev, cover: e.target.value })), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary", children: "\u0416\u0430\u043D\u0440\u044B" }), _jsx("div", { className: "flex flex-wrap gap-2", children: genres.map(g => (_jsx("button", { onClick: () => {
                                                            const currentGenres = (bookForm.genre || '').split(',').map(x => x.trim()).filter(Boolean);
                                                            const nextGenres = currentGenres.includes(g)
                                                                ? currentGenres.filter(x => x !== g)
                                                                : [...currentGenres, g];
                                                            setBookForm(prev => ({ ...prev, genre: nextGenres.join(', ') }));
                                                        }, className: clsx("px-3 py-1.5 rounded-lg text-xs font-bold transition-all border", (bookForm.genre || '').split(',').map(x => x.trim()).includes(g)
                                                            ? "bg-accent text-white border-accent"
                                                            : "bg-secondary text-secondary border-base hover:border-accent/30"), children: g }, g))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-bold uppercase text-secondary ml-1", children: "\u0413\u043E\u0434 \u0438\u0437\u0434\u0430\u043D\u0438\u044F" }), _jsx("input", { type: "number", placeholder: "\u0413\u043E\u0434", value: bookForm.year, onChange: (e) => setBookForm(prev => ({ ...prev, year: parseInt(e.target.value) || 2024 })), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" })] }), _jsx("div", { className: "flex items-end pb-3", children: _jsxs("label", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: bookForm.is_free, onChange: (e) => setBookForm(prev => ({ ...prev, is_free: e.target.checked })), className: "w-4 h-4 accent-accent" }), _jsx("span", { className: "text-sm font-medium", children: "\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0430\u044F" })] }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-bold uppercase text-secondary ml-1", children: "\u0426\u0435\u043D\u0430 (\u20BD)" }), _jsx("input", { type: "number", min: 0, step: 1, placeholder: "0", value: Number(bookForm.retail_price ?? 0), onChange: (e) => setBookForm(prev => ({ ...prev, retail_price: Math.max(0, Number(e.target.value) || 0) })), disabled: bookForm.is_free === true, className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none disabled:opacity-60" }), bookForm.is_free ? (_jsx("p", { className: "text-[11px] text-secondary ml-1 mt-1", children: "\u0414\u043B\u044F \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0439 \u043A\u043D\u0438\u0433\u0438 \u0446\u0435\u043D\u0430 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0435\u0442\u0441\u044F" })) : null] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] font-bold uppercase text-secondary ml-1", children: "\u041E\u0441\u0442\u0430\u0442\u043E\u043A (\u0448\u0442.)" }), _jsx("input", { type: "number", min: 0, step: 1, placeholder: "0", value: Number(bookForm.stock_quantity ?? 0), onChange: (e) => setBookForm(prev => ({ ...prev, stock_quantity: Math.max(0, parseInt(e.target.value) || 0) })), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary", children: "\u041A\u043E\u043D\u0442\u0435\u043D\u0442 \u043A\u043D\u0438\u0433\u0438 (.txt)" }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("button", { type: "button", disabled: txtImportState === 'reading', onClick: () => txtInputRef.current?.click(), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60", children: [_jsx(Plus, { className: "w-4 h-4 text-accent" }), txtImportState === 'reading' ? 'Читаем файл…' : 'Загрузить .txt'] }), _jsx("input", { ref: txtInputRef, type: "file", className: "hidden", accept: ".txt,text/plain", onChange: (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file)
                                                                    return;
                                                                setTxtImportState('reading');
                                                                void (async () => {
                                                                    try {
                                                                        const text = await readPlainTextBookFile(file);
                                                                        setBookForm((prev) => ({ ...prev, content: text }));
                                                                        setTxtImportState('done');
                                                                        toast.success(`Текст загружен: ${text.length.toLocaleString('ru-RU')} символов`);
                                                                    }
                                                                    catch {
                                                                        setTxtImportState('error');
                                                                        toast.error('Не удалось прочитать файл.');
                                                                    }
                                                                })();
                                                                e.target.value = '';
                                                            } }), editingBook && (_jsxs("button", { type: "button", disabled: !bookForm.content, onClick: () => {
                                                                if (!bookForm.content)
                                                                    return;
                                                                const blob = new Blob([bookForm.content], { type: 'text/plain' });
                                                                const url = URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = `${bookForm.title || 'book'}.txt`;
                                                                a.click();
                                                            }, className: clsx("w-full px-4 py-3 border border-base rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium", bookForm.content ? "bg-secondary hover:text-accent" : "bg-secondary/30 text-secondary opacity-50 cursor-not-allowed"), children: [_jsx(BookOpen, { className: "w-4 h-4" }), !bookForm.content ? "Содержание не загружено" : "Скачать текущее содержание"] }))] })] }), bookForm.content ? (_jsxs("p", { className: "text-xs text-secondary", children: ["\u0412 \u0444\u043E\u0440\u043C\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432: ", bookForm.content.length.toLocaleString('ru-RU')] })) : null, _jsxs("button", { type: "button", disabled: isSavingBook || txtImportState === 'reading', onClick: handleSaveBook, className: "w-full py-3 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed", children: [_jsx(Save, { className: "w-5 h-5" }), ' ', isSavingBook ? 'Сохранение…' : editingBook ? 'Сохранить' : 'Добавить'] })] })] })] })) }), _jsx(AnimatePresence, { children: showUserModal && (_jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setShowUserModal(false), className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base", children: [_jsx("button", { onClick: () => setShowUserModal(false), className: "absolute top-6 right-6 text-secondary hover:text-primary", children: _jsx(X, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-black mb-6", children: "\u041D\u043E\u0432\u044B\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C" }), _jsxs("div", { className: "space-y-4", children: [_jsx("input", { type: "text", placeholder: "\u0418\u043C\u044F", value: newUserName, onChange: (e) => setNewUserName(e.target.value), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" }), _jsx("input", { type: "email", placeholder: "Email", value: newUserEmail, onChange: (e) => setNewUserEmail(e.target.value), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" }), _jsx("input", { type: "password", placeholder: "\u041F\u0430\u0440\u043E\u043B\u044C", value: newUserPassword, onChange: (e) => setNewUserPassword(e.target.value), className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" }), _jsx("button", { onClick: handleCreateUser, className: "w-full py-3 bg-accent text-white rounded-xl font-bold", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C" })] })] })] })) })] }));
};
