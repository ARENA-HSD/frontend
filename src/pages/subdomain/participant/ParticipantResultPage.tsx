/**
 * HSD Arena - Participant Result Page
 * 
 * Final results page shown after game ends.
 * Displays podium, personal stats, and thank you message.
 */

import { useLocation } from 'react-router-dom';
import { useManagerNavigate } from '@/hooks';
import { Crown, RotateCw } from 'lucide-react';
import { HeaderLogo, SEO } from '@/components';
import Confetti from '@/components/quiz/shared/Confetti';
import type { LeaderboardEntry } from '@/types';

const ParticipantResultPage = () => {
    const navigate = useManagerNavigate();
    const location = useLocation();
    const state = location.state as any;

    const nickname = state?.nickname || 'Player';
    const myTotalScore = state?.myTotalScore || 0;
    const myRank = state?.myRank || 0;
    const podium: LeaderboardEntry[] = state?.podium || [];
    const correctAnswers = state?.correctAnswers || 0;
    const wrongAnswers = state?.wrongAnswers || 0;
    const gameMode = state?.gameMode || 'PERSONAL';

    const first = podium[0];
    const second = podium[1];
    const third = podium[2];

    // ========================================
    // PERSONAL MODE: Podium + own position
    // ========================================
    if (gameMode === 'PERSONAL') {
        const myPodiumIdx = podium.findIndex(p => p.nickname === nickname);

        return (
            <div
                className={'min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
                style={{ fontFamily: '"Fredoka", sans-serif' }}
            >
                <SEO
                    title="Your Results"
                    description="See how you did in the Quiz Strike session."
                    noIndex
                />
                <Confetti />
                <div className="card">
                    <div className='scale-50 mt-[-90px]'>
                        <HeaderLogo />
                    </div>
                    <div className="text-center mb-6">
                        <div className="text-3xl font-black text-primary">Quiz Complete!</div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {/* Total Points */}
                        <div className="flex items-center bg-blue-100 rounded-l-[2.5rem] rounded-r-xl overflow-hidden">
                            <div className="bg-blue-500 text-white font-bold text-lg px-6 py-4 rounded-full whitespace-nowrap">
                                Total Points
                            </div>
                            <div className="flex-1 text-right pr-6 text-4xl font-black text-blue-700">
                                {myTotalScore.toLocaleString()}
                            </div>
                        </div>
                        {/* Final Position */}
                        <div className="flex items-center bg-yellow-100 rounded-l-[2.5rem] rounded-r-xl overflow-hidden">
                            <div className="bg-yellow-500 text-white font-bold text-lg px-6 py-4 rounded-full whitespace-nowrap">
                                Final Position
                            </div>
                            <div className="flex-1 text-right pr-6 text-3xl font-black text-yellow-700">
                                #{myRank || '-'}
                            </div>
                        </div>
                    </div>

                    {/* Podium miniature */}
                    {podium.length > 0 && (
                        <div className="flex items-end justify-center gap-3 mb-6">
                            {podium.slice(0, 3).map((p, idx) => {
                                const heights = ['h-20', 'h-16', 'h-12'];
                                const colors = ['bg-yellow-400', 'bg-gray-400', 'bg-orange-400'];
                                const isMe = p.nickname === nickname;
                                return (
                                    <div key={idx} className="text-center flex-1">
                                        <div className={`${heights[idx]} ${colors[idx]} rounded-t-lg flex items-center justify-center ${isMe ? 'ring-2 ring-blue-500' : ''}`}>
                                            <span className="text-white font-black text-lg">{idx + 1}</span>
                                        </div>
                                        <div className={`text-xs font-bold mt-1 ${isMe ? 'text-blue-600' : 'text-secondary'}`}>
                                            {p.nickname}
                                        </div>
                                        <div className="text-xs text-tertiary">{(p.score ?? 0).toLocaleString()}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="text-center text-lg font-semibold text-gray">
                        Thank you for playing! 🎓
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // STAGE MODE: Stats summary card
    // ========================================
    return (
        <div
            className={'min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
            style={{ fontFamily: '"Fredoka", sans-serif' }}
        >
            <SEO
                title="Your Results"
                description="See how you did in the Quiz Strike session."
                noIndex
            />
            <Confetti />
            <div className="card">
                <div className='scale-50 mt-[-90px]'>
                    <HeaderLogo />
                </div>
                <div className="text-center mb-6">
                    <div className="text-3xl font-black text-primary">Quiz Complete!</div>
                </div>

                <div className="space-y-3 mb-6">
                    {/* Total Points */}
                    <div className="flex items-center bg-blue-100 rounded-l-[2.5rem] rounded-r-xl overflow-hidden">
                        <div className="bg-blue-500 text-white font-bold text-lg px-6 py-4 rounded-full whitespace-nowrap">
                            Total Points
                        </div>
                        <div className="flex-1 text-right pr-6 text-4xl font-black text-blue-700">
                            {myTotalScore.toLocaleString()}
                        </div>
                    </div>
                    {/* Correct Answers */}
                    {correctAnswers > 0 && (
                        <div className="flex items-center bg-green-100 rounded-l-[2.5rem] rounded-r-xl overflow-hidden">
                            <div className="bg-green-500 text-white font-bold text-lg px-5 py-3 rounded-full whitespace-nowrap">
                                Correct Answers
                            </div>
                            <div className="flex-1 text-right pr-6 text-3xl font-black text-green-700">
                                {correctAnswers}
                            </div>
                        </div>
                    )}
                    {/* Wrong Answers */}
                    {wrongAnswers > 0 && (
                        <div className="flex items-center bg-red-100 rounded-l-[2.5rem] rounded-r-xl overflow-hidden">
                            <div className="bg-red-400 text-white font-bold text-lg px-5 py-3 rounded-full whitespace-nowrap">
                                Wrong Answers
                            </div>
                            <div className="flex-1 text-right pr-6 text-3xl font-black text-red-600">
                                {wrongAnswers}
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center text-lg font-semibold text-gray">
                    Thank you for playing! 🎓
                </div>
            </div>
        </div>
    );
};

export default ParticipantResultPage;