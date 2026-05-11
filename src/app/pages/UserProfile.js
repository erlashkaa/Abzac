import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MessageCircle, Hash, ChevronLeft, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { AVATAR_PLACEHOLDER } from '../constants';
import { usersApi } from '../api/usersApi';
import { getDemoUserProfile } from '../demo/demoData';
export const UserProfile = () => {
    const { id } = useParams();
    const userId = Number(id);
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [comments, setComments] = useState([]);
    const [topics, setTopics] = useState([]);
    const [activeTab, setActiveTab] = useState('reviews');
    const [error, setError] = useState(false);
    useEffect(() => {
        if (!userId)
            return;
        usersApi.getUserProfile(userId).then(r => {
            setProfile(r.data.user);
            setReviews(r.data.reviews);
            setComments(r.data.comments);
            setTopics(r.data.topics);
        }).catch(() => {
            const demo = getDemoUserProfile(userId);
            if (demo) {
                setProfile(demo.user);
                setReviews(demo.reviews);
                setComments(demo.comments);
                setTopics(demo.topics);
                setError(false);
                return;
            }
            setError(true);
        });
    }, [userId]);
    if (error) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold mb-2", children: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" }), _jsx(Link, { to: "/", className: "text-accent hover:underline", children: "\u041D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E" })] }) }));
    }
    if (!profile) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" }) }));
    }
    const tabs = [
        { key: 'reviews', label: 'Отзывы', icon: Star, count: reviews.length },
        { key: 'comments', label: 'Комментарии', icon: MessageCircle, count: comments.length },
        { key: 'topics', label: 'Форум', icon: Hash, count: topics.length },
    ];
    return (_jsxs("div", { className: "container mx-auto px-4 py-8 max-w-5xl", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 text-sm text-secondary hover:text-accent mb-6 transition-colors group", children: [_jsx(ChevronLeft, { className: "w-4 h-4 transition-transform group-hover:-translate-x-1" }), " \u041D\u0430\u0437\u0430\u0434"] }), _jsxs("div", { className: "relative mb-20", children: [_jsx("div", { className: "h-60 rounded-3xl overflow-hidden bg-gradient-to-r from-accent/20 via-accent/5 to-accent/20", children: profile.banner && _jsx("img", { src: profile.banner, alt: "", className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "absolute -bottom-16 left-8 flex items-end gap-6", children: [_jsx("div", { className: "w-32 h-32 rounded-2xl overflow-hidden border-4 border-primary bg-secondary shadow-xl", children: _jsx("img", { src: profile.avatar || AVATAR_PLACEHOLDER, alt: profile.username, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "pb-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h1", { className: "text-3xl font-black", children: profile.username }), profile.role === 'admin' && (_jsx("span", { className: "px-2 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase", children: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440" }))] }), _jsxs("p", { className: "text-secondary text-sm flex items-center gap-1 mt-1", children: [_jsx(Calendar, { className: "w-3.5 h-3.5" }), "\u041D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435 \u0441 ", new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-8 bg-secondary p-4 rounded-2xl border border-base", children: [_jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "text-2xl font-bold", children: reviews.length }), _jsx("div", { className: "text-xs text-secondary uppercase font-bold", children: "\u041E\u0442\u0437\u044B\u0432\u043E\u0432" })] }), _jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "text-2xl font-bold", children: comments.length }), _jsx("div", { className: "text-xs text-secondary uppercase font-bold", children: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0435\u0432" })] }), _jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "text-2xl font-bold", children: topics.length }), _jsx("div", { className: "text-xs text-secondary uppercase font-bold", children: "\u0422\u0435\u043C \u043D\u0430 \u0444\u043E\u0440\u0443\u043C\u0435" })] })] }), profile.about && (_jsxs("div", { className: "mb-8 p-6 bg-secondary rounded-2xl border border-base", children: [_jsx("h3", { className: "font-bold mb-2", children: "\u041E \u0441\u0435\u0431\u0435" }), _jsx("p", { className: "text-secondary", children: profile.about })] })), _jsx("div", { className: "border-b border-base flex gap-8 mb-6", children: tabs.map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab.key), className: clsx("pb-4 text-sm font-bold transition-all relative flex items-center gap-2", activeTab === tab.key ? "text-primary" : "text-secondary"), children: [_jsx(tab.icon, { className: "w-4 h-4" }), tab.label, " (", tab.count, ")", activeTab === tab.key && (_jsx(motion.div, { layoutId: "profileTab", className: "absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" }))] }, tab.key))) }), _jsxs("div", { className: "min-h-[200px]", children: [activeTab === 'reviews' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4", children: reviews.length === 0 ? (_jsxs("div", { className: "text-center py-16 text-secondary", children: [_jsx(Star, { className: "w-12 h-12 mx-auto mb-3 opacity-20" }), _jsx("p", { children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043E\u0442\u0437\u044B\u0432\u043E\u0432" })] })) : (reviews.map(review => (_jsxs("div", { className: "p-5 bg-secondary rounded-xl border border-base", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [review.book_title && (_jsxs(Link, { to: `/reader?bookId=${review.book_id}`, className: "text-xs font-bold text-secondary hover:text-accent mb-2 inline-block transition-colors", children: ["\u041E\u0442\u0437\u044B\u0432 \u043D\u0430 \u043A\u043D\u0438\u0433\u0443 \u00AB", review.book_title, "\u00BB"] })), _jsx("div", { className: "flex items-center gap-1 text-accent", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: clsx("w-4 h-4", i < review.rating ? "fill-current" : "text-base opacity-30") }, i))) })] }), _jsx("span", { className: "text-xs text-secondary", children: new Date(review.created_at).toLocaleDateString('ru-RU') })] }), _jsx("p", { className: "text-sm leading-relaxed", children: review.text })] }, review.id)))) })), activeTab === 'comments' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4", children: comments.length === 0 ? (_jsxs("div", { className: "text-center py-16 text-secondary", children: [_jsx(MessageCircle, { className: "w-12 h-12 mx-auto mb-3 opacity-20" }), _jsx("p", { children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0435\u0432" })] })) : (comments.map(comment => (_jsxs("div", { className: "p-4 bg-secondary rounded-xl border border-base", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("div", { children: comment.topic_id ? (_jsxs(Link, { to: `/forum/topic/${comment.topic_id}`, className: "text-xs font-bold text-secondary hover:text-accent block transition-colors", children: ["\u0412 \u0442\u0435\u043C\u0435: \u00AB", comment.topic_title, "\u00BB"] })) : comment.book_title ? (_jsxs(Link, { to: `/reader?bookId=${comment.book_id}`, className: "text-xs font-bold text-secondary hover:text-accent block transition-colors", children: ["\u041A \u043A\u043D\u0438\u0433\u0435: \u00AB", comment.book_title, "\u00BB"] })) : null }), _jsx("span", { className: "text-xs text-secondary shrink-0 ml-4", children: new Date(comment.created_at).toLocaleString('ru-RU') })] }), _jsx("p", { className: "text-sm leading-relaxed mt-1", children: comment.content })] }, comment.id)))) })), activeTab === 'topics' && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-4", children: topics.length === 0 ? (_jsxs("div", { className: "text-center py-16 text-secondary", children: [_jsx(Hash, { className: "w-12 h-12 mx-auto mb-3 opacity-20" }), _jsx("p", { children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0442\u0435\u043C \u043D\u0430 \u0444\u043E\u0440\u0443\u043C\u0435" })] })) : (topics.map(topic => (_jsxs(Link, { to: `/forum/topic/${topic.id}`, className: "block p-4 bg-secondary rounded-xl border border-base hover:border-accent/30 transition-colors", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h4", { className: "font-bold text-accent", children: topic.title }), _jsx("span", { className: "text-xs text-secondary", children: new Date(topic.created_at).toLocaleDateString('ru-RU') })] }), _jsx("span", { className: "px-2 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-bold uppercase", children: topic.tag })] }, topic.id)))) }))] })] }));
};
