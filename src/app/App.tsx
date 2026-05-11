import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { AppBackdrop } from './components/AppBackdrop';
import { AppFooter } from './components/AppFooter';

// Ленивая загрузка страниц для оптимизации
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Catalog = lazy(() => import('./pages/Catalog').then(module => ({ default: module.Catalog })));
const BookDetails = lazy(() => import('./pages/BookDetails').then(module => ({ default: module.BookDetails })));
const Reader = lazy(() => import('./pages/Reader').then(module => ({ default: module.Reader })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const Forum = lazy(() => import('./pages/Forum').then(module => ({ default: module.Forum })));
const ForumTopic = lazy(() => import('./pages/ForumTopic').then(module => ({ default: module.ForumTopic })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(module => ({ default: module.UserProfile })));
const Auth = lazy(() => import('./pages/Auth').then(module => ({ default: module.Auth })));
const Privacy = lazy(() => import('./pages/Privacy').then(module => ({ default: module.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then(module => ({ default: module.Terms })));

// Компонент загрузки
const LoadingFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="w-full max-w-md px-6">
      <div className="glass-effect rounded-[28px] border border-border-color/40 p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-accent-color/15 border border-accent-color/25 skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded-full skeleton" />
            <div className="h-3 w-56 rounded-full skeleton" />
          </div>
        </div>
        <div className="mt-5 h-10 rounded-2xl skeleton" />
      </div>
      <p className="mt-4 text-center text-xs text-secondary">Подготавливаем интерфейс…</p>
    </div>
  </div>
);

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/auth" replace />;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const warnedRef = useRef(false);
  useEffect(() => {
    if (isLoggedIn && user && user.role !== 'admin' && !warnedRef.current) {
      warnedRef.current = true;
      toast.error(
        'Нужна роль администратора. Войдите как admin@example.com (пароль из сида) или выполните в БД: UPDATE users SET role = \'admin\' WHERE id = …',
        { duration: 8000 },
      );
    }
  }, [isLoggedIn, user]);
  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppShell: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary transition-colors duration-300 relative overflow-x-hidden">
        <Toaster richColors closeButton position="top-center" />
        <AppBackdrop />

        <Header />
        <main className="flex-1 relative z-10">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/reader" element={<Reader />} />
              <Route path="/forum" element={<Forum isAdmin={true} />} />
              <Route path="/forum/topic/:id" element={<ForumTopic />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/:id" element={<UserProfile />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <Admin />
                  </RequireAdmin>
                }
              />
              <Route path="/about" element={<div className="container mx-auto p-12 text-center"><h1 className="text-4xl font-bold mb-4">О проекте Абзац</h1><p className="text-secondary">Уникальная книжная платформа с современным оформлением и удобным доступом к любимым историям.</p></div>} />
              <Route path="/faq" element={<div className="container mx-auto p-12 text-center"><h1 className="text-4xl font-bold mb-4">Помощь</h1><p className="text-secondary">Здесь будут ответы на часто задаваемые вопросы.</p></div>} />
              <Route path="/policy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </Suspense>
        </main>
        <AppFooter />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;