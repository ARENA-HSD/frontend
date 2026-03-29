/**
 * HSD Arena - Results Phase Component (Host)
 *
 * Shows answer statistics after each question ends.
 * This is the QUESTION RESULT, NOT the game-end finished screen.
 * Copy-pasted JSX from QuizLivePage.tsx results phase.
 */

import { Check, Layers } from 'lucide-react';
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import ConnectionToasts from '@/components/ui/ConnectionToasts';
import { HeaderLogo } from '@/components/layout';
import backgroundBg from '@/assets/optimized/background-1280.webp';
import type { Quiz, QuestionOption } from '@/types';
import type { ConnectionToast } from '@/hooks/useGameController';

interface ResultsProps {
    quiz: Quiz | null;
    questionText: string;
    options: QuestionOption[];
    correctOptionIndex: number;
    answerStats: Record<string, number>;
    totalPlayers: number;
    connectionToasts: ConnectionToast[];
    handleShowLeaderboard: () => void;
}

const Results = ({
    quiz,
    questionText,
    options,
    correctOptionIndex,
    answerStats,
    totalPlayers,
    connectionToasts,
    handleShowLeaderboard,
}: ResultsProps) => {
    const maxCount = Math.max(...Object.values(answerStats).map(Number), 1);



    return (
        <div className="fixed inset-0 z-0 flex flex-col overflow-hidden font-['Outfit',sans-serif]">
            {/* Background */}
            <img
                src={backgroundBg}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/10" />

            <ReconnectOverlay />
            <ConnectionToasts toasts={connectionToasts} />

            {/* Main Non-Scrollable Area - Centered Layout */}
            <div className="relative z-10 w-full h-full flex flex-col items-center p-2 md:p-4 pt-4 md:pt-6 overflow-hidden">

                {/* Header Row Container - Tightly coupled Logo and Bar perfectly aligned left to the Question Card */}
                <div className="w-full max-w-5xl flex flex-row items-center justify-start gap-1 md:gap-2 mb-2 md:mb-4 z-50 shrink-0 relative">
                    {/* Logo - Static and scaled */}
                    <HeaderLogo />

                    {/* Top Bar - Right next to Logo */}
                    <div className="flex-1 w-full bg-white rounded-[24px] shadow-[0_5px_0_rgba(0,0,0,0.12)] border-[3px] border-black/5 p-1.5 md:p-2 flex items-center justify-between pointer-events-auto z-40">
                        {/* Left: Manage button */}
                        <div className="flex items-center">
                            <button className="flex items-center gap-2 bg-white hover:bg-gray-50 px-3 md:px-4 py-2 rounded-[14px] transition-all border-[2px] border-gray-200 shadow-sm group">
                                <Layers className="w-4 h-4 text-yellow-500 fill-yellow-100" />
                                <span className="text-xs md:text-sm font-black text-black tracking-tight">Manage Participants</span>
                            </button>
                        </div>

                        {/* Center: Title */}
                        <div className="flex-1 text-center px-3 flex items-center justify-center">
                            <h1 className="text-base lg:text-xl font-black text-black leading-tight drop-shadow-sm max-w-[320px] break-words">
                                {quiz?.title || 'Quiz Session'}
                            </h1>
                        </div>

                        {/* Right: Leaderboard Button */}
                        <div className="flex items-center">
                            <button
                                onClick={handleShowLeaderboard}
                                className="px-5 md:px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-2xl font-black text-sm md:text-base transition-all shadow-[0_4px_0_rgba(2,132,199,1)] hover:translate-y-[1px] hover:shadow-[0_3px_0_rgba(2,132,199,1)] active:translate-y-[4px] active:shadow-none whitespace-nowrap"
                            >
                                Leaderboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content: Unified Card */}
                <div className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col items-center border-b-[6px] md:border-b-[8px] border-black/5 shrink relative z-40 min-h-0 flex-1 max-h-[85vh]">

                    {/* Bar Chart Area */}
                    <div className="w-full max-w-3xl min-h-[100px] h-[20vh] md:h-40 max-h-[180px] flex items-end justify-around gap-3 md:gap-6 lg:gap-8 mb-3 md:mb-5 mt-1 shrink-0">
                        {options.map((option: any, idx: number) => {
                            const count = Number(answerStats[String(idx)] || 0);
                            const isCorrect = idx === correctOptionIndex;
                            const referenceMax = Math.max(totalPlayers || 0, maxCount, 5);
                            const heightPercent = referenceMax > 0 ? (count / referenceMax) * 100 : 0;

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                                    {count > 0 ? (
                                        <div
                                            className={`w-full max-w-[150px] flex flex-col items-center justify-start rounded-t-xl transition-all duration-1000 ease-out ${isCorrect ? 'bg-[#22c55e]' : 'bg-[#e2e8f0]'}`}
                                            style={{ height: `${heightPercent}%`, minHeight: '3rem' }}
                                        >
                                            <div className={`mt-2 font-black text-xl lg:text-2xl ${isCorrect ? 'text-white' : 'text-gray-500'}`}>
                                                {count}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="font-black text-xl lg:text-2xl text-gray-400 mb-1">
                                            {count}
                                        </div>
                                    )}
                                    <div className="text-gray-800 font-black text-xs lg:text-sm text-center truncate w-full px-1">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Question Text */}
                    <div className="w-full text-center mb-3 md:mb-6 mt-1 px-2 md:px-4 shrink min-h-0 overflow-y-auto">
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                            {questionText}
                        </h2>
                    </div>

                    {/* Options Grid */}
                    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mt-auto shrink-0">
                        {options.map((option: any, idx: number) => {
                            const isCorrect = idx === correctOptionIndex;
                            return (
                                <div
                                    key={idx}
                                    className={`relative p-3 lg:p-4 rounded-[16px] lg:rounded-[20px] flex flex-col items-center justify-center text-center transition-all min-h-[4rem] lg:min-h-[5rem] ${isCorrect
                                        ? 'bg-[#ecfdf5] border-[3px] border-[#10b981] text-[#047857]'
                                        : 'bg-white border-[2px] border-gray-200 text-gray-400 opacity-60'
                                        }`}
                                >
                                    <span className={`text-base lg:text-xl leading-tight ${isCorrect ? 'font-black' : 'font-bold'}`}>
                                        {option.text}
                                    </span>
                                    {isCorrect && (
                                        <div className="absolute -top-2 -right-2 bg-[#10b981] rounded-full p-1 shadow-sm border-[2px] border-white">
                                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={5} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Bottom Spacing */}
                <div className="h-3 md:h-6 shrink-0 w-full" />
            </div>
        </div>
    );
};

export default Results;
