import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Suspense, lazy, useEffect, useRef } from 'react';
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
const LoadingFallback = () => (_jsx("div", { className: "min-h-[70vh] flex items-center justify-center", children: _jsxs("div", { className: "w-full max-w-md px-6", children: [_jsxs("div", { className: "glass-effect rounded-[28px] border border-border-color/40 p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-12 w-12 rounded-2xl bg-accent-color/15 border border-accent-color/25 skeleton" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-3 w-40 rounded-full skeleton" }), _jsx("div", { className: "h-3 w-56 rounded-full skeleton" })] })] }), _jsx("div", { className: "mt-5 h-10 rounded-2xl skeleton" })] }), _jsx("p", { className: "mt-4 text-center text-xs text-secondary", children: "\u041F\u043E\u0434\u0433\u043E\u0442\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u043C \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u2026" })] }) }));
const RequireAuth = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/auth", replace: true });
};
const RequireAdmin = ({ children }) => {
    const { isLoggedIn, user } = useAuth();
    const warnedRef = useRef(false);
    useEffect(() => {
        if (isLoggedIn && user && user.role !== 'admin' && !warnedRef.current) {
            warnedRef.current = true;
            toast.error('Нужна роль администратора. Войдите как admin@example.com (пароль из сида) или выполните в БД: UPDATE users SET role = \'admin\' WHERE id = …', { duration: 8000 });
        }
    }, [isLoggedIn, user]);
    if (!isLoggedIn)
        return _jsx(Navigate, { to: "/auth", replace: true });
    if (user?.role !== 'admin')
        return _jsx(Navigate, { to: "/", replace: true });
    return _jsx(_Fragment, { children: children });
};
const AppShell = () => {
    return (_jsx(Router, { children: _jsxs("div", { className: "min-h-screen flex flex-col bg-bg-primary text-text-primary transition-colors duration-300 relative overflow-x-hidden", children: [_jsx(Toaster, { richColors: true, closeButton: true, position: "top-center" }), _jsx(AppBackdrop, {}), _jsx(Header, {}), _jsx("main", { className: "flex-1 relative z-10", children: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/catalog", element: _jsx(Catalog, {}) }), _jsx(Route, { path: "/book/:id", element: _jsx(BookDetails, {}) }), _jsx(Route, { path: "/reader", element: _jsx(Reader, {}) }), _jsx(Route, { path: "/forum", element: _jsx(Forum, { isAdmin: true }) }), _jsx(Route, { path: "/forum/topic/:id", element: _jsx(ForumTopic, {}) }), _jsx(Route, { path: "/profile", element: _jsx(Profile, {}) }), _jsx(Route, { path: "/user/:id", element: _jsx(UserProfile, {}) }), _jsx(Route, { path: "/admin", element: _jsx(RequireAdmin, { children: _jsx(Admin, {}) }) }), _jsx(Route, { path: "/about", element: _jsxs("div", { className: "container mx-auto p-12 text-center", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "\u041E \u043F\u0440\u043E\u0435\u043A\u0442\u0435 \u0410\u0431\u0437\u0430\u0446" }), _jsx("p", { className: "text-secondary", children: "\u0423\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043D\u0438\u0436\u043D\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0441 \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u043C \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435\u043C \u0438 \u0443\u0434\u043E\u0431\u043D\u044B\u043C \u0434\u043E\u0441\u0442\u0443\u043F\u043E\u043C \u043A \u043B\u044E\u0431\u0438\u043C\u044B\u043C \u0438\u0441\u0442\u043E\u0440\u0438\u044F\u043C." })] }) }), _jsx(Route, { path: "/faq", element: _jsxs("div", { className: "container mx-auto p-12 text-center", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "\u041F\u043E\u043C\u043E\u0449\u044C" }), _jsx("p", { className: "text-secondary", children: "\u0417\u0434\u0435\u0441\u044C \u0431\u0443\u0434\u0443\u0442 \u043E\u0442\u0432\u0435\u0442\u044B \u043D\u0430 \u0447\u0430\u0441\u0442\u043E \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043C\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B." })] }) }), _jsx(Route, { path: "/policy", element: _jsx(Privacy, {}) }), _jsx(Route, { path: "/terms", element: _jsx(Terms, {}) }), _jsx(Route, { path: "/auth", element: _jsx(Auth, {}) })] }) }) }), _jsx(AppFooter, {})] }) }));
};
const App = () => {
    return (_jsx(ThemeProvider, { children: _jsx(AuthProvider, { children: _jsx(AppShell, {}) }) }));
};
export default App;
