import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { booksApi, type Book } from '../api/booksApi';
import { reviewsApi, type Review } from '../api/reviewsApi';
import { commentsApi, type Comment } from '../api/commentsApi';
import { usersApi } from '../api/usersApi';
import { Rating } from '../components/Rating';
import { Heart, Share2, BookOpen, MessageSquare, Star, ThumbsUp, ThumbsDown, Trash2, Send, X, Copy, Check, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { AVATAR_PLACEHOLDER } from '../constants';
import { useAuth } from '../context/AuthContext';
import { getDemoBook, getDemoReviews, isDemoId } from '../demo/demoData';
import { toast } from 'sonner';

export const BookDetails: React.FC = () => {
  const { id } = useParams();
  const bookId = Number(id);
  const [book, setBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'comments'>('desc');
  const [isFavorite, setIsFavorite] = useState(false);
  const { isLoggedIn, user, refreshUser } = useAuth();

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'comment' | 'review'; id: number } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    booksApi
      .getBook(bookId)
      .then(r => setBook(r.data))
      .catch(() => {
        const demo = getDemoBook(bookId);
        if (demo) setBook(demo);
      });

    reviewsApi
      .getReviews(bookId)
      .then(r => setReviews(r.data))
      .catch(() => {
        const demoReviews = getDemoReviews(bookId);
        if (demoReviews.length) setReviews(demoReviews);
      });
    commentsApi.getComments(bookId).then(r => setComments(r.data)).catch(() => {});
  }, [bookId]);

  useEffect(() => {
    if (isLoggedIn && bookId) {
      if (isDemoId(bookId)) return;
      usersApi.checkFavorite(bookId).then(r => setIsFavorite(r.data.is_favorite)).catch(() => {});
    }
  }, [isLoggedIn, bookId]);

  const toggleFavorite = async () => {
    if (!isLoggedIn) return;
    if (isDemoId(bookId)) return;
    try {
      if (isFavorite) {
        await usersApi.removeFavorite(bookId);
        setIsFavorite(false);
      } else {
        await usersApi.addFavorite(bookId);
        setIsFavorite(true);
      }
    } catch {}
  };

  const handleReviewReaction = async (reviewId: number, type: 'like' | 'dislike') => {
    if (!isLoggedIn) return;
    try {
      const resp = await reviewsApi.reactToReview(reviewId, type);
      setReviews(prev => prev.map(r => {
        if (r.id !== reviewId) return r;
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
    } catch {}
  };

  const submitReview = async () => {
    if (!isLoggedIn || !newReviewText.trim()) return;
    try {
      const resp = await reviewsApi.createReview(bookId, { rating: newReviewRating, text: newReviewText });
      setReviews(prev => [resp.data, ...prev]);
      setNewReviewText('');
      setNewReviewRating(5);
    } catch {}
  };

  const handleCommentReaction = async (commentId: number, type: 'like' | 'dislike') => {
    if (!isLoggedIn) return;
    try {
      const resp = await commentsApi.reactToComment(commentId, type);
      setComments(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        return {
          ...c,
          likes: resp.data.likes,
          dislikes: resp.data.dislikes,
          liked_by_user: type === 'like' ? !c.liked_by_user : false,
          disliked_by_user: type === 'dislike' ? !c.disliked_by_user : false,
        };
      }));
    } catch {}
  };

  const submitComment = async () => {
    if (!isLoggedIn || !commentText.trim()) return;
    try {
      const resp = await commentsApi.createComment(bookId, { content: commentText });
      setComments(prev => [resp.data, ...prev]);
      setCommentText('');
    } catch {}
  };

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      toast.error('Нужно войти в аккаунт');
      return;
    }
    if (!book) return;
    if (book.is_free === true || book.purchased === true) return;
    if (isDemoId(bookId)) return;
    setIsPurchasing(true);
    try {
      const resp = await booksApi.purchaseBook(bookId);
      setBook(resp.data);
      // Баланс меняется на бэкенде, но в UI он берётся из профиля — обновим его.
      await refreshUser();
      toast.success('Книга куплена');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Не удалось купить книгу';
      toast.error(msg);
    } finally {
      setIsPurchasing(false);
    }
  };

  const submitReply = async (parentId: number) => {
    if (!isLoggedIn || !replyText.trim()) return;
    const parentComment = comments.find(c => c.id === parentId);
    const nickname = parentComment ? `${parentComment.user_name}, ` : '';
    try {
      await commentsApi.createComment(bookId, { content: nickname + replyText, parent_id: parentId });
      // Refresh comments
      const resp = await commentsApi.getComments(bookId);
      setComments(resp.data);
      setReplyText('');
      setReplyingTo(null);
    } catch {}
  };

  const deleteComment = async (commentId: number) => {
    try {
      await commentsApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const openReportModal = (type: 'comment' | 'review', targetId: number) => {
    setReportTarget({ type, id: targetId });
    setReportReason('');
    setReportSuccess(false);
    setReportError('');
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportTarget || !reportReason.trim()) return;
    try {
      if (reportTarget.type === 'comment') {
        await commentsApi.reportComment(reportTarget.id, reportReason);
      } else {
        await reviewsApi.reportReview(reportTarget.id, reportReason);
      }
      setReportSuccess(true);
      setTimeout(() => setShowReportModal(false), 1500);
    } catch (e: any) {
      setReportError(e.response?.data?.detail || 'Ошибка при отправке жалобы');
    }
  };

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdminReader = user?.role === 'admin';
  const canReadFull = book.is_free === true || book.purchased === true || isAdminReader;
  const price = Number(book.retail_price ?? 0);

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Book Cover & Actions */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-base">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-3">
              {canReadFull ? (
                <Link to={`/reader?bookId=${book.id}`} className="w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
                  <BookOpen className="w-5 h-5" /> Читать книгу
                </Link>
              ) : (
                <div className="rounded-2xl border border-base bg-secondary/40 p-4">
                  <div className="text-center text-sm text-secondary">
                    {price > 0
                      ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price)
                      : 'Цена не указана'}
                  </div>
                  <button
                    type="button"
                    disabled={isPurchasing || price <= 0}
                    onClick={handlePurchase}
                    className="mt-3 w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-60"
                  >
                    {isPurchasing ? 'Покупка…' : 'Купить'}
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={clsx(
                    "py-3 border border-base rounded-xl font-medium flex items-center justify-center gap-2 transition-colors",
                    isLoggedIn ? "hover:bg-secondary" : "opacity-50 cursor-not-allowed",
                    isFavorite && "bg-blue-600 text-white border-blue-600 hover:bg-blue-600"
                  )}
                >
                  <Heart className="w-4 h-4" /> {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="py-3 border border-base rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Поделиться
                </button>
              </div>
            </div>
            <div className="p-4 bg-secondary rounded-xl border border-base space-y-3">
              <div className="flex justify-between text-sm"><span className="text-secondary">Год издания</span><span className="font-medium">{book.year}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary">Жанр</span><span className="font-medium text-accent">{book.genre}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary">Возрастное ограничение</span><span className="font-medium">16+</span></div>
            </div>
          </div>

          {/* Right: Book Info */}
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-4xl font-black mb-2">{book.title}</h1>
              <p className="text-xl text-secondary font-medium mb-6">{book.author}</p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold">{book.rating}</div>
                  <div className="flex flex-col">
                    <Rating rating={book.rating} size={16} />
                    <span className="text-xs text-secondary">{book.reviews_count} отзывов</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-border-color" />
                <div className="flex gap-2">
                  {book.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-base flex gap-8">
              {(['desc', 'reviews', 'comments'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx("pb-4 text-sm font-bold transition-all relative", activeTab === tab ? "text-primary" : "text-secondary")}
                >
                  {tab === 'desc' ? 'О книге' : tab === 'reviews' ? `Отзывы (${reviews.length})` : `Комментарии (${comments.length})`}
                  {activeTab === tab && (<motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />)}
                </button>
              ))}
            </div>

            <div className="min-h-[300px]">
              {activeTab === 'desc' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <p className="text-lg leading-relaxed text-secondary">{book.description}</p>
                  <div className="p-6 bg-secondary/50 rounded-2xl border border-dashed border-base">
                    <h3 className="font-bold mb-3">Почему стоит прочитать?</h3>
                    <ul className="space-y-2 text-sm text-secondary list-disc pl-4">
                      <li>Уникальный авторский стиль и глубокая проработка персонажей.</li>
                      <li>Захватывающий сюжет с неожиданными поворотами.</li>
                      <li>Актуальные темы, которые заставляют задуматься.</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {isLoggedIn && (
                    <div className="p-6 bg-secondary/50 rounded-2xl border border-base space-y-4">
                      <h3 className="font-bold">Оставить отзыв</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Ваша оценка:</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => setNewReviewRating(star)} className="transition-all">
                              <Star className={clsx("w-6 h-6 transition-colors", star <= newReviewRating ? "fill-amber-500 text-amber-500" : "text-gray-400")} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="Поделитесь своими впечатлениями о книге..." className="w-full p-4 bg-primary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-32" />
                      <button onClick={submitReview} className="px-6 py-2 bg-accent text-white rounded-xl font-bold">Отправить отзыв</button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-12 text-secondary">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Пока нет отзывов. Будьте первым!</p>
                      </div>
                    ) : (
                      reviews.map(review => (
                        <div key={review.id} className="p-6 bg-secondary/50 rounded-2xl border border-base space-y-4">
                          <div className="flex items-start gap-4">
                            <Link to={`/user/${review.user_id}`}>
                              <img src={review.user_avatar || AVATAR_PLACEHOLDER} alt={review.user_name} className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-accent transition-all cursor-pointer" />
                            </Link>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <Link to={`/user/${review.user_id}`} className="font-bold hover:text-accent transition-colors">{review.user_name}</Link>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex">{[1,2,3,4,5].map(star => (<Star key={star} className={clsx("w-4 h-4", star <= review.rating ? "fill-amber-500 text-amber-500" : "text-gray-400")} />))}</div>
                                    <span className="text-xs text-secondary">{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-secondary leading-relaxed">{review.text}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <button type="button" onClick={() => handleReviewReaction(review.id, 'like')} className={clsx("flex items-center gap-1 text-xs transition-colors", review.liked_by_user ? 'text-accent' : 'text-secondary hover:text-accent', !isLoggedIn && 'opacity-50 cursor-not-allowed')} disabled={!isLoggedIn}><ThumbsUp className="w-3 h-3" /> {review.likes}</button>
                                <button type="button" onClick={() => handleReviewReaction(review.id, 'dislike')} className={clsx("flex items-center gap-1 text-xs transition-colors", review.disliked_by_user ? 'text-rose-500' : 'text-secondary hover:text-rose-500', !isLoggedIn && 'opacity-50 cursor-not-allowed')} disabled={!isLoggedIn}><ThumbsDown className="w-3 h-3" /> {review.dislikes}</button>
                                {isLoggedIn && user?.id !== review.user_id && (
                                  <button onClick={() => openReportModal('review', review.id)} className="flex items-center gap-1 text-xs text-secondary hover:text-amber-500 transition-colors ml-auto" title="Пожаловаться">
                                    <Flag className="w-3 h-3" /> Жалоба
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'comments' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {isLoggedIn && (
                    <div className="space-y-4">
                      <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Поделитесь вашим мнением..." className="w-full p-4 bg-secondary border border-base rounded-2xl outline-none focus:ring-2 focus:ring-accent h-32" />
                      <button onClick={submitComment} className="px-6 py-2 bg-accent text-white rounded-xl font-bold ml-auto block">Отправить</button>
                    </div>
                  )}
                  {comments.map(comment => (
                    <div key={comment.id} className="p-4 rounded-xl border border-base space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Link to={`/user/${comment.user_id}`}>
                            <img src={comment.user_avatar || AVATAR_PLACEHOLDER} className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-accent transition-all cursor-pointer" alt="" />
                          </Link>
                          <div>
                            <Link to={`/user/${comment.user_id}`} className="text-sm font-bold hover:text-accent transition-colors">{comment.user_name}</Link>
                            <p className="text-[10px] text-secondary">{new Date(comment.created_at).toLocaleDateString('ru-RU')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isLoggedIn && user?.id !== comment.user_id && (
                            <button onClick={() => openReportModal('comment', comment.id)} className="p-2 text-secondary hover:text-amber-500 transition-colors" title="Пожаловаться"><Flag className="w-4 h-4" /></button>
                          )}
                          {isLoggedIn && (user?.role === 'admin' || user?.id === comment.user_id) && (
                            <button onClick={() => deleteComment(comment.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button type="button" onClick={() => handleCommentReaction(comment.id, 'like')} className={clsx("flex items-center gap-1 text-xs transition-colors", comment.liked_by_user ? 'text-accent' : 'text-secondary hover:text-accent', !isLoggedIn && 'opacity-50 cursor-not-allowed')}><ThumbsUp className="w-3 h-3" /> {comment.likes}</button>
                        <button type="button" onClick={() => handleCommentReaction(comment.id, 'dislike')} className={clsx("flex items-center gap-1 text-xs transition-colors", comment.disliked_by_user ? 'text-rose-500' : 'text-secondary hover:text-rose-500', !isLoggedIn && 'opacity-50 cursor-not-allowed')}>{comment.dislikes} <ThumbsDown className="w-3 h-3" /></button>
                        {isLoggedIn && (<button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-xs font-bold text-accent ml-2">Ответить</button>)}
                      </div>
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-8 space-y-3 border-l-2 border-accent/20">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="p-3 bg-secondary/30 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Link to={`/user/${reply.user_id}`}>
                                  <img src={reply.user_avatar || AVATAR_PLACEHOLDER} className="w-6 h-6 rounded-full object-cover hover:ring-2 hover:ring-accent transition-all" alt="" />
                                </Link>
                                <Link to={`/user/${reply.user_id}`} className="text-xs font-bold hover:text-accent transition-colors">{reply.user_name}</Link>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {isLoggedIn && replyingTo === comment.id && (
                        <div className="mt-4 pl-8 space-y-2">
                          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Напишите ответ..." className="w-full p-3 bg-primary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-24 text-sm" />
                          <div className="flex gap-2">
                            <button onClick={() => submitReply(comment.id)} className="px-4 py-1.5 bg-accent text-white rounded-lg font-bold text-sm flex items-center gap-1"><Send className="w-3 h-3" /> Отправить</button>
                            <button onClick={() => { setReplyText(''); setReplyingTo(null); }} className="px-4 py-1.5 bg-secondary rounded-lg font-bold text-sm">Отмена</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShareModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base">
              <button onClick={() => setShowShareModal(false)} className="absolute top-6 right-6 text-secondary hover:text-primary transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-2">Поделиться книгой</h2>
              <p className="text-secondary text-sm mb-6">Отправьте ссылку на "{book.title}" друзьям</p>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input type="text" value={window.location.href} readOnly className="flex-1 px-4 py-3 bg-secondary border border-base rounded-xl text-sm" />
                  <button onClick={handleShare} className={clsx("px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all", copied ? "bg-green-500 text-white" : "bg-accent text-white hover:bg-accent/90")}>
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Скопировано!' : 'Копировать'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReportModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base">
              <button onClick={() => setShowReportModal(false)} className="absolute top-6 right-6 text-secondary hover:text-primary"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-2">Пожаловаться</h2>
              <p className="text-secondary text-sm mb-6">Опишите причину жалобы на {reportTarget?.type === 'review' ? 'отзыв' : 'комментарий'}</p>
              {reportSuccess ? (
                <div className="p-4 bg-green-500/10 text-green-500 rounded-xl text-sm font-medium text-center">✓ Жалоба отправлена</div>
              ) : (
                <div className="space-y-4">
                  {reportError && <div className="p-3 bg-rose-500/10 text-rose-500 text-sm rounded-xl">{reportError}</div>}
                  <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Причина жалобы..." className="w-full p-4 bg-secondary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-24" />
                  <button onClick={submitReport} disabled={!reportReason.trim()} className={clsx("w-full py-3 rounded-xl font-bold transition-all", reportReason.trim() ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-secondary text-secondary cursor-not-allowed")}>
                    Отправить жалобу
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};