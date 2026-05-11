import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Grid, List as ListIcon, ChevronDown, Loader2, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { BookCard } from '../components/BookCard';
import { booksApi } from '../api/booksApi';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { mergeWithDemoBooks } from '../demo/demoData';
// Default genres as fallback
const DEFAULT_GENRES = ['Все', 'Фантастика', 'Фэнтези', 'Проза', 'Детектив', 'Триллер', 'Образование', 'Психология'];
export const Catalog = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [search, setSearch] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('Все');
    const [showFilters, setShowFilters] = useState(false);
    const genres = ["Все", "Фантастика", "Фэнтези", "Детектив", "Романтика", "Триллер", "Ужасы", "Приключения", "Научпоп", "Проза", "Классика"];
    const [sortBy, setSortBy] = useState('popular');
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [availableGenres, setAvailableGenres] = useState(DEFAULT_GENRES);
    const observerTarget = useRef(null);
    const fetchBooks = async (pageNum, append = false) => {
        if (isLoading)
            return;
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
            }
            else {
                // Только книги с API — демо не подмешиваем (иначе «Тайны древнего кода» и т.п. при малой БД)
                setBooks(resp.data.books);
            }
            setTotal(resp.data.total);
            setHasMore(resp.data.books.length === 20);
        }
        catch {
            // silently fail
            if (pageNum === 1) {
                setBooks(mergeWithDemoBooks([], { targetSize: 20 }));
                setTotal(20);
                setHasMore(false);
            }
        }
        finally {
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
        }).catch(() => { });
    }, []);
    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchBooks(nextPage, true);
            }
        }, { threshold: 1.0 });
        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }
        return () => observer.disconnect();
    }, [page, hasMore, isLoading]);
    return (_jsxs("div", { className: "container mx-auto px-4 md:px-6 py-10", children: [_jsxs("div", { className: "mb-8 flex flex-col gap-5", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-2 rounded-full glass-effect-light border border-border-color/30 text-xs font-black tracking-wide text-text-secondary", children: [_jsx(Sparkles, { className: "w-4 h-4 text-accent-color" }), "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 / \u043F\u043E\u0438\u0441\u043A / \u0444\u0438\u043B\u044C\u0442\u0440\u044B"] }), _jsx("h1", { className: "mt-3 text-3xl md:text-4xl font-black tracking-tight", children: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433" }), _jsx("p", { className: "mt-2 text-sm text-secondary", children: "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u043A\u043D\u0438\u0433\u0443 \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E, \u0436\u0430\u043D\u0440\u0443 \u0438\u043B\u0438 \u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0435. \u041B\u0435\u043D\u0442\u0430 \u043F\u043E\u0434\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-1 p-1 rounded-2xl glass-effect-light border border-border-color/30 shadow-soft", children: [_jsx("button", { onClick: () => setViewMode('grid'), className: clsx("p-2.5 rounded-xl smooth-transition ring-soft", viewMode === 'grid' ? "bg-accent-color/15 border border-accent-color/25 text-text-primary" : "text-text-secondary hover:text-text-primary"), type: "button", "aria-label": "\u0421\u0435\u0442\u043A\u0430", children: _jsx(Grid, { className: "w-5 h-5" }) }), _jsx("button", { onClick: () => setViewMode('list'), className: clsx("p-2.5 rounded-xl smooth-transition ring-soft", viewMode === 'list' ? "bg-accent-color/15 border border-accent-color/25 text-text-primary" : "text-text-secondary hover:text-text-primary"), type: "button", "aria-label": "\u0421\u043F\u0438\u0441\u043E\u043A", children: _jsx(ListIcon, { className: "w-5 h-5" }) })] }), _jsxs("button", { onClick: () => setShowFilters(true), className: "inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft", type: "button", children: [_jsx(SlidersHorizontal, { className: "w-5 h-5" }), "\u0424\u0438\u043B\u044C\u0442\u0440\u044B"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-3", children: [_jsxs("div", { className: "lg:col-span-8 relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" }), _jsx("input", { type: "text", placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E, \u0430\u0432\u0442\u043E\u0440\u0443 \u0438\u043B\u0438 \u0436\u0430\u043D\u0440\u0443\u2026", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full pl-12 pr-4 py-4 rounded-[22px] glass-effect-light border border-border-color/30 text-sm ring-soft" })] }), _jsxs("div", { className: "lg:col-span-4 relative", children: [_jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "w-full appearance-none px-4 py-4 rounded-[22px] glass-effect-light border border-border-color/30 text-sm ring-soft", children: [_jsx("option", { value: "popular", children: "\u041F\u043E \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u0438" }), _jsx("option", { value: "new", children: "\u041F\u043E \u043D\u043E\u0432\u0438\u0437\u043D\u0435" }), _jsx("option", { value: "rating", children: "\u041F\u043E \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0443" })] }), _jsx(ChevronDown, { className: "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-secondary", children: [_jsxs("span", { className: "kbd", children: ["\u0412\u0441\u0435\u0433\u043E: ", total || 0] }), _jsxs("span", { className: "kbd", children: ["\u0416\u0430\u043D\u0440: ", selectedGenre] }), _jsxs("span", { className: "kbd", children: ["\u0420\u0435\u0436\u0438\u043C: ", viewMode === 'grid' ? 'grid' : 'list'] })] })] }), books.length === 0 && !isLoading ? (_jsxs("div", { className: "rounded-[32px] glass-effect border border-border-color/35 p-12 text-center shadow-soft", children: [_jsx("div", { className: "mx-auto w-12 h-12 rounded-2xl bg-accent-color/10 border border-accent-color/20 flex items-center justify-center text-accent-color mb-4", children: _jsx(Filter, { className: "w-5 h-5" }) }), _jsx("div", { className: "text-xl font-black", children: "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" }), _jsx("p", { className: "text-sm text-secondary mt-2 max-w-xl mx-auto", children: "\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441 \u0438\u043B\u0438 \u0441\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0436\u0430\u043D\u0440. \u0418\u043D\u043E\u0433\u0434\u0430 \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u043F\u043E\u0438\u0441\u043A \u043F\u043E \u0447\u0430\u0441\u0442\u0438 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F \u0438\u043B\u0438 \u0430\u0432\u0442\u043E\u0440\u0430." }), _jsxs("div", { className: "mt-6 flex flex-col sm:flex-row justify-center gap-3", children: [_jsx("button", { onClick: () => setSearch(''), className: "px-5 py-3 rounded-2xl glass-effect-light border border-border-color/30 font-black text-text-secondary hover:text-text-primary smooth-transition ring-soft", type: "button", children: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043F\u043E\u0438\u0441\u043A" }), _jsx("button", { onClick: () => setSelectedGenre('Все'), className: "px-5 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft", type: "button", children: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0436\u0430\u043D\u0440" })] })] })) : (_jsx("div", { className: clsx("grid gap-6 md:gap-8 mb-10", viewMode === 'grid' ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-1"), children: books.map((book) => viewMode === 'grid' ? (_jsx(BookCard, { book: book }, book.id)) : (_jsx(motion.article, { layout: true, className: "rounded-[28px] glass-effect border border-border-color/35 shadow-soft overflow-hidden", children: _jsxs("div", { className: "p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start", children: [_jsx("div", { className: "md:col-span-3", children: _jsx("div", { className: "aspect-[2/3] rounded-[22px] overflow-hidden border border-border-color/30 bg-bg-tertiary/30", children: _jsx("img", { src: book.cover, alt: book.title, className: "w-full h-full object-cover" }) }) }), _jsxs("div", { className: "md:col-span-9 flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xl font-black tracking-tight", children: book.title }), _jsx("div", { className: "text-sm text-secondary font-semibold", children: book.author })] }), _jsx("span", { className: "kbd", children: book.year })] }), _jsx("p", { className: "text-sm text-secondary/90 leading-relaxed line-clamp-3", children: book.description }), _jsx("div", { className: "flex flex-wrap gap-2", children: (book.genre || '').split(',').map((g) => g.trim()).filter(Boolean).slice(0, 6).map((label) => (_jsx("span", { className: "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-accent-color/10 text-accent-color border border-accent-color/15", children: label }, label))) }), _jsxs("div", { className: "pt-2 flex flex-col sm:flex-row sm:items-center gap-3", children: [_jsx("a", { href: `/book/${book.id}`, className: "inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft", children: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C" }), _jsx("a", { href: `/reader?bookId=${book.id}`, className: "inline-flex items-center justify-center px-5 py-3 rounded-2xl glass-effect-light border border-border-color/30 font-black text-text-secondary hover:text-text-primary smooth-transition ring-soft", children: "\u0427\u0438\u0442\u0430\u0442\u044C" })] })] })] }) }, book.id))) })), _jsx("div", { ref: observerTarget, className: "flex justify-center py-8", children: isLoading && (_jsxs("div", { className: "flex items-center gap-2 text-accent-color font-black", children: [_jsx(Loader2, { className: "w-6 h-6 animate-spin" }), _jsx("span", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043D\u043E\u0432\u044B\u0445 \u043A\u043D\u0438\u0433\u2026" })] })) }), _jsx(AnimatePresence, { children: showFilters && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-[95]", children: [_jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm", onClick: () => setShowFilters(false) }), _jsxs(motion.aside, { initial: { x: 24, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 24, opacity: 0 }, transition: { type: 'spring', stiffness: 420, damping: 38 }, className: "absolute right-3 top-3 bottom-3 w-[min(520px,calc(100vw-24px))] rounded-[30px] glass-effect border border-border-color/35 shadow-soft overflow-hidden", children: [_jsxs("div", { className: "p-5 border-b border-border-color/30 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-black", children: "\u0424\u0438\u043B\u044C\u0442\u0440\u044B" }), _jsx("div", { className: "text-xs text-tertiary", children: "\u0416\u0430\u043D\u0440\u044B \u0438 \u0431\u044B\u0441\u0442\u0440\u044B\u0439 \u0441\u0431\u0440\u043E\u0441" })] }), _jsx("button", { onClick: () => setShowFilters(false), className: "p-2.5 rounded-2xl hover:bg-bg-secondary/40 text-text-secondary hover:text-text-primary smooth-transition ring-soft", type: "button", "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-5 space-y-6", children: [_jsxs("div", { className: "rounded-[22px] glass-effect-light border border-border-color/30 p-4", children: [_jsxs("div", { className: "text-xs font-black uppercase tracking-widest text-tertiary mb-3 flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-accent-color" }), "\u0416\u0430\u043D\u0440\u044B"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: (availableGenres?.length ? availableGenres : genres).map((genre) => (_jsx("button", { onClick: () => setSelectedGenre(genre), className: clsx("px-3 py-2 rounded-full text-xs font-black transition-all border ring-soft", selectedGenre === genre
                                                            ? "bg-accent-color text-white border-accent-color"
                                                            : "bg-bg-secondary/40 text-text-secondary border-border-color/35 hover:text-text-primary hover:border-accent-color/25"), type: "button", children: genre }, genre))) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("button", { onClick: () => { setSearch(''); setSelectedGenre('Все'); }, className: "flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass-effect-light border border-border-color/30 font-black text-text-secondary hover:text-text-primary smooth-transition ring-soft", type: "button", children: ["\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C ", _jsx(X, { className: "w-4 h-4" })] }), _jsxs("button", { onClick: () => setShowFilters(false), className: "flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow ring-soft", type: "button", children: ["\u0413\u043E\u0442\u043E\u0432\u043E ", _jsx(SlidersHorizontal, { className: "w-4 h-4" })] })] })] })] })] })) })] }));
};
