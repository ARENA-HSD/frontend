/**
 * HSD Arena - useTheme Hook
 * 
 * Hook for managing theme (light / dark / ocean mode)
 */

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'ocean';

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme') as Theme;
        if (saved && ['light', 'dark', 'ocean'].includes(saved)) return saved;
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;

        // Remove all theme attributes, then set the current one
        root.removeAttribute('data-theme');
        root.classList.remove('dark');

        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            root.classList.add('dark');
        } else if (theme === 'ocean') {
            root.setAttribute('data-theme', 'ocean');
        }
        // light = no attribute (default :root styles)

        localStorage.setItem('theme', theme);
    }, [theme]);

    const changeTheme = (newTheme: Theme) => {
        setTheme(newTheme);
    };

    const cycleTheme = () => {
        setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'ocean';
            return 'light';
        });
    };

    return { theme, changeTheme, cycleTheme };
};
