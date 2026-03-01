/**
 * HSD Arena - Participant Result Page
 * 
 * Final results page shown after game ends.
 * Displays podium, personal stats, and thank you message.
 */

import { useLocation } from 'react-router-dom';
import { useManagerNavigate } from '@/hooks';
import { Crown, RotateCw } from 'lucide-react';
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

    const handlePlayAgain = () => {
        navigate('/join');
    };

    const first = podium[0];
    const second = podium[1];
    const third = podium[2];

    // ========================================
    // PERSONAL MODE: Podium + own position
    // ========================================
    if (gameMode === 'PERSONAL') {
        const myPodiumIdx = podium.findIndex(p => p.nickname === nickname);

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
                <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="text-4xl font-black text-gray-900 mb-2">Quiz Complete!</div>
                        <div className="text-gray-600">Great job!</div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                            <div className="text-gray-700 font-semibold">Total Points</div>
                            <div className="text-3xl font-black text-indigo-600">{myTotalScore.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                            <div className="text-gray-700 font-semibold">Final Position</div>
                            <div className="text-3xl font-black text-yellow-600">#{myRank || '-'}</div>
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
                                        <div className={`${heights[idx]} ${colors[idx]} rounded-t-lg flex items-center justify-center ${isMe ? 'ring-2 ring-indigo-500' : ''}`}>
                                            <span className="text-white font-black text-lg">{idx + 1}</span>
                                        </div>
                                        <div className={`text-xs font-bold mt-1 ${isMe ? 'text-indigo-600' : 'text-gray-700'}`}>
                                            {p.nickname}
                                        </div>
                                        <div className="text-xs text-gray-500">{(p.score ?? 0).toLocaleString()}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="text-center text-lg font-semibold text-gray-700">
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="text-4xl font-black text-gray-900 mb-2">Quiz Complete!</div>
                    <div className="text-gray-600">Great job!</div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                        <div className="text-gray-700 font-semibold">Total Points</div>
                        <div className="text-3xl font-black text-indigo-600">{myTotalScore.toLocaleString()}</div>
                    </div>
                    {correctAnswers > 0 && (
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                            <div className="text-gray-700 font-semibold">Correct Answers</div>
                            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                        </div>
                    )}
                    {wrongAnswers > 0 && (
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                            <div className="text-gray-700 font-semibold">Wrong Answers</div>
                            <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
                        </div>
                    )}
                </div>

                <div className="text-center text-lg font-semibold text-gray-700 mb-6">
                    Thank you for playing! 🎓
                </div>

                <button
                    onClick={handlePlayAgain}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-lg font-bold hover:shadow-lg flex items-center justify-center gap-2"
                >
                    <RotateCw className="w-5 h-5" />
                    Play Again
                </button>
            </div>
        </div>
    );
};

export default ParticipantResultPage;