/**
 * HSD Arena - Sidebar Component
 * 
 * Navigation sidebar for subdomain layout
 */

import { useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useManagerNavigate, useSubdomain } from '@/hooks';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

interface NavItem {
    label: string;
    icon: string;
    path: string;
    disabled?: boolean;
    badge?: string;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
    const location = useLocation();
    const navigate = useManagerNavigate();
    const subdomain = useSubdomain();

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            icon: '📊',
            path: '/manager/quizzes',
        },
        {
            label: 'Members',
            icon: '👥',
            path: '/members',
            disabled: true,
            badge: 'v2.0',
        },
        {
            label: 'Logs',
            icon: '📋',
            path: '/logs',
        },
    ];

    const isActive = (path: string) => {
        const finalPath = subdomain ? path : `/subdomain${path}`;
        if (path === '/manager/quizzes') {
            return location.pathname === finalPath || location.pathname === '/';
        }
        return location.pathname.startsWith(finalPath);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && onClose && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:static inset-y-0 left-0 z-40',
                    'w-64 bg-card border-r border-light',
                    'transform transition-transform duration-200 ease-in-out',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={(e) => {
                                if (item.disabled) {
                                    e.preventDefault();
                                } else {
                                    navigate(item.path);
                                }
                                onClose?.();
                            }}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                                'transition-colors duration-150',
                                'group relative text-left',
                                item.disabled && 'opacity-50 cursor-not-allowed',
                                isActive(item.path) && !item.disabled
                                    ? 'bg-role-primary text-inverse'
                                    : 'text-primary hover:bg-role-primary-light'
                            )}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>

                            {item.badge && (
                                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-role-info-light text-role-info">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-light">
                    <div className="text-xs text-tertiary text-center">
                        HSD Arena v2
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
