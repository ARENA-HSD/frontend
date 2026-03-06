/**
 * HSD Arena - Theme Switcher Component
 * 
 * Gorgeous 3-way toggle: Light ☀️ / Dark 🌙 / Ocean 🌊
 */

import { useTheme, type Theme } from '@/hooks/useTheme';
import { Sun, Moon, Waves } from 'lucide-react';

const themes: Array<{ key: Theme; label: string; icon: typeof Sun }> = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'ocean', label: 'Ocean', icon: Waves },
];

const ThemeSwitcher = () => {
    const { theme, changeTheme } = useTheme();

    return (
        <div className="flex items-center bg-page rounded-full p-1 border border-light gap-0.5">
            {themes.map(({ key, label, icon: Icon }) => {
                const isActive = theme === key;
                return (
                    <button
                        key={key}
                        onClick={() => changeTheme(key)}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                            transition-all duration-200 ease-in-out
                            ${isActive
                                ? 'bg-role-primary text-inverse shadow-sm scale-105'
                                : 'text-tertiary hover:text-primary hover:bg-card'
                            }
                        `}
                        title={label}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeSwitcher;
