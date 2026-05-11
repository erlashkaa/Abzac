import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MessageCircle, Hash, ChevronLeft, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { AVATAR_PLACEHOLDER } from '../constants';
import { usersApi, type UserPublicProfile, type UserProfileResponse } from '../api/usersApi';
import type { Review } from '../api/reviewsApi';
import type { Comment } from '../api/commentsApi';
import type { ForumTopic } from '../api/forumApi';
import { getDemoUserProfile } from '../demo/demoData';

export const UserProfile: React.FC = () => {
  const { id } = useParams();
  const userId = Number(id);
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [activeTab, setActiveTab] = useState('reviews');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) return;
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Пользователь не найден</h2>
          <Link to="/" className="text-accent hover:underline">На главную</Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: 'reviews', label: 'Отзывы', icon: Star, count: reviews.length },
    { key: 'comments', label: 'Комментарии', icon: MessageCircle, count: comments.length },
    { key: 'topics', label: 'Форум', icon: Hash, count: topics.length },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-accent mb-6 transition-colors group">
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Назад
      </Link>

      {/* Banner + Avatar */}
      <div className="relative mb-20">
        <div className="h-60 rounded-3xl overflow-hidden bg-gradient-to-r from-accent/20 via-accent/5 to-accent/20">
          {profile.banner && <img src={profile.banner} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-primary bg-secondary shadow-xl">
            <img src={profile.avatar || AVATAR_PLACEHOLDER} alt={profile.username} className="w-full h-full object-cover" />
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black">{profile.username}</h1>
              {profile.role === 'admin' && (
                <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase">Администратор</span>
              )}
            </div>
            <p className="text-secondary text-sm flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              На платформе с {new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 bg-secondary p-4 rounded-2xl border border-base">
        <div className="text-center p-4">
          <div className="text-2xl font-bold">{reviews.length}</div>
          <div className="text-xs text-secondary uppercase font-bold">Отзывов</div>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl font-bold">{comments.length}</div>
          <div className="text-xs text-secondary uppercase font-bold">Комментариев</div>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl font-bold">{topics.length}</div>
          <div className="text-xs text-secondary uppercase font-bold">Тем на форуме</div>
        </div>
      </div>

      {/* About */}
      {profile.about && (
        <div className="mb-8 p-6 bg-secondary rounded-2xl border border-base">
          <h3 className="font-bold mb-2">О себе</h3>
          <p className="text-secondary">{profile.about}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-base flex gap-8 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx("pb-4 text-sm font-bold transition-all relative flex items-center gap-2", activeTab === tab.key ? "text-primary" : "text-secondary")}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label} ({tab.count})
            {activeTab === tab.key && (<motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-16 text-secondary">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Пока нет отзывов</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="p-5 bg-secondary rounded-xl border border-base">
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
                    <span className="text-xs text-secondary">{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{review.text}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'comments' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-16 text-secondary">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Пока нет комментариев</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="p-4 bg-secondary rounded-xl border border-base">
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
                    <span className="text-xs text-secondary shrink-0 ml-4">{new Date(comment.created_at).toLocaleString('ru-RU')}</span>
                  </div>
                  <p className="text-sm leading-relaxed mt-1">{comment.content}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'topics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {topics.length === 0 ? (
              <div className="text-center py-16 text-secondary">
                <Hash className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Пока нет тем на форуме</p>
              </div>
            ) : (
              topics.map(topic => (
                <Link key={topic.id} to={`/forum/topic/${topic.id}`} className="block p-4 bg-secondary rounded-xl border border-base hover:border-accent/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-accent">{topic.title}</h4>
                    <span className="text-xs text-secondary">{new Date(topic.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-bold uppercase">{topic.tag}</span>
                </Link>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
