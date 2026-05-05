/**
 * HSD Arena - Main Layout
 * 
 * Simple layout for main domain (public pages like register/login)
 */

import { Sidebar } from '@/components';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { type ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useSubdomain } from '@/hooks';
import { authService } from '@/services';
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

const PUBLIC_ROUTES = ['/login', '/register'];

const MainLayout = ({ children, sidebar = true, navItems }: MainLayoutProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, isAuthenticated } = useAuth();
    const subdomain = useSubdomain();

    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

    const handleLogout = async () => {
        if (subdomain) {
            // On a subdomain — clear auth data directly and redirect immediately
            // Avoid React state update (which would cause ProtectedRoute to flash /login)
            authService.clearAuthData();

            const port = window.location.port ? `:${window.location.port}` : '';
            const host = window.location.hostname;

            let mainHost = '';
            if (host.includes('localhost')) {
                mainHost = 'localhost';
            } else {
                const baseDomain = import.meta.env.VITE_BASE_DOMAIN as string | undefined;
                mainHost = baseDomain || host.split('.').slice(-2).join('.');
            }

            window.location.href = `${window.location.protocol}//${mainHost}${port}/organizations`;
            return;
        }

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
        <div className="h-screen w-full px-3 pt-3 sm:px-10 sm:pt-10 lg:px-16 lg:pt-16 flex flex-col">
            <div className="bg-page px-4 sm:px-8 lg:px-20 w-full flex flex-col flex-1 rounded-2xl lg:rounded-3xl min-h-0">
                {/* Header */}
                <header>
                    <div className="h-auto flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <HeaderLogo />
                        </div>
                        {import.meta.env.DEV && (
                            <div className="hidden lg:flex px-4 py-1.5 rounded-full bg-yellow-100 border border-yellow-300 shadow-sm">
                                <span className="text-sm font-semibold text-yellow-700 tracking-wide">
                                    You are on <span className="font-extrabold">DEVELOPMENT</span> environment
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 sm:gap-4 lg:mr-4 shrink-0">
                            <ThemeSwitcher />
                            {sidebar && (
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(true)}
                                    className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-primary/30 text-primary"
                                    aria-label="Open navigation menu"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 min-h-0">
                    {sidebar && (
                        <Sidebar
                            isOpen={isOpen}
                            onClose={toggleSidebar}
                            navItems={navItemsList}
                            showLogout={isAuthenticated && !isPublicRoute}
                            onLogout={handleLogout}
                        />
                    )}
                    {/* Main Content */}
                    <main className="flex-1 min-w-0 overflow-y-auto scrollbar-hide p-4 sm:p-6 lg:p-8">
                        <div className="w-full h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            {/* Footer */}
            <footer className="transparent shrink-0">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:p-6 lg:p-8 h-auto lg:h-12 flex items-center justify-center text-center">
                    <p className="text-xs sm:text-sm text-tertiary">
                        © 2026 QuizStrike | Learn - Play - Fun
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;