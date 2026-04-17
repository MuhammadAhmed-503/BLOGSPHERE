import { useEffect, useState } from 'react';
const getInitialTheme = () => {
    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
export function useThemeMode() {
    const [theme, setTheme] = useState(() => getInitialTheme());
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        window.localStorage.setItem('theme', theme);
    }, [theme]);
    useEffect(() => {
        const onStorage = (event) => {
            if (event.key === 'theme' && (event.newValue === 'light' || event.newValue === 'dark')) {
                setTheme(event.newValue);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('storage', onStorage);
        };
    }, []);
    const toggleTheme = () => {
        setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
    };
    return { theme, toggleTheme };
}
