import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pin, Lock, MessageCircle, Loader2, X, Send, Trash2, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { forumApi } from '../api/forumApi';
export const Forum = () => {
    const [topics, setTopics] = useState([]);
    const [showNewTopic, setShowNewTopic] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTagFilter, setActiveTagFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newTag, setNewTag] = useState(null);
    const tags = ['Обсуждение', 'Теории', 'Спойлеры', 'Поиск книг', 'Конкурсы'];
    const observerTarget = useRef(null);
    const { isLoggedIn, user } = useAuth();
    const isAdmin = user?.role === 'admin';
    // Report
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTopicId, setReportTopicId] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportError, setReportError] = useState('');
    const openReportTopic = (topicId, e) => {
        e.preventDefault();
        setReportTopicId(topicId);
        setReportReason('');
        setReportSuccess(false);
        setReportError('');
        setShowReportModal(true);
    };
    const submitTopicReport = async () => {
        if (!reportTopicId || !reportReason.trim())
            return;
        try {
            await forumApi.reportTopic(reportTopicId, reportReason);
            setReportSuccess(true);
            setTimeout(() => setShowReportModal(false), 1500);
        }
        catch (e) {
            setReportError(e.response?.data?.detail || 'Ошибка при отправке жалобы');
        }
    };
    const fetchTopics = async (pageNum, append = false, opts) => {
        if (isLoading)
            return;
        setIsLoading(true);
        try {
            const tagParam = opts?.tag !== undefined ? opts.tag : activeTagFilter;
            const searchParam = opts?.search !== undefined ? opts.search : searchQuery;
            const resp = await forumApi.getTopics({
                page: pageNum,
                per_page: 20,
                search: searchParam?.trim() ? searchParam.trim() : undefined,
                tag: tagParam || undefined,
            });
            const chunk = resp.data;
            if (append) {
                setTopics(prev => [...prev, ...chunk]);
            }
            else {
                setTopics(chunk);
            }
            setHasMore(!resp.last);
        }
        catch {
            if (!append)
                setTopics([]);
            setHasMore(false);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchTopics(1, false);
    }, []);
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchTopics(nextPage, true);
            }
        }, { threshold: 1.0 });
        if (observerTarget.current)
            observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [page, hasMore, isLoading, activeTagFilter, searchQuery]);
    const togglePin = async (id, e) => {
        e.preventDefault();
        try {
            const resp = await forumApi.togglePin(id);
            setTopics(prev => prev.map(t => t.id === id ? { ...t, is_pinned: resp.data.is_pinned } : t));
        }
        catch { }
    };
    const deleteTopic = async (id, e) => {
        e.preventDefault();
        try {
            await forumApi.deleteTopic(id);
            setTopics(prev => prev.filter(t => t.id !== id));
        }
        catch { }
    };
    const handleCreateTopic = async () => {
        if (!newTitle.trim() || !newContent.trim() || !newTag)
            return;
        try {
            const resp = await forumApi.createTopic({ title: newTitle, content: newContent, tag: newTag });
            setTopics(prev => [resp.data, ...prev]);
            setShowNewTopic(false);
            setNewTitle('');
            setNewContent('');
            setNewTag(null);
        }
        catch { }
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: "\u0424\u043E\u0440\u0443\u043C \u0410\u0431\u0437\u0430\u0446" }), _jsx("p", { className: "text-secondary", children: "\u041E\u0431\u0441\u0443\u0436\u0434\u0430\u0439\u0442\u0435 \u043A\u043D\u0438\u0433\u0438 \u0438 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0435 \u0435\u0434\u0438\u043D\u043E\u043C\u044B\u0448\u043B\u0435\u043D\u043D\u0438\u043A\u043E\u0432" })] }), isLoggedIn && (_jsxs("button", { onClick: () => setShowNewTopic(true), className: "flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95", children: [_jsx(Plus, { className: "w-5 h-5" }), " \u041D\u043E\u0432\u0430\u044F \u0442\u0435\u043C\u0430"] }))] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-8", children: [_jsxs("div", { className: "lg:col-span-3 space-y-4", children: [(topics || []).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)).map((topic) => (_jsxs(Link, { to: `/forum/topic/${topic.id}`, className: "block p-6 bg-primary border border-base rounded-2xl hover:border-accent transition-all group relative", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 mb-3", children: [_jsxs("div", { className: "flex flex-wrap gap-2 pr-20", children: [topic.is_pinned && _jsx("span", { className: "p-1 bg-amber-500/10 text-amber-500 rounded", children: _jsx(Pin, { className: "w-4 h-4" }) }), topic.is_locked && _jsx("span", { className: "p-1 bg-secondary text-secondary rounded", children: _jsx(Lock, { className: "w-4 h-4" }) }), _jsx("h3", { className: "text-lg font-bold group-hover:text-accent transition-colors", children: topic.title })] }), _jsxs("div", { className: "absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [isLoggedIn && (_jsx("button", { onClick: (e) => openReportTopic(topic.id, e), className: "p-2 rounded-lg border border-base bg-primary hover:bg-amber-500/10 text-secondary hover:text-amber-500", title: "\u041F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C\u0441\u044F", children: _jsx(Flag, { className: "w-4 h-4" }) })), isAdmin && isLoggedIn && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: (e) => togglePin(topic.id, e), className: clsx("p-2 rounded-lg border border-base bg-primary hover:bg-amber-500/10", topic.is_pinned ? "text-amber-500 border-amber-500/30" : "text-secondary hover:text-amber-500"), title: topic.is_pinned ? "Открепить" : "Закрепить", children: _jsx(Pin, { className: "w-4 h-4" }) }), _jsx("button", { onClick: (e) => deleteTopic(topic.id, e), className: "p-2 rounded-lg border border-base bg-primary hover:bg-rose-500/10 text-secondary hover:text-rose-500", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }))] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4 text-xs text-secondary", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(MessageCircle, { className: "w-4 h-4" }), " ", topic.replies_count, " \u043E\u0442\u0432\u0435\u0442\u043E\u0432"] }), _jsxs("div", { children: ["\u0410\u0432\u0442\u043E\u0440: ", topic.author_name] })] }), _jsx("span", { className: "px-2 py-1 bg-secondary text-[10px] font-bold rounded uppercase", children: topic.tag })] })] }, topic.id))), _jsx("div", { ref: observerTarget, className: "flex justify-center py-8", children: isLoading && _jsx(Loader2, { className: "w-6 h-6 animate-spin text-accent" }) })] }), _jsx("aside", { className: "space-y-6", children: _jsxs("div", { className: "p-6 bg-secondary rounded-2xl border border-base sticky top-24", children: [_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary mb-2 block", children: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0444\u043E\u0440\u0443\u043C\u0443" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" }), _jsx("input", { type: "text", placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0443 \u0442\u0435\u043C\u044B...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyDown: (e) => {
                                                        if (e.key === 'Enter') {
                                                            setPage(1);
                                                            setHasMore(true);
                                                            fetchTopics(1, false, { search: searchQuery });
                                                        }
                                                    }, className: "w-full pl-9 pr-4 py-2 bg-primary border border-base rounded-xl text-sm outline-none focus:border-accent transition-all" })] })] }), _jsx("h4", { className: "font-bold mb-4", children: "\u0424\u0438\u043B\u044C\u0442\u0440 \u043F\u043E \u0442\u0435\u0433\u0430\u043C" }), _jsx("div", { className: "flex flex-wrap gap-2", children: tags.map(t => (_jsx("button", { onClick: () => {
                                            const nextTag = activeTagFilter === t ? null : t;
                                            setActiveTagFilter(nextTag);
                                            setPage(1);
                                            setHasMore(true);
                                            fetchTopics(1, false, { tag: nextTag });
                                        }, className: clsx("px-3 py-1.5 border rounded-lg text-xs transition-colors", activeTagFilter === t ? "bg-accent text-white border-accent" : "bg-primary border-base hover:border-accent"), children: t }, t))) })] }) })] }), _jsx(AnimatePresence, { children: showNewTopic && isLoggedIn && (_jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setShowNewTopic(false), className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 20 }, className: "relative w-full max-w-lg bg-primary rounded-3xl p-8 shadow-2xl border border-base", children: [_jsx("button", { onClick: () => setShowNewTopic(false), className: "absolute top-6 right-6 text-secondary hover:text-primary transition-colors", children: _jsx(X, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-black mb-6", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u0443\u044E \u0442\u0435\u043C\u0443" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary mb-2 block", children: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0442\u0435\u043C\u044B" }), _jsx("input", { type: "text", value: newTitle, onChange: (e) => setNewTitle(e.target.value), placeholder: "\u041E \u0447\u0435\u043C \u0432\u044B \u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u043E\u0433\u043E\u0432\u043E\u0440\u0438\u0442\u044C?", className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary mb-2 block", children: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435" }), _jsx("textarea", { value: newContent, onChange: (e) => setNewContent(e.target.value), placeholder: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u0432\u0430\u0448\u0443 \u0438\u0434\u0435\u044E \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435...", className: "w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all min-h-[150px]" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase text-secondary mb-2 block", children: "\u0422\u0435\u0433 \u0442\u0435\u043C\u044B" }), _jsx("div", { className: "flex flex-wrap gap-2", children: tags.map(t => (_jsx("button", { onClick: () => setNewTag(newTag === t ? null : t), className: clsx("px-3 py-1.5 rounded-lg text-xs font-bold transition-all border", newTag === t ? "bg-accent text-white border-accent" : "bg-secondary text-secondary border-base hover:border-accent/30"), children: t }, t))) })] }), _jsx("div", { className: "pt-2", children: _jsxs("button", { onClick: handleCreateTopic, className: "w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:opacity-90 transition-all", children: [_jsx(Send, { className: "w-5 h-5" }), " \u041E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u0442\u044C \u0442\u0435\u043C\u0443"] }) })] })] })] })) }), _jsx(AnimatePresence, { children: showReportModal && (_jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setShowReportModal(false), className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base", children: [_jsx("button", { onClick: () => setShowReportModal(false), className: "absolute top-6 right-6 text-secondary hover:text-primary", children: _jsx(X, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-black mb-2", children: "\u041F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 \u0442\u0435\u043C\u0443" }), _jsx("p", { className: "text-secondary text-sm mb-6", children: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u043F\u0440\u0438\u0447\u0438\u043D\u0443 \u0436\u0430\u043B\u043E\u0431\u044B" }), reportSuccess ? (_jsx("div", { className: "p-4 bg-green-500/10 text-green-500 rounded-xl text-sm font-medium text-center", children: "\u2713 \u0416\u0430\u043B\u043E\u0431\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430" })) : (_jsxs("div", { className: "space-y-4", children: [reportError && _jsx("div", { className: "p-3 bg-rose-500/10 text-rose-500 text-sm rounded-xl", children: reportError }), _jsx("textarea", { value: reportReason, onChange: (e) => setReportReason(e.target.value), placeholder: "\u041F\u0440\u0438\u0447\u0438\u043D\u0430 \u0436\u0430\u043B\u043E\u0431\u044B...", className: "w-full p-4 bg-secondary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-24" }), _jsx("button", { onClick: submitTopicReport, disabled: !reportReason.trim(), className: clsx("w-full py-3 rounded-xl font-bold transition-all", reportReason.trim() ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-secondary text-secondary cursor-not-allowed"), children: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0436\u0430\u043B\u043E\u0431\u0443" })] }))] })] })) })] }));
};
