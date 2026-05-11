import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pin, Lock, MessageCircle, Loader2, X, Send, Trash2, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { forumApi, type ForumTopic } from '../api/forumApi';

export const Forum: React.FC<{ isAdmin?: boolean }> = () => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState<string | null>(null);
  const tags = ['Обсуждение', 'Теории', 'Спойлеры', 'Поиск книг', 'Конкурсы'];
  const observerTarget = useRef(null);
  const { isLoggedIn, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Report
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTopicId, setReportTopicId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');

  const openReportTopic = (topicId: number, e: React.MouseEvent) => {
    e.preventDefault();
    setReportTopicId(topicId);
    setReportReason('');
    setReportSuccess(false);
    setReportError('');
    setShowReportModal(true);
  };

  const submitTopicReport = async () => {
    if (!reportTopicId || !reportReason.trim()) return;
    try {
      await forumApi.reportTopic(reportTopicId, reportReason);
      setReportSuccess(true);
      setTimeout(() => setShowReportModal(false), 1500);
    } catch (e: any) {
      setReportError(e.response?.data?.detail || 'Ошибка при отправке жалобы');
    }
  };

  const fetchTopics = async (
    pageNum: number,
    append: boolean = false,
    opts?: { tag?: string | null; search?: string }
  ) => {
    if (isLoading) return;
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
      } else {
        setTopics(chunk);
      }
      setHasMore(!resp.last);
    } catch {
      if (!append) setTopics([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchTopics(1, false);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchTopics(nextPage, true);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [page, hasMore, isLoading, activeTagFilter, searchQuery]);

  const togglePin = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const resp = await forumApi.togglePin(id);
      setTopics(prev => prev.map(t => t.id === id ? { ...t, is_pinned: resp.data.is_pinned } : t));
    } catch {}
  };

  const deleteTopic = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await forumApi.deleteTopic(id);
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch {}
  };

  const handleCreateTopic = async () => {
    if (!newTitle.trim() || !newContent.trim() || !newTag) return;
    try {
      const resp = await forumApi.createTopic({ title: newTitle, content: newContent, tag: newTag });
      setTopics(prev => [resp.data, ...prev]);
      setShowNewTopic(false);
      setNewTitle('');
      setNewContent('');
      setNewTag(null);
    } catch {}
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Форум Абзац</h1>
          <p className="text-secondary">Обсуждайте книги и находите единомышленников</p>
        </div>
        {isLoggedIn && (
          <button onClick={() => setShowNewTopic(true)} className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 transition-transform active:scale-95">
            <Plus className="w-5 h-5" /> Новая тема
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {(topics || []).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)).map((topic) => (
            <Link key={topic.id} to={`/forum/topic/${topic.id}`} className="block p-6 bg-primary border border-base rounded-2xl hover:border-accent transition-all group relative">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-wrap gap-2 pr-20">
                  {topic.is_pinned && <span className="p-1 bg-amber-500/10 text-amber-500 rounded"><Pin className="w-4 h-4" /></span>}
                  {topic.is_locked && <span className="p-1 bg-secondary text-secondary rounded"><Lock className="w-4 h-4" /></span>}
                  <h3 className="text-lg font-bold group-hover:text-accent transition-colors">{topic.title}</h3>
                </div>
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isLoggedIn && (
                    <button onClick={(e) => openReportTopic(topic.id, e)} className="p-2 rounded-lg border border-base bg-primary hover:bg-amber-500/10 text-secondary hover:text-amber-500" title="Пожаловаться"><Flag className="w-4 h-4" /></button>
                  )}
                  {isAdmin && isLoggedIn && (
                    <>
                      <button onClick={(e) => togglePin(topic.id, e)} className={clsx("p-2 rounded-lg border border-base bg-primary hover:bg-amber-500/10", topic.is_pinned ? "text-amber-500 border-amber-500/30" : "text-secondary hover:text-amber-500")} title={topic.is_pinned ? "Открепить" : "Закрепить"}><Pin className="w-4 h-4" /></button>
                      <button onClick={(e) => deleteTopic(topic.id, e)} className="p-2 rounded-lg border border-base bg-primary hover:bg-rose-500/10 text-secondary hover:text-rose-500" title="Удалить"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-secondary">
                  <div className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {topic.replies_count} ответов</div>
                  <div>Автор: {topic.author_name}</div>
                </div>
                <span className="px-2 py-1 bg-secondary text-[10px] font-bold rounded uppercase">{topic.tag}</span>
              </div>
            </Link>
          ))}
          <div ref={observerTarget} className="flex justify-center py-8">
            {isLoading && <Loader2 className="w-6 h-6 animate-spin text-accent" />}
          </div>
        </div>
        <aside className="space-y-6">
          <div className="p-6 bg-secondary rounded-2xl border border-base sticky top-24">
            <div className="mb-6">
              <label className="text-xs font-bold uppercase text-secondary mb-2 block">Поиск по форуму</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input 
                  type="text" 
                  placeholder="Поиск по заголовку темы..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPage(1);
                      setHasMore(true);
                      fetchTopics(1, false, { search: searchQuery });
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-primary border border-base rounded-xl text-sm outline-none focus:border-accent transition-all"
                />
              </div>
            </div>
            
            <h4 className="font-bold mb-4">Фильтр по тегам</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <button 
                  key={t} 
                  onClick={() => {
                    const nextTag = activeTagFilter === t ? null : t;
                    setActiveTagFilter(nextTag);
                    setPage(1);
                    setHasMore(true);
                    fetchTopics(1, false, { tag: nextTag });
                  }}
                  className={clsx(
                    "px-3 py-1.5 border rounded-lg text-xs transition-colors",
                    activeTagFilter === t ? "bg-accent text-white border-accent" : "bg-primary border-base hover:border-accent"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* New Topic Modal */}
      <AnimatePresence>
        {showNewTopic && isLoggedIn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewTopic(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-primary rounded-3xl p-8 shadow-2xl border border-base">
              <button onClick={() => setShowNewTopic(false)} className="absolute top-6 right-6 text-secondary hover:text-primary transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-6">Создать новую тему</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-secondary mb-2 block">Заголовок темы</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="О чем вы хотите поговорить?" className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-secondary mb-2 block">Сообщение</label>
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Опишите вашу идею подробнее..." className="w-full px-4 py-3 bg-secondary border border-base rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all min-h-[150px]" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-secondary mb-2 block">Тег темы</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                      <button
                        key={t}
                        onClick={() => setNewTag(newTag === t ? null : t)}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          newTag === t ? "bg-accent text-white border-accent" : "bg-secondary text-secondary border-base hover:border-accent/30"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <button onClick={handleCreateTopic} className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:opacity-90 transition-all">
                    <Send className="w-5 h-5" /> Опубликовать тему
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Topic Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReportModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-primary rounded-3xl p-8 shadow-2xl border border-base">
              <button onClick={() => setShowReportModal(false)} className="absolute top-6 right-6 text-secondary hover:text-primary"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-2">Пожаловаться на тему</h2>
              <p className="text-secondary text-sm mb-6">Опишите причину жалобы</p>
              {reportSuccess ? (
                <div className="p-4 bg-green-500/10 text-green-500 rounded-xl text-sm font-medium text-center">✓ Жалоба отправлена</div>
              ) : (
                <div className="space-y-4">
                  {reportError && <div className="p-3 bg-rose-500/10 text-rose-500 text-sm rounded-xl">{reportError}</div>}
                  <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Причина жалобы..." className="w-full p-4 bg-secondary border border-base rounded-xl outline-none focus:ring-2 focus:ring-accent h-24" />
                  <button onClick={submitTopicReport} disabled={!reportReason.trim()} className={clsx("w-full py-3 rounded-xl font-bold transition-all", reportReason.trim() ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-secondary text-secondary cursor-not-allowed")}>
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