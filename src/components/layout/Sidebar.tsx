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
                    'transform transition-transform duration-200 ease-in-out',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <nav className="flex flex-col h-full w-full mt-8 space-y-2">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            item={item}
                            onClose={onClose}
                            isActive={isActive}
                        />
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-xs text-tertiary text-center">
                        HSD Arena v2
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;