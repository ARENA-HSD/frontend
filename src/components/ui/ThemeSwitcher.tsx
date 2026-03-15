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
                        type="button"
                        aria-pressed={isActive}
                        aria-label={`${label} theme`}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-md font-bold
                            transition-all duration-200 ease-in-out
                            ${isActive
                                ? 'bg-role-primary text-[color-mix(in_srgb,var(--role-primary),black_85%)] shadow-sm scale-105'
                                : 'text-secondary hover:text-primary hover:bg-card'
                            }
                        `}
                        title={label}
                    >
                        <Icon className="w-5 h-5" strokeWidth={3} />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeSwitcher;
