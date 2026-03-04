/**
 * HSD Arena - Sidebar Component
 * 
 * Navigation sidebar for subdomain layout
 */

import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    navItems?: NavItem[];
}

interface NavItem {
    label: string;
    icon: string;
    path: string;
    disabled?: boolean;
    badge?: string;
}

const Sidebar = ({ isOpen = true, onClose, navItems: navItemsProp }: SidebarProps) => {
    const location = useLocation();
    const navItems = navItemsProp || [
        {
            label: 'Dashboard',
            icon: '📊',
            path: '/organizations',
        },
        {
            label: 'Members',
            icon: '👥',
            path: '/members',
        },
        {
            label: 'Logs',
            icon: '📋',
            path: '/logs',
        },
    ];

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
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
                        <Link
                            key={item.path}
                            to={item.disabled ? '#' : item.path}
                            onClick={(e) => {
                                if (item.disabled) e.preventDefault();
                                onClose?.();
                            }}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg',
                                'transition-colors duration-150',
                                'group relative',
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
                        </Link>
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