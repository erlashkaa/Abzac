import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Edit3, Star, BookOpen, Heart, Clock, Shield, ChevronRight, Save, X, MessageCircle, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { AVATAR_PLACEHOLDER } from '../constants';
import { useAuth } from '../context/AuthContext';
import { usersApi, type ReadingHistoryItem } from '../api/usersApi';
import type { Review } from '../api/reviewsApi';
import type { Comment } from '../api/commentsApi';
import type { ForumTopic } from '../api/forumApi';
import { type Book } from '../api/booksApi';
import { BookCard } from '../components/BookCard';

export const Profile: React.FC = () => {
  const { isLoggedIn, user, refreshUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('favorites');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) setBio(user.about || '');
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) {
      usersApi.getFavorites().then(r => setFavorites(r.data)).catch(() => {});
      usersApi.getReadingHistory().then(r => setHistory(r.data)).catch(() => {});
      usersApi.getReviews().then(r => setReviews(r.data)).catch(() => {});
      usersApi.getComments().then(r => setComments(r.data)).catch(() => {});
      usersApi.getTopics().then(r => setTopics(r.data)).catch(() => {});
    }
  }, [isLoggedIn]);

  const saveBio = async () => {
    try {
      await usersApi.updateProfile({ about: bio });
      refreshUser();
      setIsEditingBio(false);
    } catch {}
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await usersApi.updateProfile({ [type]: base64String });
        refreshUser();
      } catch (err) {
        console.error(`Error updating ${type}:`, err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await usersApi.changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordSuccess('Пароль успешно изменен');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (e: any) {
      setPasswordError(e.response?.data?.detail || 'Ошибка изменения пароля');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sections = [
    { key: 'favorites', label: 'Избранное', icon: Heart, count: favorites.length },
    { key: 'history', label: 'История чтения', icon: Clock, count: history.length },
    { key: 'reviews', label: 'Отзывы', icon: Star, count: reviews.length },
    { key: 'comments', label: 'Комментарии', icon: MessageCircle, count: comments.length },
    { key: 'topics', label: 'Форум', icon: Hash, count: topics.length },
    { key: 'security', label: 'Безопасность', icon: Shield },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Banner + Avatar */}
      <div className="relative mb-20">
        <div className="h-60 rounded-3xl overflow-hidden bg-gradient-to-r from-accent/20 via-accent/5 to-accent/20 relative group">
          {user.banner && <img src={user.banner} alt="" className="w-full h-full object-cover" />}
          <label className="absolute top-4 right-4 px-4 py-2 bg-black/60 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 cursor-pointer hover:bg-black/80 font-medium text-sm">
            <Camera className="w-4 h-4" /> Изменить фон
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 'banner')}
            />
          </label>
        </div>
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-primary bg-secondary shadow-xl relative cursor-pointer">
              <img src={user.avatar || AVATAR_PLACEHOLDER} alt={user.username} className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white mb-1" />
                <span className="text-white text-xs font-bold">Изменить</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                />
              </label>
            </div>
          </div>
          <div className="pb-2">
            <h1 className="text-3xl font-black">{user.username}</h1>
            <p className="text-secondary text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 bg-secondary p-4 rounded-2xl border border-base">
        <div className="text-center p-4">
          <div className="text-2xl font-bold">{favorites.length}</div>
          <div className="text-xs text-secondary uppercase font-bold">Избранное</div>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl font-bold">{history.length}</div>
          <div className="text-xs text-secondary uppercase font-bold">Прочитано</div>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl font-bold">
            {new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
          </div>
          <div className="text-xs text-secondary uppercase font-bold">На платформе с</div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-8 p-6 bg-secondary rounded-2xl border border-base">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold">О себе</h3>
          {!isEditingBio && (
            <button onClick={() => setIsEditingBio(true)} className="text-xs font-bold text-accent flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Редактировать
            </button>
          )}
        </div>
        {isEditingBio ? (
          <div className="space-y-3">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-4 bg-primary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-24" />
            <div className="flex gap-2">
              <button onClick={saveBio} className="px-4 py-2 bg-accent text-white rounded-lg font-bold text-sm flex items-center gap-1"><Save className="w-3 h-3" /> Сохранить</button>
              <button onClick={() => { setIsEditingBio(false); setBio(user.about || ''); }} className="px-4 py-2 bg-primary border border-base rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        ) : (
          <p className="text-secondary">{user.about || 'Расскажите о себе...'}</p>
        )}
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-sm font-medium",
                activeSection === s.key ? "bg-accent text-white shadow-lg shadow-accent/20" : "hover:bg-secondary"
              )}
            >
              <s.icon className="w-5 h-5" />
              {s.label}
              {'count' in s && s.count !== undefined && <span className="ml-auto text-xs opacity-70">{s.count}</span>}
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all text-left text-sm font-medium mt-4"
          >
            Выйти из аккаунта
          </button>
        </div>

        <div className="md:col-span-3">
          {activeSection === 'favorites' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Избранные книги</h3>
              {favorites.length === 0 ? (
                <div className="text-center py-16 text-secondary">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>У вас пока нет избранных книг</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map(book => <BookCard key={book.id} book={book} />)}
                </div>
              )}
            </div>
          )}

          {activeSection === 'history' && (
            <div>
              <h3 className="text-xl font-bold mb-4">История чтения</h3>
              {history.length === 0 ? (
                <div className="text-center py-16 text-secondary">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Вы пока ничего не читали</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(item => (
                    <div key={item.book_id} className="flex gap-4 p-4 bg-secondary rounded-xl border border-base">
                      <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden bg-primary shrink-0">
                        <img src={item.book_cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.book_title}</p>
                        <p className="text-xs text-secondary italic">Последнее чтение: {new Date(item.last_read_at).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-primary rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{ width: `${item.progress_percent}%` }} />
                          </div>
                          <span className="text-xs font-bold text-accent">{item.progress_percent}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'reviews' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Мои отзывы</h3>
              {reviews.length === 0 ? (
                <div className="text-center py-16 text-secondary">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Вы пока не оставили ни одного отзыва</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 bg-secondary rounded-xl border border-base">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          {review.book_title && (
                            <Link to={`/reader?bookId=${review.book_id}`} className="text-xs font-bold text-secondary hover:text-accent mb-2 inline-block transition-colors">
                              Отзыв на книгу «{review.book_title}»
                            </Link>
                          )}
                          <div className="flex items-center gap-1 text-accent">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={clsx("w-4 h-4", i < review.rating ? "fill-current" : "text-base opacity-30")} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-secondary">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'comments' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Мои комментарии</h3>
              {comments.length === 0 ? (
                <div className="text-center py-16 text-secondary">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>У вас пока нет комментариев</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="p-4 bg-secondary rounded-xl border border-base hover:border-accent/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {comment.topic_id ? (
                            <Link to={`/forum/topic/${comment.topic_id}`} className="text-xs font-bold text-secondary hover:text-accent block transition-colors">
                              В теме: «{comment.topic_title}»
                            </Link>
                          ) : comment.book_title ? (
                            <Link to={`/reader?bookId=${comment.book_id}`} className="text-xs font-bold text-secondary hover:text-accent block transition-colors">
                              К книге: «{comment.book_title}»
                            </Link>
                          ) : null}
                        </div>
                        <span className="text-xs text-secondary shrink-0 ml-4">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm leading-relaxed mt-1">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'topics' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Мои темы на форуме</h3>
              {topics.length === 0 ? (
                <div className="text-center py-16 text-secondary">
                  <Hash className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Вы пока не создали ни одной темы</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topics.map(topic => (
                    <Link key={topic.id} to={`/forum/topic/${topic.id}`} className="block p-4 bg-secondary rounded-xl border border-base hover:border-accent/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-accent">{topic.title}</h4>
                        <span className="text-xs text-secondary">{new Date(topic.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-bold uppercase">{topic.tag}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'security' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Безопасность</h3>
              <div className="p-6 bg-secondary rounded-2xl border border-base space-y-6">
                <div className="flex items-center justify-between">
                  <div><p className="font-bold text-sm">Пароль</p><p className="text-xs text-secondary">Изменить пароль учетной записи</p></div>
                  <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2 bg-accent text-white rounded-xl font-bold text-sm">Изменить</button>
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="font-bold text-sm">Email</p><p className="text-xs text-secondary">{user.email}</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPasswordModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base">
              <button onClick={() => setShowPasswordModal(false)} className="absolute top-6 right-6 text-secondary hover:text-primary"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-6">Изменить пароль</h2>
              {passwordError && <div className="mb-4 p-3 bg-rose-500/10 text-rose-500 text-sm rounded-xl">{passwordError}</div>}
              {passwordSuccess && <div className="mb-4 p-3 bg-green-500/10 text-green-500 text-sm rounded-xl">{passwordSuccess}</div>}
              <div className="space-y-4">
                <input type="password" placeholder="Текущий пароль" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                <input type="password" placeholder="Новый пароль" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none" />
                <button onClick={handleChangePassword} className="w-full py-3 bg-accent text-white rounded-xl font-bold">Сохранить</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};