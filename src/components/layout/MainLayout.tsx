/**
 * HSD Arena - Main Layout
 * 
 * Simple layout for main domain (public pages like register/login)
 */

import { Sidebar, Button } from '@/components';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';

interface MainLayoutProps {
    children: ReactNode;
    sidebar?: boolean;
}

const MainLayout = ({ children, sidebar = true }: MainLayoutProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
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
        <div className="min-h-screen bg-page flex flex-col">
            {/* Header */}
            <header className="bg-card border-b border-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">🎮</div>
                        <h1 className="text-2xl font-bold text-gradient">HSD Arena</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <div className="text-sm text-secondary hidden sm:block">
                            Quiz & Game Platform
                        </div>
                        {user && (
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                🚪 Logout
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {sidebar && <Sidebar isOpen={isOpen} onClose={toggleSidebar} navItems={navItems} />}
                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-card border-t border-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center">
                    <p className="text-sm text-tertiary">
                        © 2026 HSD Arena - Infrastructure Ready
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
