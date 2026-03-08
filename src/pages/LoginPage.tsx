/**
 * Quiz Strike - Login Page
 * 
 * User login page with custom UI
 */

import { Link, useNavigate } from 'react-router-dom';
import WelcomeBackground from '@/components/WelcomeBackground';
import { useLogin, useSubdomain } from '@/hooks';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const subdomain = useSubdomain();

    const handleSuccess = () => {
        if (subdomain) {
            // Subdomain: go to dashboard
            navigate('/');
        } else {
            // Main domain: go to organizations page
            navigate('/organizations');
        }
    };

    const {
        email,
        password,
        errors,
        isLoading,
        setEmail,
        setPassword,
        handleSubmit,
    } = useLogin(handleSuccess);

    return (
        <div className="min-h-screen font-sans flex items-center justify-center p-2 sm:p-4 relative">
            <WelcomeBackground />

            {/* Main Content Card */}
            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 p-3 sm:p-4 md:p-6 border-4 border-gray-100">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-6">
                    {/* Logo Area */}
                    <Link to="/" className="flex items-center gap-3 decoration-transparent">
                        <div className="flex flex-col select-none">
                            <span className="font-display font-extrabold text-[#E53935] text-4xl leading-none" style={{ WebkitTextStroke: '1.5px #1F2937' }}>Quiz</span>
                            <span className="font-display font-extrabold text-[#FDD835] text-4xl leading-none -mt-1.5 inline-block z-10" style={{ WebkitTextStroke: '1.5px #1F2937' }}>Strike</span>
                        </div>
                    </Link>

                    {/* Right Header Navigation */}
                    <div className="flex items-center gap-6 font-bold text-gray-800 text-lg">
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

                {/* Body */}
                <div className="grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left Form Section */}
                    <div className="space-y-4 z-10 px-4">
                        <div>
                            <h1 className="font-display font-extrabold text-gray-900 text-6xl leading-tight tracking-tight mb-1">
                                Sign In
                            </h1>
                            <p className="text-xl text-gray-800 font-bold mb-4">
                                {subdomain ? `Access ${subdomain}` : 'Access your organizations'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                            {errors.general && (
                                <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 font-bold text-sm">
                                    {errors.general}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-lg font-bold text-gray-800 ml-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="mahmut@gmail.com"
                                    className={`w-full px-4 py-2.5 rounded-[1.2rem] bg-gray-50 border-2 text-lg font-medium transition-all ${errors.email ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'} outline-none`}
                                    required
                                    disabled={isLoading}
                                />
                                {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-lg font-bold text-gray-800 ml-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-2.5 rounded-[1.2rem] bg-gray-50 border-2 text-lg font-medium transition-all ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'} outline-none`}
                                    required
                                    disabled={isLoading}
                                />
                                {errors.password && <p className="text-red-500 text-xs font-bold ml-1">{errors.password}</p>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-2xl py-3.5 rounded-[2rem] shadow-[0_6px_0_0_#1E40AF,0_10px_15px_rgba(59,130,246,0.3)] active:shadow-[0_0px_0_0_#1E40AF,0_0px_0px_rgba(59,130,246,0.3)] active:translate-y-1.5 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? 'Processing...' : 'Sign In'}
                                    {!isLoading && (
                                        <svg className="w-6 h-6 fill-current bg-white text-blue-500 rounded-full p-1" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </form>

                        <p className="text-lg font-bold text-gray-600">
                            Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Create one</Link>
                        </p>
                    </div>

                    {/* Right Mascot */}
                    <div className="relative flex justify-center lg:justify-end">
                        <img
                            src="/mascot.png"
                            alt="Quiz Strike Mascot"
                            className="w-full max-w-[380px] object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center font-bold text-gray-800 border-t-2 border-dashed border-gray-200 pt-6">
                    © 2026 Quiz Strike - Play. Learn. Connect.
                </div>
            </div>
        </div>
    );
};

export default LoginPage;