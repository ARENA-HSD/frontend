/**
 * Quiz Strike - Register Page
 * 
 * User registration page with custom UI
 */

import { Link, useNavigate } from 'react-router-dom';
import WelcomeBackground from '@/components/WelcomeBackground';
import { useRegister, useAuth } from '@/hooks';
import { Navigate } from 'react-router-dom';
import { useSubdomain } from '@/hooks';

const RegisterPage = () => {
    const navigate = useNavigate();
    const subdomain = useSubdomain();
    const { isAuthenticated } = useAuth();

    const handleSuccess = () => {
        // After successful registration, redirect to login
        navigate('/login');
    };

    const {
        username,
        email,
        password,
        errors,
        isLoading,
        setUsername,
        setEmail,
        setPassword,
        handleSubmit,
    } = useRegister(handleSuccess);

    // Safety check - if on subdomain, this page shouldn't be rendered
    if (subdomain) {
        return <Navigate to="/" replace />;
    }

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
                            <span className="font-display font-extrabold text-[#E53935] text-5xl leading-none" style={{ WebkitTextStroke: '2px #1F2937' }}>Quiz</span>
                            <span className="font-display font-extrabold text-[#FDD835] text-5xl leading-none -mt-2 inline-block z-10" style={{ WebkitTextStroke: '2px #1F2937' }}>Strike</span>
                        </div>
                    </Link>

                    {/* Right Header Navigation */}
                    <div className="flex items-center gap-6 font-bold text-gray-800 text-lg">
                        <div className="hidden md:flex bg-gray-900 rounded-full p-1 border-2 border-gray-900">
                            <button className="px-4 py-1.5 bg-white text-gray-900 rounded-full text-sm font-bold shadow transition-transform">Light</button>
                            <button className="px-4 py-1.5 text-white hover:text-gray-300 rounded-full text-sm font-bold transition-colors">Dark</button>
                            <button className="px-4 py-1.5 text-white hover:text-gray-300 rounded-full text-sm font-bold transition-colors">Ocean</button>
                        </div>

                        <div className="flex items-center gap-8">
                            <span className="hidden lg:block">Quiz & Game Platform</span>
                        </div>
                    </div>
                </header>

                {/* Body */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Form Section */}
                    <div className="space-y-4 z-10">
                        <div>
                            <h1 className="font-display font-extrabold text-gray-900 text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight mb-2">
                                Create Your Account
                            </h1>
                            <p className="text-xl text-gray-800 font-bold mb-6">
                                Join Quiz Strike Platform
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                            {errors.general && (
                                <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl p-4 font-bold animate-shake">
                                    {errors.general}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-lg font-bold text-gray-800 ml-2">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="john_doe"
                                        className={`w-full px-5 py-3 rounded-[1.5rem] bg-gray-50 border-2 text-lg font-medium transition-all ${errors.username ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'} outline-none`}
                                        required
                                        disabled={isLoading}
                                    />
                                    {errors.username && <p className="text-red-500 text-sm font-bold ml-2">{errors.username}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-lg font-bold text-gray-800 ml-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="mahmut@gmail.com"
                                        className={`w-full px-5 py-3 rounded-[1.5rem] bg-gray-50 border-2 text-lg font-medium transition-all ${errors.email ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'} outline-none`}
                                        required
                                        disabled={isLoading}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm font-bold ml-2">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-lg font-bold text-gray-800 ml-2">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full px-5 py-3 rounded-[1.5rem] bg-gray-50 border-2 text-lg font-medium transition-all ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'} outline-none`}
                                    required
                                    disabled={isLoading}
                                />
                                {errors.password && <p className="text-red-500 text-sm font-bold ml-2">{errors.password}</p>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-2xl py-4 rounded-[2.5rem] shadow-[0_6px_0_0_#1E40AF,0_10px_15px_rgba(59,130,246,0.3)] active:shadow-[0_0px_0_0_#1E40AF,0_0px_0px_rgba(59,130,246,0.3)] active:translate-y-1.5 transition-all disabled:opacity-70"
                                >
                                    {isLoading ? 'Processing...' : 'Create Account'}
                                </button>
                            </div>
                        </form>

                        <p className="text-lg font-bold text-gray-600 text-center md:text-left">
                            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Sign in</Link>
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
                <div className="text-center font-bold text-gray-800 border-t-2 border-dashed border-gray-200 pt-6">
                    © 2026 Quiz Strike - Play. Learn. Connect.
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
