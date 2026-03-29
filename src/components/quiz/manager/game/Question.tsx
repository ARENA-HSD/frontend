/**
 * HSD Arena - Question Phase Component (Host)
 *
 * Live question display with timer, options, and answer count.
 * Copy-pasted JSX from QuizLivePage.tsx question phase.
 */

import { Layers } from 'lucide-react';
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import ConnectionToasts from '@/components/ui/ConnectionToasts';
import { HeaderLogo } from '@/components/layout';
import backgroundBg from '@/assets/optimized/background-1280.webp';
import type { Quiz, Question as QuestionType, QuestionOption } from '@/types';
import type { ConnectionToast } from '@/hooks/useGameController';

interface QuestionProps {
    quiz: Quiz | null;
    questionIndex: number;
    questionText: string;
    questionMedia: string;
    options: QuestionOption[];
    answeredCount: number;
    totalPlayers: number;
    time: number;
    timeLeft: number;
    questions: QuestionType[];
    connectionToasts: ConnectionToast[];
}

const Question = ({
    quiz,
    questionIndex,
    questionText,
    questionMedia,
    options,
    answeredCount,
    totalPlayers,
    time,
    timeLeft,
    questions,
    connectionToasts,
}: QuestionProps) => {
    const progress = (timeLeft / (time || 1)) * 100;



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

                        {/* Center: Title and stats */}
                        <div className="flex-1 text-center px-2 flex flex-col items-center justify-center">
                            <h1 className="text-base lg:text-xl font-black text-black leading-tight drop-shadow-sm max-w-[280px] break-words mb-0.5">
                                {quiz?.title || 'Quiz Session'}
                            </h1>
                            <div className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8.5px] font-black uppercase tracking-wider border border-blue-100">
                                Question {questionIndex + 1} of {questions.length}
                            </div>
                        </div>

                        {/* Right: Timer and stats */}
                        <div className="flex items-center gap-3 lg:gap-5 pr-1 lg:pr-2">
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-[9px] font-black uppercase text-gray-400 leading-none mb-0.5">Answered</span>
                                <div className="text-lg font-black text-gray-900 tabular-nums">
                                    {answeredCount} <span className="text-gray-300 mx-0.5">/</span> {totalPlayers}
                                </div>
                            </div>

                            <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-gray-100" />
                                    <circle
                                        cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent"
                                        strokeDasharray={2 * Math.PI * 16}
                                        strokeDashoffset={2 * Math.PI * 16 * (1 - progress / 100)}
                                        strokeLinecap="round"
                                        className="text-blue-500 transition-all duration-1000"
                                    />
                                </svg>
                                <span className="absolute text-sm font-black text-white bg-blue-500 w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                                    {timeLeft}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Card Container */}
                <div className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col items-center border-b-[6px] md:border-b-[8px] border-black/5 shrink relative z-40 min-h-0 flex-1 max-h-[85vh]">
                    {/* Question Media Area */}
                    {questionMedia ? (
                        <div className="w-full max-w-lg lg:max-w-xl h-28 md:h-40 max-h-[25vh] bg-gray-100 rounded-[24px] overflow-hidden shadow-inner mb-3 md:mb-5 border border-gray-200 flex items-center justify-center shrink-0">
                            <img src={questionMedia} alt="Question" className="w-full h-full object-contain" />
                        </div>
                    ) : null}


                    {/* Question Text */}
                    <div className="w-full text-center mb-3 md:mb-6 px-2 md:px-4 shrink min-h-0 overflow-hidden">
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                            {questionText}
                        </h2>
                    </div>

                    {/* Answers Grid */}
                    <div className={`w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 lg:gap-4 shrink-0 ${!questionMedia ? 'flex-1' : 'mt-auto'}`}>
                        {(options || []).map((option, idx) => (
                            <div
                                key={idx}
                                className={`bg-white p-2.5 md:p-4 rounded-[16px] md:rounded-[20px] shadow-[0_3px_12px_rgba(0,0,0,0.04)] border-[2px] border-gray-100 flex items-center justify-center group transition-all shrink-0 ${!questionMedia ? 'min-h-[5rem] md:min-h-[6rem]' : 'min-h-[3.5rem] md:min-h-[4rem]'} hover:border-gray-200 cursor-default`}
                            >
                                <span className="text-base md:text-lg lg:text-2xl font-black text-gray-800 group-hover:scale-[1.02] transition-transform text-center select-none">
                                    {option.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Spacing */}
                <div className="h-3 md:h-6 shrink-0 w-full" />
            </div>
        </div>
    );
};

export default Question;
