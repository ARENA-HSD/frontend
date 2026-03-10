/**
 * HSD Arena - Quiz Results Page (Host)
 * 
 * Final summary after game ends, showing podium and stats.
 * Fetches data from GET /games/:id endpoint.
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, TrendingUp } from 'lucide-react';
import { useManagerNavigate } from '@/hooks';
import { SEO } from '@/components';
import { HeaderLogo } from '@/components/layout';
import backgroundBg from '@/assets/images/background.png';
import type { Quiz } from '@/types';

const QuizResultsPage = () => {
    const navigate = useManagerNavigate();
    const location = useLocation();

    const quiz = (location.state as any)?.quiz || null;
    const podium = (location.state as any)?.podium || [];

    const handleExit = () => {
        navigate('/manager/quizzes');
    };

    const first = podium[0];
    const second = podium[1];
    const third = podium[2];

    const confettiPieces = [
        { top: '10%', left: '8%', color: 'bg-red-500', rotate: 'rotate-[45deg]', delay: 'delay-0' },
        { top: '20%', left: '15%', color: 'bg-green-500', rotate: '-rotate-[30deg]', delay: 'delay-75' },
        { top: '15%', left: '85%', color: 'bg-yellow-500', rotate: 'rotate-[60deg]', delay: 'delay-150' },
        { top: '35%', left: '92%', color: 'bg-blue-500', rotate: '-rotate-[15deg]', delay: 'delay-300' },
        { top: '70%', left: '10%', color: 'bg-yellow-500', rotate: 'rotate-[20deg]', delay: 'delay-200' },
        { top: '80%', left: '18%', color: 'bg-blue-500', rotate: '-rotate-[45deg]', delay: 'delay-500' },
        { top: '75%', left: '88%', color: 'bg-red-500', rotate: 'rotate-[30deg]', delay: 'delay-700' },
        { top: '60%', left: '92%', color: 'bg-green-500', rotate: '-rotate-[60deg]', delay: 'delay-1000' },
        { top: '45%', left: '5%', color: 'bg-orange-500', rotate: 'rotate-[80deg]', delay: 'delay-300' },
        { top: '25%', left: '75%', color: 'bg-sky-500', rotate: '-rotate-[80deg]', delay: 'delay-150' },
        { top: '55%', left: '12%', color: 'bg-pink-500', rotate: 'rotate-[15deg]', delay: 'delay-200', size: 'w-3 h-3' },
        { top: '40%', left: '85%', color: 'bg-purple-500', rotate: '-rotate-[25deg]', delay: 'delay-500', size: 'w-3 h-3' },
    ];

    return (
        <div className="fixed inset-0 z-0 flex flex-col overflow-hidden font-['Outfit',sans-serif]">
            {/* Background */}
            <img
                src={backgroundBg}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/5" />

            <SEO
                title={`${quiz?.title || 'Quiz'} - Results`}
                description="View the final leaderboard and scores from your Quiz Strike session."
                noIndex
            />

            {/* Main Non-Scrollable Area with Header */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-start p-2 md:p-4 pt-4 md:pt-6 overflow-hidden">

                {/* Header Row Container */}
                <div className="w-full max-w-5xl flex flex-row items-center justify-start gap-1 md:gap-2 mb-2 md:mb-4 z-50 shrink-0 relative">
                    {/* Logo - Static and scaled */}
                    <div className="hidden lg:flex shrink-0 z-50">
                        <HeaderLogo scale={0.65} className="m-0 drop-shadow-xl" />
                    </div>

                    {/* Top Bar - Right next to Logo */}
                    <div className="flex-1 w-full bg-white rounded-[24px] shadow-[0_5px_0_rgba(0,0,0,0.12)] border-[3px] border-black/5 p-1.5 md:p-2 flex items-center justify-between pointer-events-auto z-40">
                        {/* Left: Final Standings text */}
                        <div className="flex items-center">
                            <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded-[14px] border-[2px] border-gray-100 shadow-sm">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                <span className="text-xs md:text-sm font-black text-gray-700 tracking-tight">Final Standings</span>
                            </div>
                        </div>

                        {/* Center: Title */}
                        <div className="flex-1 text-center px-3 flex flex-col items-center justify-center">
                            <h1 className="text-base lg:text-xl font-black text-black leading-tight drop-shadow-sm max-w-[320px] break-words">
                                {quiz?.title || 'Quiz Session'}
                            </h1>
                        </div>

                        {/* Right: Exit Button */}
                        <div className="flex items-center">
                            <button
                                onClick={handleExit}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm md:text-base border-[3px] border-black shadow-[0_4px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Exit Game
                            </button>
                        </div>
                    </div>
                </div>

                {/* Card */}
                <div className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col items-center border-b-[6px] md:border-b-[8px] border-black/5 shrink relative z-40 min-h-0 flex-1 max-h-[85vh]">
                    
                    {/* Title Area */}
                    <div className="w-full flex-none flex flex-col items-center justify-center relative pt-4 md:pt-6 mb-4 md:mb-6">
                        {/* Confetti Background */}
                        {confettiPieces.map((confetti, i) => (
                            <div 
                                key={i}
                                className={`absolute rounded-sm ${confetti.color} ${confetti.rotate} animate-pulse ${confetti.delay} ${confetti.size || 'w-2 md:w-3 max-w-[12px] h-4 md:h-6 max-h-[24px]'}`}
                                style={{ top: confetti.top, left: confetti.left }}
                            />
                        ))}

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-normal w-full text-center relative z-10 flex items-center justify-center gap-2 md:gap-4 select-none drop-shadow-sm"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span className="text-3xl md:text-4xl lg:text-5xl animate-bounce">🎉</span>
                            Quiz Complete!
                            <span className="text-3xl md:text-4xl lg:text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
                        </h2>
                    </div>

                    {/* Podium Container - 3D CSS Blocks */}
                    <div className="flex items-end justify-center w-full max-w-3xl relative z-10 mx-auto mt-auto px-4 md:px-8">
                        
                        {/* 2nd Place (Silver) */}
                        <div className="flex flex-col items-center z-20 w-[110px] sm:w-[130px] md:w-[180px] relative">
                            <div className="text-center w-full z-40 absolute bottom-full pb-[35px] md:pb-[45px]">
                                <div className="text-sm md:text-xl font-black text-black leading-tight truncate w-full px-1">
                                    {second?.nickname || second?.nick || '---'}
                                </div>
                                <div className="text-xs md:text-lg font-bold text-gray-700 mt-1">
                                    {second ? `${(second.score || 0).toLocaleString()}` : '0'} 🔥
                                </div>
                            </div>
                            <div className="relative w-full">
                                <div className="absolute bottom-full left-0 w-full h-[30px] md:h-[40px] border-[3px] md:border-[4px] border-black border-b-0 bg-[#cbd5e1] origin-bottom-left -skew-x-[45deg]" />
                                <div className="absolute top-0 right-0 translate-x-full w-[30px] md:w-[40px] h-full border-[3px] md:border-[4px] border-black stroke-0 bg-[#64748b] origin-top-left -skew-y-[45deg]" style={{ borderLeft: 'none', right: '1px' }} />
                                <div className="relative z-10 w-full h-[120px] md:h-[180px] border-[3px] md:border-[4px] border-black bg-[#94a3b8] flex items-center justify-center">
                                    <span className="text-4xl md:text-7xl text-[#cbd5e1] drop-shadow-sm" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '2px black' }}>2</span>
                                </div>
                            </div>
                        </div>

                        {/* 1st Place (Gold) */}
                        <div className="flex flex-col items-center z-30 w-[130px] sm:w-[160px] md:w-[220px] relative -mx-2 md:-mx-4">
                            <div className="text-center w-full z-40 absolute bottom-full pb-[35px] md:pb-[45px]">
                                <div className="text-base md:text-3xl font-black text-black leading-tight truncate w-full px-1">
                                    {first?.nickname || first?.nick || '---'}
                                </div>
                                <div className="text-sm md:text-xl font-bold text-gray-700 mt-1">
                                    {first ? `${(first.score || 0).toLocaleString()}` : '0'} 🔥
                                </div>
                            </div>
                            <div className="relative w-full">
                                <div className="absolute bottom-full left-0 w-full h-[30px] md:h-[40px] border-[3px] md:border-[4px] border-black border-b-0 bg-[#fde047] origin-bottom-left -skew-x-[45deg]" />
                                <div className="absolute top-0 right-0 translate-x-full w-[30px] md:w-[40px] h-full border-[3px] md:border-[4px] border-black stroke-0 bg-[#ca8a04] origin-top-left -skew-y-[45deg]" style={{ borderLeft: 'none', right: '1px' }} />
                                <div className="relative z-10 w-full h-[180px] md:h-[260px] border-[3px] md:border-[4px] border-black bg-[#eab308] flex items-center justify-center">
                                    <span className="text-6xl md:text-9xl text-[#fde047] drop-shadow-sm" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '3px black' }}>1</span>
                                </div>
                            </div>
                        </div>

                        {/* 3rd Place (Bronze) */}
                        <div className="flex flex-col items-center z-10 w-[110px] sm:w-[130px] md:w-[180px] relative">
                            <div className="text-center w-full z-40 absolute bottom-full pb-[35px] md:pb-[45px]">
                                <div className="text-sm md:text-xl font-black text-black leading-tight truncate w-full px-1">
                                    {third?.nickname || third?.nick || '---'}
                                </div>
                                <div className="text-xs md:text-lg font-bold text-gray-700 mt-1">
                                    {third ? `${(third.score || 0).toLocaleString()}` : '0'} 🔥
                                </div>
                            </div>
                            <div className="relative w-full">
                                <div className="absolute bottom-full left-0 w-full h-[30px] md:h-[40px] border-[3px] md:border-[4px] border-black border-b-0 bg-[#fdba74] origin-bottom-left -skew-x-[45deg]" />
                                <div className="absolute top-0 right-0 translate-x-full w-[30px] md:w-[40px] h-full border-[3px] md:border-[4px] border-black stroke-0 bg-[#c2410c] origin-top-left -skew-y-[45deg]" style={{ borderLeft: 'none', right: '1px' }} />
                                <div className="relative z-10 w-full h-[90px] md:h-[130px] border-[3px] md:border-[4px] border-black bg-[#ea580c] flex items-center justify-center">
                                    <span className="text-4xl md:text-7xl text-[#fdba74] drop-shadow-sm" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '2px black' }}>3</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizResultsPage;
