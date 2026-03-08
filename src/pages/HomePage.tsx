/**
 * Quiz Strike - Home Page
 * 
 * Landing page with custom UI and geometric background
 */

import { Link } from 'react-router-dom';
import WelcomeBackground from '@/components/WelcomeBackground';
import { useSubdomain, useAuth } from '@/hooks';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
    const subdomain = useSubdomain();
    const { isAuthenticated } = useAuth();

    // Safety check - if on subdomain, this page shouldn't be rendered by router,
    // but just in case, redirect to subdomain root
    if (subdomain) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen font-sans flex items-center justify-center p-4 sm:p-8 relative">
            <WelcomeBackground />

            {/* Main Content Card */}
            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 p-4 sm:p-6 md:p-8 border-4 border-gray-100">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-6">
                    {/* Logo Area */}
                    <Link to="/" className="flex items-center gap-3 decoration-transparent">
                        <div className="flex flex-col select-none">
                            <span className="font-display font-extrabold text-[#E53935] text-4xl leading-none" style={{ WebkitTextStroke: '1.5px #1F2937' }}>Quiz</span>
                            <span className="font-display font-extrabold text-[#FDD835] text-4xl leading-none -mt-1.5 inline-block z-10" style={{ WebkitTextStroke: '1.5px #1F2937' }}>Strike</span>
                        </div>
                    </Link>

                    {/* Right Header Navigation */}
                    <div className="flex items-center gap-6 font-bold text-gray-800 text-lg">
                        {/* Theme Toggle placeholder based on design */}
                        <div className="hidden md:flex bg-gray-900 rounded-full p-1 border-2 border-gray-900">
                            <button className="px-4 py-1 bg-white text-gray-900 rounded-full text-xs font-bold shadow transition-transform">Light</button>
                            <button className="px-4 py-1 text-white hover:text-gray-300 rounded-full text-xs font-bold transition-colors">Dark</button>
                            <button className="px-4 py-1 text-white hover:text-gray-300 rounded-full text-xs font-bold transition-colors">Ocean</button>
                        </div>

                        <div className="flex items-center gap-8">
                            <span className="hidden lg:block">Quiz & Game Platform</span>
                        </div>
                    </div>
                </header>

                {/* Hero Body */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Typography & Actions */}
                    <div className="space-y-4 z-10">
                        <h1 className="font-display font-extrabold text-gray-900 text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                            Welcome to <br /> Quiz Strike
                        </h1>

                        <p className="text-base sm:text-lg text-gray-800 font-medium max-w-xl leading-relaxed">
                            Level Up Your Events: Host Engaging, Interactive Quizzes and Games for Your Team.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 pt-2">
                            <Link to="/register" className="inline-block transform hover:scale-105 transition-all">
                                <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xl py-3 px-6 rounded-[2rem] shadow-[0_6px_0_0_#C94E00,0_10px_15px_rgba(249,115,22,0.3)] active:shadow-[0_0px_0_0_#C94E00,0_0px_0px_rgba(249,115,22,0.3)] active:translate-y-1.5 flex items-center gap-2 w-full justify-center">
                                    Get Started
                                    <svg className="w-6 h-6 fill-current bg-white text-orange-500 rounded-full p-1" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            </Link>

                            <Link to="/login" className="inline-block transform hover:scale-105 transition-all">
                                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xl py-3 px-8 rounded-[2rem] shadow-[0_6px_0_0_#1E40AF,0_10px_15px_rgba(59,130,246,0.3)] active:shadow-[0_0px_0_0_#1E40AF,0_0px_0px_rgba(59,130,246,0.3)] active:translate-y-1.5 flex items-center gap-2 w-full justify-center">
                                    Sign In
                                    <svg className="w-6 h-6 fill-current bg-white text-blue-500 rounded-full p-1" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Mascot */}
                    <div className="relative flex justify-center lg:justify-end">
                        <img
                            src="/mascot.png"
                            alt="Quiz Strike Mascot"
                            className="w-full max-w-[360px] object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center font-bold text-gray-800 border-t-2 border-dashed border-gray-200 pt-6">
                    © 2026 Quiz Strike - Play. Learn. Connect.
                </div>
            </div>
        </div>
    );
};

export default HomePage;
