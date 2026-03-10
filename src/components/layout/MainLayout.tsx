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
    const { logout, isAuthenticated, user } = useAuth();

    // Attempt to extract subdomain from URL manually if useSubdomain hook isn't imported
    // but the best way is using location.hostname for multi-tenant apps
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const parts = hostname.split('.');
    let subdomain = '';
    if (!isLocalhost && parts.length >= 3) {
        subdomain = parts[0];
    } else if (isLocalhost && parts.length > 1 && parts[0] !== 'localhost') {
        subdomain = parts[0];
    }

    // Find active organization to display role
    const activeOrg = user?.organizations?.find(org => org.subdomain === subdomain);
    const displayRole = activeOrg ? activeOrg.role.charAt(0) + activeOrg.role.slice(1).toLowerCase().replace('_', ' ') : '';

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
        <div className="h-screen w-full px-4 py-4 lg:px-12 lg:py-8 flex flex-col">
            <div className="bg-card lg:px-12 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full flex flex-col flex-1 rounded-[3rem] min-h-0 overflow-hidden">
                {/* Header */}
                <header className="pt-6 pb-2">
                    <div className="flex items-center justify-between">
                        <HeaderLogo />
                        <div className="flex items-center gap-8 mr-4">
                            <ThemeSwitcher />
                            {isAuthenticated && !isPublicRoute && (
                                <div className="flex items-center gap-6">
                                    <div className="text-right flex flex-col">
                                        <span className="font-bold text-primary leading-tight">{user?.username || 'User'}</span>
                                        {displayRole && (
                                            <span className="text-sm font-medium text-secondary leading-tight">({displayRole})</span>
                                        )}
                                    </div>
                                    {subdomain && (
                                        <span className="font-extrabold text-primary border-l border-light pl-6 hidden md:block">
                                            {subdomain}
                                        </span>
                                    )}
                                    <button onClick={handleLogout} className="text-lg font-bold text-primary hover:text-red-600 transition-colors ml-4 border-l border-light pl-6">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 min-h-0">
                    {sidebar && <Sidebar isOpen={isOpen} onClose={toggleSidebar} navItems={navItemsList} />}
                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto pt-4 pb-2">
                        <div className="w-full h-full">
                            {children}
                        </div>
                    </main>
                </div>

                {/* Footer */}
                <footer className="transparent shrink-0">
                    <div className="max-w-7xl mx-auto p-4 flex items-center justify-start lg:pl-[16.5rem]">
                        <p className="text-sm text-tertiary font-medium">
                            HSD Arena v2
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MainLayout;
