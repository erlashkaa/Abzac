import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] px-4 md:px-6 py-12">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: brand / value */}
          <div className="lg:col-span-5 rounded-[32px] glass-effect border border-border-color/35 shadow-soft overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),transparent_60%)] blur-3xl" />
              <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.18),transparent_60%)] blur-3xl" />
            </div>
            <div className="relative p-7 md:p-10 h-full flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full glass-effect-light border border-border-color/30 text-xs font-black tracking-wide text-text-secondary w-fit">
                <Sparkles className="w-4 h-4 text-accent-color" />
                Premium reading platform
              </div>

              <h1 className="mt-6 text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {mode === 'login' ? 'С возвращением' : 'Создайте аккаунт'}
                <span className="block gradient-text">и продолжайте читать</span>
              </h1>
              <p className="mt-4 text-sm md:text-base text-secondary leading-relaxed max-w-md">
                Каталог, прогресс, избранное и форум — в одном месте. Интерфейс минималистичный, чтобы не отвлекать от текста.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: <BookOpen className="w-5 h-5" />, title: 'Каталог', desc: 'Поиск и жанры' },
                  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Профиль', desc: 'История и избранное' },
                  { icon: <MessageCircle className="w-5 h-5" />, title: 'Форум', desc: 'Обсуждения' },
                ].map((b) => (
                  <div key={b.title} className="rounded-[22px] glass-effect-light border border-border-color/30 p-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent-color/10 border border-accent-color/15 flex items-center justify-center text-accent-color">
                      {b.icon}
                    </div>
                    <div className="mt-3 font-black">{b.title}</div>
                    <div className="mt-1 text-xs text-tertiary">{b.desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8 text-[10px] text-tertiary font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Безопасное соединение
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-7 rounded-[32px] glass-effect border border-border-color/35 shadow-soft overflow-hidden">
            <div className="p-7 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-black text-tertiary uppercase tracking-widest">{mode === 'login' ? 'Вход' : 'Регистрация'}</div>
                  <div className="mt-2 text-2xl md:text-3xl font-black tracking-tight">
                    {mode === 'login' ? 'Авторизация' : 'Новый аккаунт'}
                  </div>
                  <p className="mt-2 text-sm text-secondary">
                    {mode === 'login' ? 'Введите email и пароль.' : 'Укажите имя, email и пароль.'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent-color/12 border border-accent-color/20 flex items-center justify-center text-accent-color">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    required
                    type="text"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-[22px] bg-bg-secondary/60 border border-border-color/35 text-sm ring-soft"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              required
              type="email"
              placeholder="Email адрес"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[22px] bg-bg-secondary/60 border border-border-color/35 text-sm ring-soft"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              required
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[22px] bg-bg-secondary/60 border border-border-color/35 text-sm ring-soft"
            />
          </div>

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" className="text-xs font-black text-accent-color hover:underline">Забыли пароль?</button>
            </div>
          )}

          <button
            disabled={isLoading}
            type="submit"
            className={clsx(
              "w-full py-4 rounded-[22px] font-black text-white transition-all flex items-center justify-center gap-2",
              isLoading ? "bg-accent-color/70 cursor-wait" : "bg-accent-color btn-glow hover:opacity-95 active:scale-[0.99]"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

              <div className="mt-8 pt-6 border-t border-border-color/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-secondary text-sm">
                  {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                  <button
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                    className="ml-2 font-black text-accent-color hover:underline"
                    type="button"
                  >
                    {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
                  </button>
                </p>
                <div className="text-[10px] text-tertiary font-black uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Secure
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};