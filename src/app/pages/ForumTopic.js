import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ThumbsUp, ThumbsDown, Trash2, Pin, Send, Flag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVATAR_PLACEHOLDER } from '../constants';
import { useAuth } from '../context/AuthContext';
import { forumApi } from '../api/forumApi';
import { clsx } from 'clsx';
export const ForumTopic = () => {
    const { id } = useParams();
    const topicId = Number(id);
    const { isLoggedIn, user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [topic, setTopic] = useState(null);
    const [messages, setMessages] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [newMessage, setNewMessage] = useState('');
    // Report
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTargetId, setReportTargetId] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportError, setReportError] = useState('');
    useEffect(() => {
        if (!topicId)
            return;
        forumApi.getTopic(topicId).then(r => {
            setTopic(r.data.topic);
            setMessages(r.data.messages);
        }).catch(() => { });
    }, [topicId]);
    const handleReaction = async (messageId, type) => {
        if (!isLoggedIn)
            return;
        try {
            const resp = await forumApi.reactToMessage(messageId, type);
            setMessages(prev => prev.map(m => {
                if (m.id !== messageId)
                    return m;
                return {
                    ...m,
                    likes: resp.data.likes,
                    dislikes: resp.data.dislikes,
                    liked_by_user: type === 'like' ? !m.liked_by_user : false,
                    disliked_by_user: type === 'dislike' ? !m.disliked_by_user : false,
                };
            }));
        }
        catch { }
    };
    const handleDeleteMessage = async (messageId) => {
        try {
            await forumApi.deleteMessage(messageId);
            setMessages(prev => prev.filter(m => m.id !== messageId));
        }
        catch { }
    };
    const handleSendReply = async (parentId) => {
        if (!isLoggedIn || !replyText.trim())
            return;
        const parentMsg = messages.find(m => m.id === parentId);
        const nickname = parentMsg ? `${parentMsg.author_name}, ` : '';
        try {
            const resp = await forumApi.createMessage(topicId, { content: nickname + replyText, parent_id: parentId });
            setMessages(prev => [...prev, resp.data]);
            setReplyText('');
            setReplyingTo(null);
        }
        catch { }
    };
    const handleSendMessage = async () => {
        if (!isLoggedIn || !newMessage.trim())
            return;
        try {
            const resp = await forumApi.createMessage(topicId, { content: newMessage });
            setMessages(prev => [...prev, resp.data]);
            setNewMessage('');
        }
        catch { }
    };
    const handleTogglePin = async () => {
        if (!topic)
            return;
        try {
            const resp = await forumApi.togglePin(topicId);
            setTopic((prev) => prev ? { ...prev, is_pinned: resp.data.is_pinned } : prev);
        }
        catch { }
    };
    const handleDeleteTopic = async () => {
        try {
            await forumApi.deleteTopic(topicId);
            window.location.href = '/forum';
        }
        catch { }
    };
    const openReportModal = (messageId) => {
        setReportTargetId(messageId);
        setReportReason('');
        setReportSuccess(false);
        setReportError('');
        setShowReportModal(true);
    };
    const submitReport = async () => {
        if (!reportTargetId || !reportReason.trim())
            return;
        try {
            await forumApi.reportMessage(reportTargetId, reportReason);
            setReportSuccess(true);
            setTimeout(() => setShowReportModal(false), 1500);
        }
        catch (e) {
            setReportError(e.response?.data?.detail || 'Ошибка при отправке жалобы');
        }
    };
    if (!topic) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8 max-w-5xl", children: [_jsxs(Link, { to: "/forum", className: "inline-flex items-center gap-2 text-sm text-secondary hover:text-accent mb-6 transition-colors group", children: [_jsx(ChevronLeft, { className: "w-4 h-4 transition-transform group-hover:-translate-x-1" }), " \u041D\u0430\u0437\u0430\u0434 \u043A \u0441\u043F\u0438\u0441\u043A\u0443 \u0442\u0435\u043C"] }), _jsxs("div", { className: "flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex gap-2 mb-2", children: [topic.is_pinned && (_jsxs("span", { className: "p-1 bg-amber-500/10 text-amber-500 rounded text-xs flex items-center gap-1 font-bold", children: [_jsx(Pin, { className: "w-3 h-3" }), " \u0417\u0430\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u043E"] })), _jsx("span", { className: "px-2 py-1 bg-secondary text-secondary rounded text-[10px] font-bold uppercase tracking-wider", children: topic.tag })] }), _jsx("h1", { className: "text-3xl font-black", children: topic.title })] }), isLoggedIn && isAdmin && (_jsxs("div", { className: "flex gap-2 shrink-0", children: [_jsxs("button", { onClick: handleTogglePin, className: "flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:text-amber-500 transition-colors text-sm font-bold border border-base", children: [_jsx(Pin, { className: "w-4 h-4" }), " ", topic.is_pinned ? 'Открепить' : 'Закрепить'] }), _jsxs("button", { onClick: handleDeleteTopic, className: "flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:text-rose-500 transition-colors text-sm font-bold border border-base", children: [_jsx(Trash2, { className: "w-4 h-4" }), " \u0423\u0434\u0430\u043B\u0438\u0442\u044C"] })] }))] }), _jsx("div", { className: "space-y-6 mb-12", children: messages.map((msg) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "flex flex-col md:flex-row gap-6 p-6 bg-primary border border-base rounded-3xl", children: [_jsxs("div", { className: "md:w-32 shrink-0 flex flex-col items-center gap-3", children: [_jsx(Link, { to: `/user/${msg.author_id}`, className: "block", children: _jsx("div", { className: "w-16 h-16 rounded-2xl overflow-hidden border-2 border-base hover:border-accent transition-colors", children: _jsx("img", { src: msg.author_avatar || AVATAR_PLACEHOLDER, alt: "", className: "w-full h-full object-cover" }) }) }), _jsxs("div", { className: "text-center", children: [_jsx(Link, { to: `/user/${msg.author_id}`, className: "font-bold text-sm truncate w-24 block hover:text-accent transition-colors", children: msg.author_name }), _jsx("span", { className: `text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${msg.author_role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-secondary text-secondary'}`, children: msg.author_role === 'admin' ? 'Модератор' : 'Участник' })] })] }), _jsxs("div", { className: "flex-1 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-secondary mb-3", children: new Date(msg.created_at).toLocaleString('ru-RU') }), _jsx("div", { className: "text-lg leading-relaxed", children: msg.content })] }), _jsxs("div", { className: "flex items-center justify-between mt-6 pt-6 border-t border-base", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { type: "button", onClick: () => handleReaction(msg.id, 'like'), className: clsx("flex items-center gap-1 text-sm font-medium transition-colors", msg.liked_by_user ? 'text-accent' : 'text-secondary hover:text-accent', !isLoggedIn && 'opacity-50 cursor-not-allowed'), children: [_jsx(ThumbsUp, { className: "w-4 h-4" }), " ", msg.likes] }), _jsxs("button", { type: "button", onClick: () => handleReaction(msg.id, 'dislike'), className: clsx("flex items-center gap-1 text-sm font-medium transition-colors", msg.disliked_by_user ? 'text-rose-500' : 'text-secondary hover:text-rose-500', !isLoggedIn && 'opacity-50 cursor-not-allowed'), children: [msg.dislikes, " ", _jsx(ThumbsDown, { className: "w-4 h-4" })] }), isLoggedIn && (_jsx("button", { onClick: () => setReplyingTo(replyingTo === msg.id ? null : msg.id), className: "text-sm font-bold text-accent ml-2", children: "\u041E\u0442\u0432\u0435\u0442\u0438\u0442\u044C" })), isLoggedIn && user?.id !== msg.author_id && (_jsx("button", { onClick: () => openReportModal(msg.id), className: "flex items-center gap-1 text-xs text-secondary hover:text-amber-500 transition-colors ml-2", title: "\u041F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C\u0441\u044F", children: _jsx(Flag, { className: "w-3.5 h-3.5" }) }))] }), isLoggedIn && (isAdmin || user?.id === msg.author_id) && (_jsx("button", { onClick: () => handleDeleteMessage(msg.id), className: "p-2 text-secondary hover:text-rose-500 transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) }))] }), isLoggedIn && replyingTo === msg.id && (_jsxs("div", { className: "mt-4 pl-8 space-y-3 border-l-2 border-accent/20", children: [_jsx("textarea", { value: replyText, onChange: (e) => setReplyText(e.target.value), placeholder: "\u041D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u043E\u0442\u0432\u0435\u0442...", className: "w-full p-4 bg-secondary border border-base rounded-2xl outline-none focus:ring-2 focus:ring-accent min-h-[100px] text-sm" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => handleSendReply(msg.id), className: "px-4 py-2 bg-accent text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg", children: [_jsx(Send, { className: "w-4 h-4" }), " \u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C"] }), _jsx("button", { onClick: () => { setReplyText(''); setReplyingTo(null); }, className: "px-4 py-2 bg-secondary border border-base rounded-xl font-bold text-sm", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] }))] })] }, msg.id))) }), isLoggedIn && !topic.is_locked && (_jsxs("div", { className: "p-8 bg-secondary rounded-3xl border border-base", children: [_jsx("h3", { className: "font-bold mb-4", children: "\u0412\u0430\u0448 \u043E\u0442\u0432\u0435\u0442" }), _jsxs("div", { className: "relative", children: [_jsx("textarea", { value: newMessage, onChange: (e) => setNewMessage(e.target.value), placeholder: "\u041D\u0430\u043F\u0438\u0448\u0438\u0442\u0435, \u0447\u0442\u043E \u0432\u044B \u0434\u0443\u043C\u0430\u0435\u0442\u0435...", className: "w-full p-4 bg-primary border border-base rounded-2xl outline-none focus:ring-2 focus:ring-accent min-h-[150px] transition-all" }), _jsxs("button", { onClick: handleSendMessage, className: "absolute bottom-4 right-4 px-6 py-2 bg-accent text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-accent/20", children: [_jsx(Send, { className: "w-4 h-4" }), " \u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C"] })] })] })), _jsx(AnimatePresence, { children: showReportModal && (_jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setShowReportModal(false), className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base", children: [_jsx("button", { onClick: () => setShowReportModal(false), className: "absolute top-6 right-6 text-secondary hover:text-primary", children: _jsx(X, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-black mb-2", children: "\u041F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C\u0441\u044F" }), _jsx("p", { className: "text-secondary text-sm mb-6", children: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u043F\u0440\u0438\u0447\u0438\u043D\u0443 \u0436\u0430\u043B\u043E\u0431\u044B \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435" }), reportSuccess ? (_jsx("div", { className: "p-4 bg-green-500/10 text-green-500 rounded-xl text-sm font-medium text-center", children: "\u2713 \u0416\u0430\u043B\u043E\u0431\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430" })) : (_jsxs("div", { className: "space-y-4", children: [reportError && _jsx("div", { className: "p-3 bg-rose-500/10 text-rose-500 text-sm rounded-xl", children: reportError }), _jsx("textarea", { value: reportReason, onChange: (e) => setReportReason(e.target.value), placeholder: "\u041F\u0440\u0438\u0447\u0438\u043D\u0430 \u0436\u0430\u043B\u043E\u0431\u044B...", className: "w-full p-4 bg-secondary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-24" }), _jsx("button", { onClick: submitReport, disabled: !reportReason.trim(), className: clsx("w-full py-3 rounded-xl font-bold transition-all", reportReason.trim() ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-secondary text-secondary cursor-not-allowed"), children: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0436\u0430\u043B\u043E\u0431\u0443" })] }))] })] })) })] }));
};
