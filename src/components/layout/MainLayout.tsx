/**
 * HSD Arena - Main Layout
 * 
 * Simple layout for main domain (public pages like register/login)
 */

import { type ReactNode } from 'react';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="min-h-screen bg-page flex flex-col">
            {/* Header */}
            <header className="bg-card border-b border-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">🎮</div>
                        <h1 className="text-2xl font-bold text-gradient">HSD Arena</h1>
                    </div>

                    <div className="text-sm text-secondary">
                        Quiz & Game Platform
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </main>

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
