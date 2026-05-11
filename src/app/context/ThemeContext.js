import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const ACCENT_COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f59e0b' },
];
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [accent, setAccent] = useState(() => {
        const saved = localStorage.getItem('accent');
        return saved ? JSON.parse(saved) : ACCENT_COLORS[0];
    });
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    useEffect(() => {
        document.documentElement.style.setProperty('--accent-color', accent.value);
        localStorage.setItem('accent', JSON.stringify(accent));
    }, [accent]);
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    return (_jsx(ThemeContext.Provider, { value: { theme, toggleTheme, accent, setAccent, accentColors: ACCENT_COLORS }, children: children }));
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
