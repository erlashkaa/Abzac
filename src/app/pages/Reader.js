import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Settings, Bookmark, Minimize2, Plus, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { booksApi } from '../api/booksApi';
import { bookmarksApi } from '../api/bookmarksApi';
import { usersApi } from '../api/usersApi';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';
import { getDemoBook, isDemoId } from '../demo/demoData';
export const Reader = () => {
    const { theme: appTheme } = useTheme();
    const [settings, setSettings] = useState({
        fontSize: 18,
        lineHeight: 1.6,
        lineWidth: 'medium',
        fontFamily: 'serif',
        readerTheme: 'light',
    });
    const [showSettings, setShowSettings] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams] = useSearchParams();
    const bookId = searchParams.get('bookId');
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('Загрузка...');
    // Bookmarks state
    const [bookmarks, setBookmarks] = useState([]);
    const [showBookmarksMenu, setShowBookmarksMenu] = useState(false);
    const [isAddingBookmark, setIsAddingBookmark] = useState(false);
    const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
    const [selectedParaIndex, setSelectedParaIndex] = useState(null);
    const [newBookmark, setNewBookmark] = useState({ name: '', description: '' });
    const scrollRef = React.useRef(null);
    useEffect(() => {
        if (bookId) {
            const id = Number(bookId);
            booksApi.getBookContent(id)
                .then(r => {
                setContent(r.data.content || 'Во время загрузки потерялся контент...');
                setTitle(r.data.title || 'Без названия');
            })
                .catch(() => {
                const demo = getDemoBook(id);
                if (demo) {
                    setContent(demo.content || '—');
                    setTitle(demo.title || 'Демо');
                    return;
                }
                setContent('Ошибка загрузки книги. Возможно, она недоступна.');
                setTitle('Ошибка');
            });
            bookmarksApi.getBookmarks(id)
                .then(r => setBookmarks(r.data))
                .catch(() => { });
            usersApi.getReadingHistory().then(r => {
                const item = r.data.find(h => h.book_id === id);
                if (item) {
                    setProgress(item.progress_percent);
                }
                else {
                    setProgress(0);
                }
            }).catch(() => { });
        }
    }, [bookId]);
    // Handle initial scroll after content and progress are loaded
    const hasScrolled = React.useRef(false);
    useEffect(() => {
        if (content && scrollRef.current && bookId && progress > 0 && !hasScrolled.current) {
            const { scrollHeight, clientHeight } = scrollRef.current;
            scrollRef.current.scrollTop = (progress / 100) * (scrollHeight - clientHeight);
            hasScrolled.current = true;
        }
    }, [content, progress]);
    // Throttled progress saving
    useEffect(() => {
        if (!bookId || progress === 0)
            return;
        if (isDemoId(Number(bookId)))
            return;
        const timer = setTimeout(() => {
            usersApi.updateReadingProgress(Number(bookId), { progress_percent: progress, current_page: 1 });
        }, 5000);
        return () => clearTimeout(timer);
    }, [progress, bookId]);
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const pct = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
            setProgress(isNaN(pct) ? 0 : Math.min(100, Math.max(0, pct)));
        }
    };
    const handleParagraphClick = (index) => {
        if (isAddingBookmark) {
            setSelectedParaIndex(index);
            setShowAddBookmarkModal(true);
            setIsAddingBookmark(false);
        }
    };
    const saveBookmark = async () => {
        if (selectedParaIndex === null || !bookId)
            return;
        try {
            const resp = await bookmarksApi.createBookmark({
                book_id: Number(bookId),
                paragraph_index: selectedParaIndex,
                name: newBookmark.name || `Закладка ${bookmarks.length + 1}`,
                description: newBookmark.description
            });
            setBookmarks(prev => [...prev, resp.data].sort((a, b) => a.paragraph_index - b.paragraph_index));
            setShowAddBookmarkModal(false);
            setNewBookmark({ name: '', description: '' });
            setSelectedParaIndex(null);
        }
        catch { }
    };
    const deleteBookmark = async (id) => {
        try {
            await bookmarksApi.deleteBookmark(id);
            setBookmarks(prev => prev.filter(b => b.id !== id));
        }
        catch { }
    };
    const scrollToParagraph = (index) => {
        const p = document.getElementById(`para-${index}`);
        if (p) {
            p.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setShowBookmarksMenu(false);
        }
    };
    // Prevention of selection and context menu
    useEffect(() => {
        const preventAction = (e) => e.preventDefault();
        document.addEventListener('contextmenu', preventAction);
        return () => document.removeEventListener('contextmenu', preventAction);
    }, []);
    const readerThemeStyles = {
        light: 'bg-[#ffffff] text-[#1a1a1a]',
        dark: 'bg-[#0f172a] text-[#e2e8f0]',
        sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    };
    const lineWidthStyles = {
        narrow: 'max-w-xl',
        medium: 'max-w-3xl',
        wide: 'max-w-5xl',
    };
    return (_jsxs("div", { className: clsx("fixed inset-0 z-[60] flex flex-col transition-colors duration-300 select-none", readerThemeStyles[settings.readerTheme]), children: [_jsx(AnimatePresence, { children: !isFocusMode && (_jsxs(motion.div, { initial: { y: -60 }, animate: { y: 0 }, exit: { y: -60 }, className: "h-14 flex items-center justify-between px-4 border-b border-black/5 backdrop-blur-sm sticky top-0 z-10", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => window.history.back(), className: "p-2 hover:bg-black/5 rounded-full", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) }), _jsx("h1", { className: "text-sm font-semibold opacity-80", children: title })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("button", { onClick: () => setShowSettings(!showSettings), className: "p-2 hover:bg-black/5 rounded-full", children: _jsx(Settings, { className: "w-5 h-5" }) }) })] })) }), _jsx("main", { ref: scrollRef, onScroll: handleScroll, className: "flex-1 overflow-y-auto px-4 py-12 flex justify-center scroll-smooth", children: _jsxs("article", { className: clsx("w-full transition-all duration-300", lineWidthStyles[settings.lineWidth], settings.fontFamily === 'serif' ? 'font-serif' : settings.fontFamily === 'mono' ? 'font-mono' : 'font-sans'), style: {
                        fontSize: `${settings.fontSize}px`,
                        lineHeight: settings.lineHeight,
                    }, children: [_jsx("div", { className: "mb-12 border-l-4 border-accent pl-6 py-2 opacity-60 text-sm font-sans uppercase tracking-widest", children: "\u041A\u043E\u043D\u0442\u0435\u043D\u0442 \u0437\u0430\u0449\u0438\u0449\u0435\u043D \u0437\u0430\u043A\u043E\u043D\u043E\u043C \u043E\u0431 \u0430\u0432\u0442\u043E\u0440\u0441\u043A\u043E\u043C \u043F\u0440\u0430\u0432\u0435 \u00AB\u0410\u0431\u0437\u0430\u0446\u00BB" }), _jsx("h2", { className: "text-4xl font-bold mb-8 font-sans", children: title }), isAddingBookmark && (_jsxs("div", { className: "mb-8 p-4 bg-accent/10 border border-accent/20 rounded-xl text-center", children: [_jsx("p", { className: "text-sm font-bold text-accent", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0430\u0431\u0437\u0430\u0446 \u0434\u043B\u044F \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438 \u0437\u0430\u043A\u043B\u0430\u0434\u043A\u0438" }), _jsx("button", { onClick: () => setIsAddingBookmark(false), className: "text-xs text-secondary hover:underline mt-1", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })), content ? (content.split('\n\n').map((paragraph, i) => (_jsx("p", { id: `para-${i}`, onClick: () => handleParagraphClick(i), className: clsx("mb-6 leading-relaxed transition-all", isAddingBookmark ? "cursor-crosshair hover:bg-accent/5 p-2 -m-2 rounded-lg" : ""), children: paragraph }, i)))) : (_jsx("p", { className: "mb-6 leading-relaxed", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0442\u0435\u043A\u0441\u0442\u0430..." }))] }) }), _jsx(AnimatePresence, { children: showSettings && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "absolute bottom-20 right-4 w-72 p-6 bg-primary border border-base rounded-2xl shadow-2xl z-[70] text-primary", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-bold", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), _jsx("button", { onClick: () => setShowSettings(false), className: "text-secondary hover:text-primary", children: "\u00D7" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary", children: "\u0422\u0435\u043C\u0430" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: ['light', 'sepia', 'dark'].map((t) => (_jsx("button", { onClick: () => setSettings({ ...settings, readerTheme: t }), className: clsx("h-10 rounded-lg border-2 flex items-center justify-center text-xs font-medium", t === 'light' ? 'bg-white text-black' : t === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636]' : 'bg-[#0f172a] text-white', settings.readerTheme === t ? 'border-accent' : 'border-transparent'), children: t === 'light' ? 'День' : t === 'sepia' ? 'Бумага' : 'Ночь' }, t))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "text-xs font-bold uppercase text-secondary flex justify-between", children: ["\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430 ", _jsxs("span", { children: [settings.fontSize, "px"] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => setSettings({ ...settings, fontSize: Math.max(12, settings.fontSize - 1) }), className: "p-2 bg-secondary rounded-lg", children: "A-" }), _jsx("input", { type: "range", min: "12", max: "32", value: settings.fontSize, onChange: (e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) }), className: "flex-1 accent-accent" }), _jsx("button", { onClick: () => setSettings({ ...settings, fontSize: Math.min(32, settings.fontSize + 1) }), className: "p-2 bg-secondary rounded-lg", children: "A+" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary", children: "\u0428\u0438\u0440\u0438\u043D\u0430 \u0441\u0442\u0440\u043E\u043A\u0438" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: ['narrow', 'medium', 'wide'].map((w) => (_jsx("button", { onClick: () => setSettings({ ...settings, lineWidth: w }), className: clsx("h-10 rounded-lg bg-secondary text-xs font-medium border-2", settings.lineWidth === w ? 'border-accent' : 'border-transparent'), children: w === 'narrow' ? 'Узкая' : w === 'medium' ? 'Средняя' : 'Широкая' }, w))) })] })] }) })) }), _jsxs("div", { className: "h-16 flex items-center justify-between px-4 md:px-8 border-t border-black/5", children: [_jsxs("div", { className: "flex items-center gap-4 text-xs font-medium opacity-60", children: [_jsx("div", { className: "hidden md:block w-48 h-1 bg-black/10 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-accent", style: { width: `${progress}%` } }) }), _jsxs("span", { children: [progress, "%"] })] }), _jsxs("div", { className: "flex items-center gap-2 md:gap-4 relative", children: [_jsxs("button", { onClick: () => setShowBookmarksMenu(!showBookmarksMenu), className: clsx("flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors", showBookmarksMenu ? "bg-accent text-white" : "hover:bg-black/5"), children: [_jsx(Bookmark, { className: "w-4 h-4" }), " ", _jsx("span", { className: "hidden md:inline", children: "\u0417\u0430\u043A\u043B\u0430\u0434\u043A\u0438" })] }), _jsx(AnimatePresence, { children: showBookmarksMenu && (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, className: "absolute bottom-full right-0 mb-2 w-64 bg-primary border border-base rounded-2xl shadow-2xl overflow-hidden z-[70] text-primary", children: [_jsxs("div", { className: "p-4 border-b border-base bg-secondary/30 flex items-center justify-between", children: [_jsx("h3", { className: "font-bold text-sm", children: "\u0417\u0430\u043A\u043B\u0430\u0434\u043A\u0438" }), _jsx("button", { onClick: () => { setIsAddingBookmark(true); setShowBookmarksMenu(false); }, className: "p-1 hover:bg-accent/10 text-accent rounded-lg", title: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043D\u043E\u0432\u0443\u044E", children: _jsx(Plus, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "max-h-64 overflow-y-auto p-2", children: bookmarks.length === 0 ? (_jsx("p", { className: "text-xs text-secondary text-center py-8", children: "\u0417\u0430\u043A\u043B\u0430\u0434\u043E\u043A \u043F\u043E\u043A\u0430 \u043D\u0435\u0442" })) : (bookmarks.map(b => (_jsxs("div", { className: "group relative", children: [_jsxs("button", { onClick: () => scrollToParagraph(b.paragraph_index), className: "w-full text-left p-2 hover:bg-secondary rounded-xl transition-colors", children: [_jsx("p", { className: "text-sm font-bold truncate", children: b.name }), _jsx("p", { className: "text-xs text-secondary truncate", children: b.description || `Абзац ${b.paragraph_index + 1}` })] }), _jsx("button", { onClick: (e) => { e.stopPropagation(); deleteBookmark(b.id); }, className: "absolute right-2 top-1/2 -translate-y-1/2 p-2 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 rounded-lg transition-all", children: _jsx(Trash2, { className: "w-3 h-3" }) })] }, b.id)))) })] })) })] })] }), _jsx(AnimatePresence, { children: showAddBookmarkModal && (_jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setShowAddBookmarkModal(false), className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "relative w-full max-w-sm bg-primary rounded-3xl p-6 shadow-2xl border border-base", children: [_jsx("h3", { className: "text-xl font-black mb-4", children: "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u043A\u043B\u0430\u0434\u043A\u0430" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary mb-1 block", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" }), _jsx("input", { type: "text", value: newBookmark.name, onChange: (e) => setNewBookmark(prev => ({ ...prev, name: e.target.value })), placeholder: `Закладка ${bookmarks.length + 1}`, className: "w-full px-4 py-2 bg-secondary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary mb-1 block", children: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435" }), _jsx("textarea", { value: newBookmark.description, onChange: (e) => setNewBookmark(prev => ({ ...prev, description: e.target.value })), placeholder: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435...", className: "w-full px-4 py-2 bg-secondary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-24 resize-none" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setShowAddBookmarkModal(false), className: "flex-1 py-3 bg-secondary rounded-xl font-bold", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { onClick: saveBookmark, className: "flex-1 py-3 bg-accent text-white rounded-xl font-bold", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" })] })] })] })] })) }), isFocusMode && (_jsx("button", { onClick: () => setIsFocusMode(false), className: "fixed top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity", children: _jsx(Minimize2, { className: "w-5 h-5" }) }))] }));
};
