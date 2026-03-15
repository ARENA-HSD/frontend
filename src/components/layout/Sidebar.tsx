/**
 * HSD Arena - Sidebar Component
 * 
 * Navigation sidebar for subdomain layout
 */

import { useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import SidebarItem from '@/components/ui/SidebarItem';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    navItems?: NavItem[];
    showLogout?: boolean;
    onLogout?: () => void | Promise<void>;
}

interface NavItem {
    label: string;
    icon: string;
    path?: string;
    onClick?: () => void | Promise<void>;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    badge?: string;
}

const Sidebar = ({
    isOpen = true,
    onClose,
    navItems: navItemsProp,
    showLogout = false,
    onLogout,
}: SidebarProps) => {
    const location = useLocation();
    const navItems = navItemsProp || [
        {
            label: 'Quizzes',
            icon: '📊',
            path: '/manager/quizzes',
        },
        {
            label: 'Members',
            icon: '👥',
            path: '/manager/members',
        },
        {
            label: 'Logs',
            icon: '📋',
            path: '/manager/logs',
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
                    'w-64',
                    'h-full bg-sidebar sm:bg-page border-r border-light shadow-sm',
                    'transform transition-transform duration-200 ease-in-out',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-full w-full flex-col px-4 py-6">
                    <nav className="mt-2 flex flex-1 flex-col space-y-2">
                        {navItems.map((item) => (
                            <SidebarItem
                                key={item.path ?? item.label}
                                item={item}
                                onClose={onClose}
                                isActive={isActive}
                            />
                        ))}
                    </nav>

                    {showLogout && onLogout && (
                        <div className="mt-4 border-t border-light pt-4">
                            <SidebarItem
                                item={{
                                    label: 'Logout',
                                    icon: '🚪',
                                    variant: 'danger',
                                    onClick: onLogout,
                                }}
                                onClose={onClose}
                                isActive={isActive}
                            />
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;