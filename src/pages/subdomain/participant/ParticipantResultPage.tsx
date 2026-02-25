/**
 * HSD Arena - Participant Result Page
 * 
 * Final results page shown after game ends.
 * Displays podium, personal stats, and thank you message.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { Crown, RotateCw } from 'lucide-react';
import { useManagerNavigate } from '@/hooks';

const ParticipantResultPage = () => {
    const navigate = useManagerNavigate();
    const location = useLocation();
    const state = location.state as any;

    const nickname = state?.nickname || 'Player';
    const myTotalScore = state?.myTotalScore || 0;
    const myRank = state?.myRank || 0;
    const podium = state?.podium || [];
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
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
                <div className="max-w-sm mx-auto">
                    {/* Title */}
                    <div className="text-center mb-6 pt-6">
                        <div className="text-3xl font-black text-white mb-2">Quiz Complete!</div>
                        <div className="text-white/60">Final Results</div>
                    </div>

                    {/* Podium */}
                    {podium.length > 0 && (
                        <div className="flex items-end justify-center gap-4 mb-6">
                            {/* 2nd */}
                            <div className="text-center">
                                <div className="w-20 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-xl flex items-center justify-center shadow-lg mb-2">
                                    <div className="text-white text-2xl font-black">2</div>
                                </div>
                                <div className="font-bold text-sm text-white">{second?.nick || '-'}</div>
                                <div className="text-xs text-white/60">{second?.score?.toLocaleString() || ''}</div>
                            </div>

                            {/* 1st */}
                            <div className="text-center">
                                <div className="w-24 h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-t-xl flex items-center justify-center shadow-xl mb-2">
                                    <div className="text-white">
                                        <Crown className="w-6 h-6 mx-auto mb-1" />
                                        <div className="text-3xl font-black">1</div>
                                    </div>
                                </div>
                                <div className="font-bold text-white">{first?.nick || '-'}</div>
                                <div className="text-sm text-white/60">{first?.score?.toLocaleString() || ''}</div>
                            </div>

                            {/* 3rd */}
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-t-xl flex items-center justify-center shadow-lg mb-2">
                                    <div className="text-white text-2xl font-black">3</div>
                                </div>
                                <div className="font-bold text-sm text-white">{third?.nick || '-'}</div>
                                <div className="text-xs text-white/60">{third?.score?.toLocaleString() || ''}</div>
                            </div>
                        </div>
                    )}

                    {/* Your stats */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                        <div className="text-center">
                            <div className="text-gray-600 mb-2">Your Final Position</div>
                            <div className="text-4xl font-black text-indigo-600 mb-1">#{myRank || '-'}</div>
                            <div className="text-2xl font-bold text-gray-800">{myTotalScore.toLocaleString()} points</div>
                        </div>
                    </div>

                    {/* Thank you */}
                    <div className="text-xl font-semibold text-white/80 text-center mb-6">
                        Thank you for playing! 🎓
                    </div>

                    {/* Play Again */}
                    <button
                        onClick={handlePlayAgain}
                        className="w-full py-4 bg-white text-indigo-600 rounded-xl text-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                        <RotateCw className="w-5 h-5" />
                        Play Again
                    </button>
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
