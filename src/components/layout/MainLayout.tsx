/**
 * HSD Arena - Main Layout
 * 
 * Simple layout for main domain (public pages like register/login)
 */

import { Sidebar, Button } from '@/components';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { type ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import HeaderLogo from './HeaderLogo';

interface MainLayoutProps {
    children: ReactNode;
    sidebar?: boolean;
    navItems?: NavItem[];
}

interface NavItem {
    label: string;
    icon: string;
    path: string;
    disabled?: boolean;
    badge?: string;
}

const PUBLIC_ROUTES = ['/', '/login', '/register'];

const MainLayout = ({ children, sidebar = true, navItems }: MainLayoutProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, isAuthenticated } = useAuth();

    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItemsList = navItems || [
        {
            label: 'Organizations',
            icon: '📊',
            path: '/organizations',
        },
        {
            label: 'Profile',
            icon: '👥',
            path: '/profile',
        },
        {
            label: 'Invitations',
            icon: '📩',
            path: '/invitations',
        },
        {
            label: 'Payments',
            icon: '💳',
            path: '/payments',
            disabled: true,
            badge: 'V2',
        },
    ];

    return (
        <div className="h-screen w-full px-16 pt-16 flex flex-col">
            <div className="bg-page px-20 w-full flex flex-col flex-1 rounded-3xl min-h-0">
                {/* Header */}
                <header className="">
                    <div className="h-auto flex items-center justify-between">
                        <HeaderLogo />
                        <div className="flex items-center gap-4 mr-4">
                            <ThemeSwitcher />
                            {isAuthenticated && !isPublicRoute && (
                                <button onClick={handleLogout} className="text-lg font-bold">
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 min-h-0">
                    {sidebar && <Sidebar isOpen={isOpen} onClose={toggleSidebar} navItems={navItemsList} />}
                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-8">
                        <div className="w-full h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            {/* Footer */}
            <footer className="transparent shrink-0">
                <div className="max-w-7xl mx-auto p-8 h-12 flex items-center justify-center">
                    <p className="text-sm text-tertiary">
                        © 2026 QuizStrike | Learn - Play - Fun
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;