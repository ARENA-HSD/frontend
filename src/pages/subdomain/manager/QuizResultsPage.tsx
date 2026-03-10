/**
 * HSD Arena - Quiz Results Page (Host)
 * 
 * Final summary after game ends, showing podium and stats.
 * Fetches data from GET /games/:id endpoint.
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useManagerNavigate } from '@/hooks';
import { SEO } from '@/components';
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

            {/* Floating Header & Exit Button */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50 pointer-events-none">
                <HeaderLogo scale={0.7} className="drop-shadow-xl" />
            </div>
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
                <button
                    onClick={handleExit}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm md:text-base border-[3px] border-black shadow-[0_4px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Exit Game
                </button>
            </div>

            {/* Main Content Area: centered perfectly */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8 lg:p-12 pb-8 overflow-hidden">
                {/* Card */}
                <div className="w-full max-w-5xl h-full max-h-[750px] bg-white rounded-[32px] md:rounded-[40px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col items-center relative border-[4px] border-transparent shrink-0 z-40 overflow-hidden">
                    
                    {/* Title Area */}
                    <div className="w-full flex-1 flex flex-col items-center justify-center relative pt-8 md:pt-16">
                        {/* Confetti Background */}
                        {confettiPieces.map((confetti, i) => (
                            <div 
                                key={i}
                                className={`absolute rounded-sm ${confetti.color} ${confetti.rotate} animate-pulse ${confetti.delay} ${confetti.size || 'w-2 md:w-3 max-w-[12px] h-4 md:h-6 max-h-[24px]'}`}
                                style={{ top: confetti.top, left: confetti.left }}
                            />
                        ))}

                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-black tracking-tighter w-full text-center relative z-10 flex items-center justify-center gap-2 md:gap-4 select-none drop-shadow-sm"
                            style={{ fontFamily: "'Titan One', sans-serif" }}
                        >
                            <span className="text-3xl md:text-5xl lg:text-6xl animate-bounce">🎉</span>
                            Quiz Complete!
                            <span className="text-3xl md:text-5xl lg:text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
                        </h2>
                    </div>

                    {/* Podium Container */}
                    <div className="flex items-end justify-center w-full max-w-4xl relative z-10 mx-auto mt-auto pb-0 px-2 lg:px-4">
                        
                        {/* 2nd Place (Silver) */}
                        <div className="flex flex-col items-center z-20 w-[30%] sm:w-[150px] md:w-[220px] relative">
                            <div className="mb-4 md:mb-6 text-center w-full z-40 absolute bottom-full">
                                <div className="text-sm md:text-2xl font-black text-black leading-tight tracking-tight truncate w-full px-1">
                                    {second?.nickname || second?.nick || '---'}
                                </div>
                                <div className="text-xs md:text-xl font-bold text-black mt-1">
                                    {second ? `${(second.score || 0).toLocaleString()}` : '0'} 🔥
                                </div>
                            </div>
                            <div className="w-full h-[30px] md:h-[50px] border-[3px] md:border-[4px] border-black border-b-0 bg-[#cbd5e1] origin-bottom-left -skew-x-[30deg]" />
                            <div className="w-full h-[140px] md:h-[220px] border-[3px] md:border-[4px] border-black bg-[#94a3b8] flex items-center justify-center">
                                <span className="text-5xl md:text-8xl text-[#cbd5e1] drop-shadow-sm" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '2px black' }}>2</span>
                            </div>
                        </div>

                        {/* 1st Place (Gold) */}
                        <div className="flex flex-col items-center z-30 w-[34%] sm:w-[170px] md:w-[260px] relative -mx-[6px] md:-mx-[8px]">
                            <div className="mb-4 md:mb-6 text-center w-full z-40 absolute bottom-full">
                                <div className="text-base md:text-3xl font-black text-black leading-tight tracking-tight truncate w-full px-1">
                                    {first?.nickname || first?.nick || '---'}
                                </div>
                                <div className="text-sm md:text-2xl font-bold text-black mt-1">
                                    {first ? `${(first.score || 0).toLocaleString()}` : '0'} 🔥
                                </div>
                            </div>
                            <div className="w-full h-[30px] md:h-[50px] border-[3px] md:border-[4px] border-black border-b-0 bg-[#fde047] origin-bottom-left -skew-x-[30deg]" />
                            <div className="w-full h-[200px] md:h-[300px] border-[3px] md:border-[4px] border-black bg-[#eab308] flex items-center justify-center">
                                <span className="text-6xl md:text-9xl text-[#fde047] drop-shadow-sm" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '3px black' }}>1</span>
                            </div>
                        </div>

                        {/* 3rd Place (Bronze) */}
                        <div className="flex flex-col items-center z-10 w-[30%] sm:w-[150px] md:w-[220px] relative">
                            <div className="mb-4 md:mb-6 text-center w-full z-40 absolute bottom-full">
                                <div className="text-sm md:text-2xl font-black text-black leading-tight tracking-tight truncate w-full px-1">
                                    {third?.nickname || third?.nick || '---'}
                                </div>
                                <div className="text-xs md:text-xl font-bold text-black mt-1">
                                    {third ? `${(third.score || 0).toLocaleString()}` : '0'} 🔥
                                </div>
                            </div>
                            <div className="w-full h-[30px] md:h-[50px] border-[3px] md:border-[4px] border-black border-b-0 bg-[#ea580c] origin-bottom-left -skew-x-[30deg]" />
                            <div className="w-full h-[110px] md:h-[180px] border-[3px] md:border-[4px] border-black bg-[#c2410c] flex items-center justify-center">
                                <span className="text-5xl md:text-8xl text-[#ea580c] drop-shadow-sm" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '2px black' }}>3</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizResultsPage;
