import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-border-color/40">
      <div className="glass-effect">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-color to-accent-secondary flex items-center justify-center text-white shadow-soft">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <div className="font-black tracking-tight text-lg">Абзац</div>
                  <div className="text-xs text-secondary">Премиальная платформа чтения</div>
                </div>
              </div>
              <p className="text-sm text-secondary leading-relaxed max-w-md">
                Читайте, сохраняйте прогресс, собирайте избранное и обсуждайте книги. Мы бережно делаем интерфейс
                минимальным — чтобы фокус оставался на тексте.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-secondary">
                <span className="kbd">Dark</span>
                <span className="kbd">Glass</span>
                <span className="kbd">Motion</span>
                <span className="kbd flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent-color" />
                  Premium UI
                </span>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-widest text-tertiary">Продукт</div>
                <div className="flex flex-col gap-2 text-sm">
                  <Link className="text-secondary hover:text-text-primary smooth-transition" to="/catalog">Каталог</Link>
                  <Link className="text-secondary hover:text-text-primary smooth-transition" to="/forum">Форум</Link>
                  <Link className="text-secondary hover:text-text-primary smooth-transition" to="/profile">Профиль</Link>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-widest text-tertiary">Информация</div>
                <div className="flex flex-col gap-2 text-sm">
                  <Link className="text-secondary hover:text-text-primary smooth-transition" to="/about">О проекте</Link>
                  <Link className="text-secondary hover:text-text-primary smooth-transition" to="/faq">Помощь</Link>
                  <Link className="text-secondary hover:text-text-primary smooth-transition" to="/terms">Условия</Link>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-widest text-tertiary">Право</div>
                <div className="flex flex-col gap-2 text-sm">
                  <Link className="text-secondary hover:text-text-primary smooth-transition" to="/policy">Политика</Link>
                  <Link className="text-secondary hover:text-text-primary smooth-transition" to="/terms">Договор</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-border-color/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-secondary">
            <p>© 2026 Абзац. Все права защищены.</p>
            <p className="opacity-70">Сделано как продукт: минимализм, скорость, доступность.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

