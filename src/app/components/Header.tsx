import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, User, LogOut, Menu, X, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = useMemo(
    () => ([
      { label: 'Главная', path: '/', hint: 'H' },
      { label: 'Каталог', path: '/catalog', hint: 'C' },
      { label: 'Форум', path: '/forum', hint: 'F' },
      ...(isAdmin && isLoggedIn ? [{ label: 'Админ', path: '/admin', hint: 'A' }] : []),
    ]),
    [isAdmin, isLoggedIn]
  );

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false);
        setIsSearchOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setIsSearchOpen(false);
    setQuery('');
  }, [location.pathname]);

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter((i) => i.label.toLowerCase().includes(q) || i.path.toLowerCase().includes(q));
  }, [navItems, query]);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 glass-effect border-b border-border-color/30" />

      <div className="relative container mx-auto px-4 md:px-6 h-16 flex items-center gap-3">
        {/* Brand */}
        <Link to="/" className="group shrink-0 flex items-center gap-3 smooth-transition">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-color to-accent-secondary flex items-center justify-center text-white font-black text-sm shadow-soft btn-glow">
              А
            </div>
            <div className="absolute -inset-2 rounded-[18px] bg-accent-color/10 blur-xl opacity-0 group-hover:opacity-100 smooth-transition pointer-events-none" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-[15px] font-black tracking-tight text-text-primary">Абзац</span>
            <span className="text-[11px] text-tertiary -mt-0.5">reading platform</span>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="hidden lg:flex items-center justify-center flex-1">
          <div className="glass-effect-light border border-border-color/30 rounded-2xl px-2 py-1.5 flex items-center gap-1 shadow-soft">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-4 py-2 rounded-xl text-sm font-semibold smooth-transition",
                  isActive(item.path)
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {isActive(item.path) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-accent-color/15 border border-accent-color/25"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {item.label}
                  <span className="hidden xl:inline kbd opacity-70">{item.hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl glass-effect-light border border-border-color/30 text-text-secondary hover:text-text-primary smooth-transition ring-soft"
            title="Навигация (Ctrl/⌘ K)"
            type="button"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm font-semibold">Поиск</span>
            <span className="kbd ml-1">Ctrl K</span>
          </button>

          <motion.button
            whileHover={{ rotate: 12 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl glass-effect-light border border-border-color/30 text-text-secondary hover:text-text-primary smooth-transition ring-soft"
            title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            type="button"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </motion.button>

          {isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-border-color/30">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2.5 py-2 rounded-2xl hover:bg-bg-secondary/40 smooth-transition ring-soft"
              >
                <div className="w-9 h-9 rounded-2xl overflow-hidden border border-border-color/40 bg-bg-tertiary/30">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-sm font-black">{user?.username || 'Профиль'}</div>
                  <div className="text-[11px] text-tertiary">Аккаунт</div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="p-2.5 rounded-2xl hover:bg-error/15 text-text-secondary hover:text-error smooth-transition ring-soft"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent-color text-white font-bold text-sm hover:opacity-95 smooth-transition btn-glow ring-soft"
            >
              Войти
            </Link>
          )}

          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2.5 rounded-2xl glass-effect-light border border-border-color/30 text-text-secondary hover:text-text-primary smooth-transition ring-soft"
            type="button"
            aria-label="Открыть меню"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] lg:hidden"
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMobileMenu(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              className="absolute right-3 top-3 bottom-3 w-[min(420px,calc(100vw-24px))] rounded-[28px] glass-effect border border-border-color/35 shadow-soft overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-border-color/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-color to-accent-secondary flex items-center justify-center text-white font-black shadow-soft">
                    А
                  </div>
                  <div className="leading-tight">
                    <div className="font-black tracking-tight">Навигация</div>
                    <div className="text-xs text-tertiary">Быстрый доступ к разделам</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2.5 rounded-2xl hover:bg-bg-secondary/40 text-text-secondary hover:text-text-primary smooth-transition ring-soft"
                  type="button"
                  aria-label="Закрыть меню"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск разделов…"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg-secondary/60 border border-border-color/35 text-sm ring-soft"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {filteredNav.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-2xl border smooth-transition",
                        isActive(item.path)
                          ? "bg-accent-color/12 border-accent-color/25 text-text-primary"
                          : "bg-bg-secondary/30 border-border-color/30 text-text-secondary hover:text-text-primary hover:bg-bg-secondary/45"
                      )}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className="kbd">{item.hint}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-border-color/30 space-y-2">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-secondary/30 border border-border-color/30 hover:bg-bg-secondary/45 smooth-transition"
                      >
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-border-color/40 bg-bg-tertiary/30">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-secondary">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="leading-tight">
                          <div className="font-black">{user?.username || 'Профиль'}</div>
                          <div className="text-xs text-tertiary">{user?.email || 'Аккаунт'}</div>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          navigate('/auth');
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-error/10 border border-error/20 text-error hover:bg-error/15 smooth-transition"
                      >
                        <span className="font-black">Выйти</span>
                        <LogOut className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-accent-color text-white font-black btn-glow"
                    >
                      Войти / Регистрация
                    </Link>
                  )}
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Search (Desktop) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] hidden md:block">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="relative mx-auto mt-24 w-[min(720px,calc(100vw-32px))] rounded-[28px] glass-effect border border-border-color/35 shadow-soft overflow-hidden"
            >
              <div className="p-4 border-b border-border-color/30 flex items-center justify-between">
                <div className="text-sm font-black tracking-tight">Переход к разделу</div>
                <button className="p-2.5 rounded-2xl hover:bg-bg-secondary/40 text-text-secondary hover:text-text-primary smooth-transition ring-soft" onClick={() => setIsSearchOpen(false)} type="button">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Начни вводить: каталог, форум, профиль…"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg-secondary/60 border border-border-color/35 text-sm ring-soft"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {(filteredNav.length ? filteredNav : navItems).slice(0, 6).map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-2xl border smooth-transition text-left",
                        isActive(item.path)
                          ? "bg-accent-color/12 border-accent-color/25 text-text-primary"
                          : "bg-bg-secondary/30 border-border-color/30 text-text-secondary hover:text-text-primary hover:bg-bg-secondary/45"
                      )}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className="kbd">{item.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};