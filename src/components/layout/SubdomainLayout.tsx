/**
 * HSD Arena - Subdomain Layout
 * 
 * Authenticated layout for subdomain with TopBar and Sidebar
 */

import { type ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth, useSubdomain } from '@/hooks';

interface SubdomainLayoutProps {
    children: ReactNode;
}

const SubdomainLayout = ({ children }: SubdomainLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const subdomain = useSubdomain();
    return (
        <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{user?.username}</div>
                        <div className="text-sm text-gray-500">Manager</div>
                    </div>
                </div>
                <div className="text-lg font-semibold text-gray-700">
                    {subdomain}
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
