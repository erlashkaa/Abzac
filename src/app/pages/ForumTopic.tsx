import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ThumbsUp, ThumbsDown, Trash2, Pin, Send, Flag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVATAR_PLACEHOLDER } from '../constants';
import { useAuth } from '../context/AuthContext';
import { forumApi, type ForumTopic as ForumTopicData, type ForumMessage } from '../api/forumApi';
import { clsx } from 'clsx';

export const ForumTopic: React.FC = () => {
  const { id } = useParams();
  const topicId = Number(id);
  const { isLoggedIn, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [topic, setTopic] = useState<ForumTopicData | null>(null);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Report
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    if (!topicId) return;
    forumApi.getTopic(topicId).then(r => {
      setTopic(r.data.topic);
      setMessages(r.data.messages);
    }).catch(() => {});
  }, [topicId]);

  const handleReaction = async (messageId: number, type: 'like' | 'dislike') => {
    if (!isLoggedIn) return;
    try {
      const resp = await forumApi.reactToMessage(messageId, type);
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId) return m;
        return {
          ...m,
          likes: resp.data.likes,
          dislikes: resp.data.dislikes,
          liked_by_user: type === 'like' ? !m.liked_by_user : false,
          disliked_by_user: type === 'dislike' ? !m.disliked_by_user : false,
        };
      }));
    } catch {}
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await forumApi.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch {}
  };

  const handleSendReply = async (parentId: number) => {
    if (!isLoggedIn || !replyText.trim()) return;
    const parentMsg = messages.find(m => m.id === parentId);
    const nickname = parentMsg ? `${parentMsg.author_name}, ` : '';
    try {
      const resp = await forumApi.createMessage(topicId, { content: nickname + replyText, parent_id: parentId });
      setMessages(prev => [...prev, resp.data]);
      setReplyText('');
      setReplyingTo(null);
    } catch {}
  };

  const handleSendMessage = async () => {
    if (!isLoggedIn || !newMessage.trim()) return;
    try {
      const resp = await forumApi.createMessage(topicId, { content: newMessage });
      setMessages(prev => [...prev, resp.data]);
      setNewMessage('');
    } catch {}
  };

  const handleTogglePin = async () => {
    if (!topic) return;
    try {
      const resp = await forumApi.togglePin(topicId);
      setTopic((prev: ForumTopicData | null) => prev ? { ...prev, is_pinned: resp.data.is_pinned } : prev);
    } catch {}
  };

  const handleDeleteTopic = async () => {
    try {
      await forumApi.deleteTopic(topicId);
      window.location.href = '/forum';
    } catch {}
  };

  const openReportModal = (messageId: number) => {
    setReportTargetId(messageId);
    setReportReason('');
    setReportSuccess(false);
    setReportError('');
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportTargetId || !reportReason.trim()) return;
    try {
      await forumApi.reportMessage(reportTargetId, reportReason);
      setReportSuccess(true);
      setTimeout(() => setShowReportModal(false), 1500);
    } catch (e: any) {
      setReportError(e.response?.data?.detail || 'Ошибка при отправке жалобы');
    }
  };

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-accent mb-6 transition-colors group">
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Назад к списку тем
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex gap-2 mb-2">
            {topic.is_pinned && (
              <span className="p-1 bg-amber-500/10 text-amber-500 rounded text-xs flex items-center gap-1 font-bold">
                <Pin className="w-3 h-3" /> Закреплено
              </span>
            )}
            <span className="px-2 py-1 bg-secondary text-secondary rounded text-[10px] font-bold uppercase tracking-wider">{topic.tag}</span>
          </div>
          <h1 className="text-3xl font-black">{topic.title}</h1>
        </div>
        {isLoggedIn && isAdmin && (
          <div className="flex gap-2 shrink-0">
            <button onClick={handleTogglePin} className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:text-amber-500 transition-colors text-sm font-bold border border-base">
              <Pin className="w-4 h-4" /> {topic.is_pinned ? 'Открепить' : 'Закрепить'}
            </button>
            <button onClick={handleDeleteTopic} className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:text-rose-500 transition-colors text-sm font-bold border border-base">
              <Trash2 className="w-4 h-4" /> Удалить
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6 mb-12">
        {messages.map((msg) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className="flex flex-col md:flex-row gap-6 p-6 bg-primary border border-base rounded-3xl">
            <div className="md:w-32 shrink-0 flex flex-col items-center gap-3">
              <Link to={`/user/${msg.author_id}`} className="block">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-base hover:border-accent transition-colors">
                  <img src={msg.author_avatar || AVATAR_PLACEHOLDER} alt="" className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="text-center">
                <Link to={`/user/${msg.author_id}`} className="font-bold text-sm truncate w-24 block hover:text-accent transition-colors">{msg.author_name}</Link>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${msg.author_role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-secondary text-secondary'}`}>
                  {msg.author_role === 'admin' ? 'Модератор' : 'Участник'}
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-secondary mb-3">{new Date(msg.created_at).toLocaleString('ru-RU')}</p>
                <div className="text-lg leading-relaxed">{msg.content}</div>
              </div>
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-base">
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => handleReaction(msg.id, 'like')} className={clsx("flex items-center gap-1 text-sm font-medium transition-colors", msg.liked_by_user ? 'text-accent' : 'text-secondary hover:text-accent', !isLoggedIn && 'opacity-50 cursor-not-allowed')}>
                    <ThumbsUp className="w-4 h-4" /> {msg.likes}
                  </button>
                  <button type="button" onClick={() => handleReaction(msg.id, 'dislike')} className={clsx("flex items-center gap-1 text-sm font-medium transition-colors", msg.disliked_by_user ? 'text-rose-500' : 'text-secondary hover:text-rose-500', !isLoggedIn && 'opacity-50 cursor-not-allowed')}>
                    {msg.dislikes} <ThumbsDown className="w-4 h-4" />
                  </button>
                  {isLoggedIn && (
                    <button onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)} className="text-sm font-bold text-accent ml-2">Ответить</button>
                  )}
                  {isLoggedIn && user?.id !== msg.author_id && (
                    <button onClick={() => openReportModal(msg.id)} className="flex items-center gap-1 text-xs text-secondary hover:text-amber-500 transition-colors ml-2" title="Пожаловаться">
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {isLoggedIn && (isAdmin || user?.id === msg.author_id) && (
                  <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 text-secondary hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
              {isLoggedIn && replyingTo === msg.id && (
                <div className="mt-4 pl-8 space-y-3 border-l-2 border-accent/20">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Напишите ответ..." className="w-full p-4 bg-secondary border border-base rounded-2xl outline-none focus:ring-2 focus:ring-accent min-h-[100px] text-sm" />
                  <div className="flex gap-2">
                    <button onClick={() => handleSendReply(msg.id)} className="px-4 py-2 bg-accent text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg"><Send className="w-4 h-4" /> Отправить</button>
                    <button onClick={() => { setReplyText(''); setReplyingTo(null); }} className="px-4 py-2 bg-secondary border border-base rounded-xl font-bold text-sm">Отмена</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {isLoggedIn && !topic.is_locked && (
        <div className="p-8 bg-secondary rounded-3xl border border-base">
          <h3 className="font-bold mb-4">Ваш ответ</h3>
          <div className="relative">
            <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Напишите, что вы думаете..." className="w-full p-4 bg-primary border border-base rounded-2xl outline-none focus:ring-2 focus:ring-accent min-h-[150px] transition-all" />
            <button onClick={handleSendMessage} className="absolute bottom-4 right-4 px-6 py-2 bg-accent text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-accent/20">
              <Send className="w-4 h-4" /> Отправить
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReportModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base">
              <button onClick={() => setShowReportModal(false)} className="absolute top-6 right-6 text-secondary hover:text-primary"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-2">Пожаловаться</h2>
              <p className="text-secondary text-sm mb-6">Опишите причину жалобы на сообщение</p>
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