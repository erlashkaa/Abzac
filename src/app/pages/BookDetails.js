import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { booksApi } from '../api/booksApi';
import { reviewsApi } from '../api/reviewsApi';
import { commentsApi } from '../api/commentsApi';
import { usersApi } from '../api/usersApi';
import { Rating } from '../components/Rating';
import { Heart, Share2, BookOpen, MessageSquare, Star, ThumbsUp, ThumbsDown, Trash2, Send, X, Copy, Check, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { AVATAR_PLACEHOLDER } from '../constants';
import { useAuth } from '../context/AuthContext';
import { getDemoBook, getDemoReviews, isDemoId } from '../demo/demoData';
import { toast } from 'sonner';
export const BookDetails = () => {
    const { id } = useParams();
    const bookId = Number(id);
    const [book, setBook] = useState(null);
    const [activeTab, setActiveTab] = useState('desc');
    const [isFavorite, setIsFavorite] = useState(false);
    const { isLoggedIn, user, refreshUser } = useAuth();
    // Reviews
    const [reviews, setReviews] = useState([]);
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewText, setNewReviewText] = useState('');
    // Comments
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    // Share modal
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    // Report modal
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportError, setReportError] = useState('');
    const [isPurchasing, setIsPurchasing] = useState(false);
    useEffect(() => {
        if (!bookId)
            return;
        booksApi
            .getBook(bookId)
            .then(r => setBook(r.data))
            .catch(() => {
            const demo = getDemoBook(bookId);
            if (demo)
                setBook(demo);
        });
        reviewsApi
            .getReviews(bookId)
            .then(r => setReviews(r.data))
            .catch(() => {
            const demoReviews = getDemoReviews(bookId);
            if (demoReviews.length)
                setReviews(demoReviews);
        });
        commentsApi.getComments(bookId).then(r => setComments(r.data)).catch(() => { });
    }, [bookId]);
    useEffect(() => {
        if (isLoggedIn && bookId) {
            if (isDemoId(bookId))
                return;
            usersApi.checkFavorite(bookId).then(r => setIsFavorite(r.data.is_favorite)).catch(() => { });
        }
    }, [isLoggedIn, bookId]);
    const toggleFavorite = async () => {
        if (!isLoggedIn)
            return;
        if (isDemoId(bookId))
            return;
        try {
            if (isFavorite) {
                await usersApi.removeFavorite(bookId);
                setIsFavorite(false);
            }
            else {
                await usersApi.addFavorite(bookId);
                setIsFavorite(true);
            }
        }
        catch { }
    };
    const handleReviewReaction = async (reviewId, type) => {
        if (!isLoggedIn)
            return;
        try {
            const resp = await reviewsApi.reactToReview(reviewId, type);
            setReviews(prev => prev.map(r => {
                if (r.id !== reviewId)
                    return r;
                const wasLiked = r.liked_by_user;
                const wasDisliked = r.disliked_by_user;
                return {
                    ...r,
                    likes: resp.data.likes,
                    dislikes: resp.data.dislikes,
                    liked_by_user: type === 'like' ? !wasLiked : false,
                    disliked_by_user: type === 'dislike' ? !wasDisliked : false,
                };
            }));
        }
        catch { }
    };
    const submitReview = async () => {
        if (!isLoggedIn || !newReviewText.trim())
            return;
        try {
            const resp = await reviewsApi.createReview(bookId, { rating: newReviewRating, text: newReviewText });
            setReviews(prev => [resp.data, ...prev]);
            setNewReviewText('');
            setNewReviewRating(5);
        }
        catch { }
    };
    const handleCommentReaction = async (commentId, type) => {
        if (!isLoggedIn)
            return;
        try {
            const resp = await commentsApi.reactToComment(commentId, type);
            setComments(prev => prev.map(c => {
                if (c.id !== commentId)
                    return c;
                return {
                    ...c,
                    likes: resp.data.likes,
                    dislikes: resp.data.dislikes,
                    liked_by_user: type === 'like' ? !c.liked_by_user : false,
                    disliked_by_user: type === 'dislike' ? !c.disliked_by_user : false,
                };
            }));
        }
        catch { }
    };
    const submitComment = async () => {
        if (!isLoggedIn || !commentText.trim())
            return;
        try {
            const resp = await commentsApi.createComment(bookId, { content: commentText });
            setComments(prev => [resp.data, ...prev]);
            setCommentText('');
        }
        catch { }
    };
    const handlePurchase = async () => {
        if (!isLoggedIn) {
            toast.error('Нужно войти в аккаунт');
            return;
        }
        if (!book)
            return;
        if (book.is_free === true || book.purchased === true)
            return;
        if (isDemoId(bookId))
            return;
        setIsPurchasing(true);
        try {
            const resp = await booksApi.purchaseBook(bookId);
            setBook(resp.data);
            // Баланс меняется на бэкенде, но в UI он берётся из профиля — обновим его.
            await refreshUser();
            toast.success('Книга куплена');
        }
        catch (e) {
            const msg = e?.response?.data?.message || e?.message || 'Не удалось купить книгу';
            toast.error(msg);
        }
        finally {
            setIsPurchasing(false);
        }
    };
    const submitReply = async (parentId) => {
        if (!isLoggedIn || !replyText.trim())
            return;
        const parentComment = comments.find(c => c.id === parentId);
        const nickname = parentComment ? `${parentComment.user_name}, ` : '';
        try {
            await commentsApi.createComment(bookId, { content: nickname + replyText, parent_id: parentId });
            // Refresh comments
            const resp = await commentsApi.getComments(bookId);
            setComments(resp.data);
            setReplyText('');
            setReplyingTo(null);
        }
        catch { }
    };
    const deleteComment = async (commentId) => {
        try {
            await commentsApi.deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        }
        catch { }
    };
    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch { }
    };
    const openReportModal = (type, targetId) => {
        setReportTarget({ type, id: targetId });
        setReportReason('');
        setReportSuccess(false);
        setReportError('');
        setShowReportModal(true);
    };
    const submitReport = async () => {
        if (!reportTarget || !reportReason.trim())
            return;
        try {
            if (reportTarget.type === 'comment') {
                await commentsApi.reportComment(reportTarget.id, reportReason);
            }
            else {
                await reviewsApi.reportReview(reportTarget.id, reportReason);
            }
            setReportSuccess(true);
            setTimeout(() => setShowReportModal(false), 1500);
        }
        catch (e) {
            setReportError(e.response?.data?.detail || 'Ошибка при отправке жалобы');
        }
    };
    if (!book) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" }) }));
    }
    const isAdminReader = user?.role === 'admin';
    const canReadFull = book.is_free === true || book.purchased === true || isAdminReader;
    const price = Number(book.retail_price ?? 0);
    return (_jsxs("div", { className: "min-h-screen bg-primary", children: [_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-12", children: [_jsxs("div", { className: "w-full lg:w-80 shrink-0 space-y-6", children: [_jsx("div", { className: "aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-base", children: _jsx("img", { src: book.cover, alt: book.title, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex flex-col gap-3", children: [canReadFull ? (_jsxs(Link, { to: `/reader?bookId=${book.id}`, className: "w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20", children: [_jsx(BookOpen, { className: "w-5 h-5" }), " \u0427\u0438\u0442\u0430\u0442\u044C \u043A\u043D\u0438\u0433\u0443"] })) : (_jsxs("div", { className: "rounded-2xl border border-base bg-secondary/40 p-4", children: [_jsx("div", { className: "text-center text-sm text-secondary", children: price > 0
                                                        ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price)
                                                        : 'Цена не указана' }), _jsx("button", { type: "button", disabled: isPurchasing || price <= 0, onClick: handlePurchase, className: "mt-3 w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-60", children: isPurchasing ? 'Покупка…' : 'Купить' })] })), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { type: "button", onClick: toggleFavorite, className: clsx("py-3 border border-base rounded-xl font-medium flex items-center justify-center gap-2 transition-colors", isLoggedIn ? "hover:bg-secondary" : "opacity-50 cursor-not-allowed", isFavorite && "bg-blue-600 text-white border-blue-600 hover:bg-blue-600"), children: [_jsx(Heart, { className: "w-4 h-4" }), " ", isFavorite ? 'В избранном' : 'В избранное'] }), _jsxs("button", { onClick: () => setShowShareModal(true), className: "py-3 border border-base rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-colors", children: [_jsx(Share2, { className: "w-4 h-4" }), " \u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F"] })] })] }), _jsxs("div", { className: "p-4 bg-secondary rounded-xl border border-base space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-secondary", children: "\u0413\u043E\u0434 \u0438\u0437\u0434\u0430\u043D\u0438\u044F" }), _jsx("span", { className: "font-medium", children: book.year })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-secondary", children: "\u0416\u0430\u043D\u0440" }), _jsx("span", { className: "font-medium text-accent", children: book.genre })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-secondary", children: "\u0412\u043E\u0437\u0440\u0430\u0441\u0442\u043D\u043E\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435" }), _jsx("span", { className: "font-medium", children: "16+" })] })] })] }), _jsxs("div", { className: "flex-1 space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-black mb-2", children: book.title }), _jsx("p", { className: "text-xl text-secondary font-medium mb-6", children: book.author }), _jsxs("div", { className: "flex flex-wrap items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "text-3xl font-bold", children: book.rating }), _jsxs("div", { className: "flex flex-col", children: [_jsx(Rating, { rating: book.rating, size: 16 }), _jsxs("span", { className: "text-xs text-secondary", children: [book.reviews_count, " \u043E\u0442\u0437\u044B\u0432\u043E\u0432"] })] })] }), _jsx("div", { className: "h-10 w-px bg-border-color" }), _jsx("div", { className: "flex gap-2", children: book.tags.map(tag => (_jsxs("span", { className: "px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full", children: ["#", tag] }, tag))) })] })] }), _jsx("div", { className: "border-b border-base flex gap-8", children: ['desc', 'reviews', 'comments'].map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab), className: clsx("pb-4 text-sm font-bold transition-all relative", activeTab === tab ? "text-primary" : "text-secondary"), children: [tab === 'desc' ? 'О книге' : tab === 'reviews' ? `Отзывы (${reviews.length})` : `Комментарии (${comments.length})`, activeTab === tab && (_jsx(motion.div, { layoutId: "activeTab", className: "absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" }))] }, tab))) }), _jsxs("div", { className: "min-h-[300px]", children: [activeTab === 'desc' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-6", children: [_jsx("p", { className: "text-lg leading-relaxed text-secondary", children: book.description }), _jsxs("div", { className: "p-6 bg-secondary/50 rounded-2xl border border-dashed border-base", children: [_jsx("h3", { className: "font-bold mb-3", children: "\u041F\u043E\u0447\u0435\u043C\u0443 \u0441\u0442\u043E\u0438\u0442 \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C?" }), _jsxs("ul", { className: "space-y-2 text-sm text-secondary list-disc pl-4", children: [_jsx("li", { children: "\u0423\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0430\u0432\u0442\u043E\u0440\u0441\u043A\u0438\u0439 \u0441\u0442\u0438\u043B\u044C \u0438 \u0433\u043B\u0443\u0431\u043E\u043A\u0430\u044F \u043F\u0440\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0435\u0439." }), _jsx("li", { children: "\u0417\u0430\u0445\u0432\u0430\u0442\u044B\u0432\u0430\u044E\u0449\u0438\u0439 \u0441\u044E\u0436\u0435\u0442 \u0441 \u043D\u0435\u043E\u0436\u0438\u0434\u0430\u043D\u043D\u044B\u043C\u0438 \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u0430\u043C\u0438." }), _jsx("li", { children: "\u0410\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u044B\u0435 \u0442\u0435\u043C\u044B, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0437\u0430\u0441\u0442\u0430\u0432\u043B\u044F\u044E\u0442 \u0437\u0430\u0434\u0443\u043C\u0430\u0442\u044C\u0441\u044F." })] })] })] })), activeTab === 'reviews' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-6", children: [isLoggedIn && (_jsxs("div", { className: "p-6 bg-secondary/50 rounded-2xl border border-base space-y-4", children: [_jsx("h3", { className: "font-bold", children: "\u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043E\u0442\u0437\u044B\u0432" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium", children: "\u0412\u0430\u0448\u0430 \u043E\u0446\u0435\u043D\u043A\u0430:" }), _jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map(star => (_jsx("button", { onClick: () => setNewReviewRating(star), className: "transition-all", children: _jsx(Star, { className: clsx("w-6 h-6 transition-colors", star <= newReviewRating ? "fill-amber-500 text-amber-500" : "text-gray-400") }) }, star))) })] }), _jsx("textarea", { value: newReviewText, onChange: (e) => setNewReviewText(e.target.value), placeholder: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u0435\u0441\u044C \u0441\u0432\u043E\u0438\u043C\u0438 \u0432\u043F\u0435\u0447\u0430\u0442\u043B\u0435\u043D\u0438\u044F\u043C\u0438 \u043E \u043A\u043D\u0438\u0433\u0435...", className: "w-full p-4 bg-primary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-32" }), _jsx("button", { onClick: submitReview, className: "px-6 py-2 bg-accent text-white rounded-xl font-bold", children: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043E\u0442\u0437\u044B\u0432" })] })), _jsx("div", { className: "space-y-4", children: reviews.length === 0 ? (_jsxs("div", { className: "text-center py-12 text-secondary", children: [_jsx(MessageSquare, { className: "w-12 h-12 mx-auto mb-3 opacity-20" }), _jsx("p", { children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043E\u0442\u0437\u044B\u0432\u043E\u0432. \u0411\u0443\u0434\u044C\u0442\u0435 \u043F\u0435\u0440\u0432\u044B\u043C!" })] })) : (reviews.map(review => (_jsx("div", { className: "p-6 bg-secondary/50 rounded-2xl border border-base space-y-4", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Link, { to: `/user/${review.user_id}`, children: _jsx("img", { src: review.user_avatar || AVATAR_PLACEHOLDER, alt: review.user_name, className: "w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-accent transition-all cursor-pointer" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsxs("div", { children: [_jsx(Link, { to: `/user/${review.user_id}`, className: "font-bold hover:text-accent transition-colors", children: review.user_name }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map(star => (_jsx(Star, { className: clsx("w-4 h-4", star <= review.rating ? "fill-amber-500 text-amber-500" : "text-gray-400") }, star))) }), _jsx("span", { className: "text-xs text-secondary", children: new Date(review.created_at).toLocaleDateString('ru-RU') })] })] }) }), _jsx("p", { className: "text-secondary leading-relaxed", children: review.text }), _jsxs("div", { className: "flex items-center gap-4 mt-3", children: [_jsxs("button", { type: "button", onClick: () => handleReviewReaction(review.id, 'like'), className: clsx("flex items-center gap-1 text-xs transition-colors", review.liked_by_user ? 'text-accent' : 'text-secondary hover:text-accent', !isLoggedIn && 'opacity-50 cursor-not-allowed'), disabled: !isLoggedIn, children: [_jsx(ThumbsUp, { className: "w-3 h-3" }), " ", review.likes] }), _jsxs("button", { type: "button", onClick: () => handleReviewReaction(review.id, 'dislike'), className: clsx("flex items-center gap-1 text-xs transition-colors", review.disliked_by_user ? 'text-rose-500' : 'text-secondary hover:text-rose-500', !isLoggedIn && 'opacity-50 cursor-not-allowed'), disabled: !isLoggedIn, children: [_jsx(ThumbsDown, { className: "w-3 h-3" }), " ", review.dislikes] }), isLoggedIn && user?.id !== review.user_id && (_jsxs("button", { onClick: () => openReportModal('review', review.id), className: "flex items-center gap-1 text-xs text-secondary hover:text-amber-500 transition-colors ml-auto", title: "\u041F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C\u0441\u044F", children: [_jsx(Flag, { className: "w-3 h-3" }), " \u0416\u0430\u043B\u043E\u0431\u0430"] }))] })] })] }) }, review.id)))) })] })), activeTab === 'comments' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-6", children: [isLoggedIn && (_jsxs("div", { className: "space-y-4", children: [_jsx("textarea", { value: commentText, onChange: (e) => setCommentText(e.target.value), placeholder: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u0435\u0441\u044C \u0432\u0430\u0448\u0438\u043C \u043C\u043D\u0435\u043D\u0438\u0435\u043C...", className: "w-full p-4 bg-secondary border border-base rounded-2xl outline-none focus:ring-2 focus:ring-accent h-32" }), _jsx("button", { onClick: submitComment, className: "px-6 py-2 bg-accent text-white rounded-xl font-bold ml-auto block", children: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C" })] })), comments.map(comment => (_jsxs("div", { className: "p-4 rounded-xl border border-base space-y-3", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: `/user/${comment.user_id}`, children: _jsx("img", { src: comment.user_avatar || AVATAR_PLACEHOLDER, className: "w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-accent transition-all cursor-pointer", alt: "" }) }), _jsxs("div", { children: [_jsx(Link, { to: `/user/${comment.user_id}`, className: "text-sm font-bold hover:text-accent transition-colors", children: comment.user_name }), _jsx("p", { className: "text-[10px] text-secondary", children: new Date(comment.created_at).toLocaleDateString('ru-RU') })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [isLoggedIn && user?.id !== comment.user_id && (_jsx("button", { onClick: () => openReportModal('comment', comment.id), className: "p-2 text-secondary hover:text-amber-500 transition-colors", title: "\u041F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C\u0441\u044F", children: _jsx(Flag, { className: "w-4 h-4" }) })), isLoggedIn && (user?.role === 'admin' || user?.id === comment.user_id) && (_jsx("button", { onClick: () => deleteComment(comment.id), className: "text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg", children: _jsx(Trash2, { className: "w-4 h-4" }) }))] })] }), _jsx("p", { className: "text-sm", children: comment.content }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { type: "button", onClick: () => handleCommentReaction(comment.id, 'like'), className: clsx("flex items-center gap-1 text-xs transition-colors", comment.liked_by_user ? 'text-accent' : 'text-secondary hover:text-accent', !isLoggedIn && 'opacity-50 cursor-not-allowed'), children: [_jsx(ThumbsUp, { className: "w-3 h-3" }), " ", comment.likes] }), _jsxs("button", { type: "button", onClick: () => handleCommentReaction(comment.id, 'dislike'), className: clsx("flex items-center gap-1 text-xs transition-colors", comment.disliked_by_user ? 'text-rose-500' : 'text-secondary hover:text-rose-500', !isLoggedIn && 'opacity-50 cursor-not-allowed'), children: [comment.dislikes, " ", _jsx(ThumbsDown, { className: "w-3 h-3" })] }), isLoggedIn && (_jsx("button", { onClick: () => setReplyingTo(replyingTo === comment.id ? null : comment.id), className: "text-xs font-bold text-accent ml-2", children: "\u041E\u0442\u0432\u0435\u0442\u0438\u0442\u044C" }))] }), comment.replies && comment.replies.length > 0 && (_jsx("div", { className: "pl-8 space-y-3 border-l-2 border-accent/20", children: comment.replies.map(reply => (_jsxs("div", { className: "p-3 bg-secondary/30 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Link, { to: `/user/${reply.user_id}`, children: _jsx("img", { src: reply.user_avatar || AVATAR_PLACEHOLDER, className: "w-6 h-6 rounded-full object-cover hover:ring-2 hover:ring-accent transition-all", alt: "" }) }), _jsx(Link, { to: `/user/${reply.user_id}`, className: "text-xs font-bold hover:text-accent transition-colors", children: reply.user_name })] }), _jsx("p", { className: "text-sm", children: reply.content })] }, reply.id))) })), isLoggedIn && replyingTo === comment.id && (_jsxs("div", { className: "mt-4 pl-8 space-y-2", children: [_jsx("textarea", { value: replyText, onChange: (e) => setReplyText(e.target.value), placeholder: "\u041D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u043E\u0442\u0432\u0435\u0442...", className: "w-full p-3 bg-primary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-24 text-sm" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => submitReply(comment.id), className: "px-4 py-1.5 bg-accent text-white rounded-lg font-bold text-sm flex items-center gap-1", children: [_jsx(Send, { className: "w-3 h-3" }), " \u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C"] }), _jsx("button", { onClick: () => { setReplyText(''); setReplyingTo(null); }, className: "px-4 py-1.5 bg-secondary rounded-lg font-bold text-sm", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] }))] }, comment.id)))] }))] })] })] }) }), _jsx(AnimatePresence, { children: showShareModal && (_jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setShowShareModal(false), className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 20 }, className: "relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base", children: [_jsx("button", { onClick: () => setShowShareModal(false), className: "absolute top-6 right-6 text-secondary hover:text-primary transition-colors", children: _jsx(X, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-black mb-2", children: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F \u043A\u043D\u0438\u0433\u043E\u0439" }), _jsxs("p", { className: "text-secondary text-sm mb-6", children: ["\u041E\u0442\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 \"", book.title, "\" \u0434\u0440\u0443\u0437\u044C\u044F\u043C"] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: window.location.href, readOnly: true, className: "flex-1 px-4 py-3 bg-secondary border border-base rounded-xl text-sm" }), _jsxs("button", { onClick: handleShare, className: clsx("px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all", copied ? "bg-green-500 text-white" : "bg-accent text-white hover:bg-accent/90"), children: [copied ? _jsx(Check, { className: "w-5 h-5" }) : _jsx(Copy, { className: "w-5 h-5" }), copied ? 'Скопировано!' : 'Копировать'] })] }) })] })] })) }), _jsx(AnimatePresence, { children: showReportModal && (_jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setShowReportModal(false), className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base", children: [_jsx("button", { onClick: () => setShowReportModal(false), className: "absolute top-6 right-6 text-secondary hover:text-primary", children: _jsx(X, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-black mb-2", children: "\u041F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C\u0441\u044F" }), _jsxs("p", { className: "text-secondary text-sm mb-6", children: ["\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u043F\u0440\u0438\u0447\u0438\u043D\u0443 \u0436\u0430\u043B\u043E\u0431\u044B \u043D\u0430 ", reportTarget?.type === 'review' ? 'отзыв' : 'комментарий'] }), reportSuccess ? (_jsx("div", { className: "p-4 bg-green-500/10 text-green-500 rounded-xl text-sm font-medium text-center", children: "\u2713 \u0416\u0430\u043B\u043E\u0431\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430" })) : (_jsxs("div", { className: "space-y-4", children: [reportError && _jsx("div", { className: "p-3 bg-rose-500/10 text-rose-500 text-sm rounded-xl", children: reportError }), _jsx("textarea", { value: reportReason, onChange: (e) => setReportReason(e.target.value), placeholder: "\u041F\u0440\u0438\u0447\u0438\u043D\u0430 \u0436\u0430\u043B\u043E\u0431\u044B...", className: "w-full p-4 bg-secondary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-24" }), _jsx("button", { onClick: submitReport, disabled: !reportReason.trim(), className: clsx("w-full py-3 rounded-xl font-bold transition-all", reportReason.trim() ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-secondary text-secondary cursor-not-allowed"), children: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0436\u0430\u043B\u043E\u0431\u0443" })] }))] })] })) })] }));
};
