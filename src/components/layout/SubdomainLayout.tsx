/**
 * HSD Arena - Subdomain Layout
 * 
 * Authenticated layout for subdomain with TopBar and Sidebar
 */

import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Button } from '@/components';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { useAuth, useSubdomain } from '@/hooks';

interface SubdomainLayoutProps {
    children: ReactNode;
}

const SubdomainLayout = ({ children }: SubdomainLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const subdomain = useSubdomain();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 bg-card p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-role-primary rounded-full flex items-center justify-center text-inverse font-bold">
                        {user?.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-primary">{user?.username}</div>
                        <div className="text-sm text-tertiary">Manager</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    <div className="text-lg font-semibold text-secondary">
                        {subdomain}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        🚪 Logout
                    </Button>
                </div>
            </div>
            <div className="flex flex-1">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {children}
            </div>
        </div>
    );
};

export default SubdomainLayout;
