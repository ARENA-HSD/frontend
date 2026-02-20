/**
 * HSD Arena - Subdomain Layout
 * 
 * Authenticated layout for subdomain with TopBar and Sidebar
 */

import { type ReactNode, useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

interface SubdomainLayoutProps {
    children: ReactNode;
}

const SubdomainLayout = ({ children }: SubdomainLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-page flex flex-col">
            <TopBar />

            <div className="flex-1 flex">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SubdomainLayout;
