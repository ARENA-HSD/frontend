/**
 * HSD Arena - Leaderboard Phase Component (Host)
 *
 * Shows top players after viewing question results.
 * Copy-pasted JSX from QuizLivePage.tsx leaderboard phase.
 */

import { TrendingUp, Layers } from 'lucide-react';
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import ConnectionToasts from '@/components/ui/ConnectionToasts';
import { HeaderLogo } from '@/components/layout';
import backgroundBg from '@/assets/optimized/background-1280.webp';
import type { Quiz, Question as QuestionType } from '@/types';
import type { ConnectionToast } from '@/hooks/useGameController';

interface LeaderboardProps {
    quiz: Quiz | null;
    leaderboard: Array<{ nickname: string; score: number }>;
    highStreaks: Array<{ nickname: string; streak: number }>;
    questionIndex: number;
    questions: QuestionType[];
    connectionToasts: ConnectionToast[];
    handleNextQuestion: () => void;
}

const Leaderboard = ({
    quiz, leaderboard, highStreaks, questionIndex, questions,
    connectionToasts, handleNextQuestion,
}: LeaderboardProps) => {
    const isLastQuestion = questionIndex >= questions.length - 1;



    return (
        <div className="fixed inset-0 z-0 flex flex-col overflow-hidden font-['Outfit',sans-serif]">
            <img src={backgroundBg} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-white/10" />
            <ReconnectOverlay />
            <ConnectionToasts toasts={connectionToasts} />

            <div className="relative z-10 w-full h-full flex flex-col items-center p-4 lg:p-6 pt-6 lg:pt-8 overflow-y-auto">
                <div className="w-full max-w-5xl flex flex-row items-center justify-start gap-1 md:gap-2 mb-4 lg:mb-6 z-50 shrink-0 relative">
                    <HeaderLogo />
                    <div className="flex-1 w-full flex-col sm:flex-row bg-white rounded-[24px] shadow-[0_5px_0_rgba(0,0,0,0.12)] border-[3px] border-black/5 p-1.5 md:p-2 flex items-center justify-between pointer-events-auto z-40 gap-2 sm:gap-0">
                        <div className="flex items-center">
                            <button className="flex items-center gap-2 bg-white hover:bg-gray-50 px-3 md:px-4 py-2 rounded-[14px] transition-all border-[2px] border-gray-200 shadow-sm group">
                                <Layers className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-100" />
                                <span className="text-xs md:text-sm font-black text-black tracking-tight hidden sm:inline">Manage Participants</span>
                                <span className="text-xs font-black text-black tracking-tight sm:hidden">Manage</span>
                            </button>
                        </div>
                        <div className="flex-1 text-center px-2 flex items-center justify-center">
                            <h1 className="text-sm md:text-base lg:text-xl font-black text-black leading-tight drop-shadow-sm max-w-[200px] md:max-w-[320px] break-words">
                                {quiz?.title || 'Quiz Session'}
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <button onClick={handleNextQuestion} className="px-4 md:px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm lg:text-base transition-all shadow-[0_4px_0_rgba(2,132,199,1)] hover:translate-y-[1px] hover:shadow-[0_3px_0_rgba(2,132,199,1)] active:translate-y-[4px] active:shadow-none whitespace-nowrap">
                                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] px-4 py-6 lg:p-10 flex flex-col items-center border-b-[6px] md:border-b-[8px] border-black/5 shrink-0 relative z-40">
                    <div className="mb-6 lg:mb-8 text-center w-full">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl text-black select-none" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '2px black' }}>
                            Leaderboard
                        </h2>
                    </div>

                    <div className="w-full flex flex-col items-center gap-2 lg:gap-4 max-w-4xl mx-auto px-1 md:px-4 pb-4">
                        {/* Tier 1: Gold Rank */}
                        <div className="w-full flex justify-center z-30">
                            {leaderboard[0] ? (
                                <div className="w-full sm:w-auto min-w-[300px] max-w-[420px] bg-[#f5a623] rounded-full flex items-center gap-3 p-1.5 md:p-2 shadow-[0_4px_0_rgba(200,130,0,1)] border-[3px] border-amber-500/30 transition-transform hover:scale-105">
                                    <div className="bg-[#f0c14b] text-yellow-900 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-xl md:text-2xl shadow-inner border border-yellow-200 shrink-0">1</div>
                                    <div className="font-black text-gray-900 text-lg md:text-xl truncate pt-0.5">{leaderboard[0].nickname}</div>
                                    <div className="ml-auto font-black text-gray-900 text-xl md:text-2xl pr-2 tracking-tighter tabular-nums flex items-center gap-1.5 pt-0.5">
                                        {leaderboard[0].score}
                                        {highStreaks.find((s: any) => s.nickname === leaderboard[0].nickname && s.streak > 2) && (<span className="text-lg md:text-xl shrink-0 -mt-0.5">🔥</span>)}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full sm:w-auto min-w-[300px] h-[60px] md:h-[68px] bg-gray-100 rounded-full border-[3px] border-gray-200 border-dashed animate-pulse text-gray-400 flex items-center justify-center font-bold">Waiting for P1...</div>
                            )}
                        </div>

                        {/* Tier 2 */}
                        <div className="w-full flex gap-3 md:gap-5 min-h-[60px] md:min-h-[68px] justify-center mt-[-10px] md:mt-[-16px] z-20 flex-wrap">
                            <div className="flex-1 min-w-[200px] max-w-[300px]">
                                {leaderboard[1] && (
                                    <div className="w-full h-full bg-[#10b981] rounded-full flex items-center gap-2 p-1.5 md:p-2 shadow-[0_4px_0_rgba(4,120,87,1)] border-[3px] border-emerald-600/30 transition-transform hover:scale-105">
                                        <div className="bg-[#34d399] text-emerald-900 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-inner border border-emerald-300 shrink-0">2</div>
                                        <div className="font-black text-gray-900 text-base md:text-lg truncate pt-0.5">{leaderboard[1].nickname}</div>
                                        <div className="ml-auto font-black text-gray-900 text-lg md:text-xl pr-2 tracking-tighter tabular-nums flex items-center pt-0.5">{leaderboard[1].score}</div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-[200px] max-w-[300px]">
                                {leaderboard[2] && (
                                    <div className="w-full h-full bg-[#d4d4d8] rounded-full flex items-center gap-2 p-1.5 md:p-2 shadow-[0_4px_0_rgba(161,161,170,1)] border-[3px] border-gray-400/30 transition-transform hover:scale-105">
                                        <div className="bg-[#f4f4f5] text-gray-600 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-inner border border-white shrink-0">3</div>
                                        <div className="font-black text-gray-900 text-base md:text-lg truncate pt-0.5">{leaderboard[2].nickname}</div>
                                        <div className="ml-auto font-black text-gray-900 text-lg md:text-xl pr-2 tracking-tighter tabular-nums flex items-center gap-1 pt-0.5">{leaderboard[2].score}{highStreaks.find((s: any) => s.nickname === leaderboard[2].nickname && s.streak > 2) && (<span className="text-base shrink-0 -mt-0.5 opacity-60">🔥</span>)}</div>
                                    </div>
                                )}
                            </div>
                            <div className="w-full sm:w-auto flex-1 min-w-[200px] max-w-[300px]">
                                {leaderboard[3] && (
                                    <div className="w-full h-full bg-[#d97736] rounded-full flex items-center gap-2 p-1.5 md:p-2 shadow-[0_4px_0_rgba(184,81,1,1)] border-[3px] border-orange-700/30 transition-transform hover:scale-105">
                                        <div className="bg-[#f09c62] text-orange-950 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-inner border border-orange-300 shrink-0">4</div>
                                        <div className="font-black text-gray-900 text-base md:text-lg truncate pt-0.5">{leaderboard[3].nickname}</div>
                                        <div className="ml-auto font-black text-gray-900 text-lg md:text-xl pr-2 tracking-tighter tabular-nums flex items-center gap-1 pt-0.5">{leaderboard[3].score}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tier 3 */}
                        <div className="w-full flex gap-3 md:gap-5 justify-center mt-[-8px] md:mt-[-12px] z-10 flex-wrap">
                            {leaderboard.slice(4, 6).map((player: any, i: number) => {
                                const rank = i + 5;
                                return (
                                    <div key={rank} className="flex-1 min-w-[200px] max-w-[300px] h-[52px] md:h-[60px] bg-white rounded-full flex items-center pr-3 md:pr-4 pl-1.5 md:pl-2 shadow-[0_3px_0_rgba(0,0,0,0.08)] border-[3px] border-gray-100 transition-transform hover:scale-105">
                                        <div className="text-black w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-lg md:text-xl shrink-0">{rank}</div>
                                        <div className="ml-1 font-black text-gray-900 text-sm md:text-base truncate pt-0.5">{player.nickname}</div>
                                        <div className="ml-auto font-black text-gray-900 text-base md:text-lg tracking-tighter tabular-nums flex items-center gap-1 pt-0.5">
                                            {player.score}
                                            {highStreaks.find((s: any) => s.nickname === player.nickname && s.streak > 2) && (<span className="text-sm shrink-0">🔥</span>)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Biggest climber info bar */}
                        {highStreaks.length > 0 && (
                            <div className="w-full max-w-[95%] sm:max-w-3xl bg-[#e0f2fe] border-[3px] border-[#7dd3fc] rounded-2xl flex items-center justify-between mt-4 md:mt-6 px-4 py-2.5 md:py-3.5 shadow-sm">
                                <div className="font-black text-[#0ea5e9] text-xs md:text-sm lg:text-base px-2">
                                    Top Streaks: <span className="text-gray-900 ml-1">{highStreaks.slice(0, 3).map((s: any) => `${s.nickname} (🔥${s.streak})`).join(', ')}</span>
                                </div>
                                <div className="bg-[#38bdf8] p-1.5 rounded-full text-white shrink-0 shadow-[0_2px_0_rgba(2,132,199,1)]">
                                    <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-sm md:text-base font-bold text-gray-500 mt-1">
                        <span className="text-[#ea004b] font-black">Yemeksepeti</span> ile eğlence devam ediyor
                    </div>
                </div>

                <div className="h-6 lg:h-10 shrink-0 w-full" />
            </div>
        </div>
    );
};

export default Leaderboard;
