/**
 * HSD Arena - Quiz Results Page (Host)
 * 
 * Final summary after game ends, showing podium and stats.
 * Fetches data from GET /games/:id endpoint.
 */

import { useLocation } from 'react-router-dom';
import { Crown, LogOut } from 'lucide-react';
import { useManagerNavigate } from '@/hooks';
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

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-purple-100 to-indigo-100">
            {/* Top Bar */}
            <div className="bg-white px-6 py-3 flex items-center justify-center shadow-sm relative">
                <div className="font-semibold text-gray-900 text-xl">
                    {quiz?.title || 'Quiz'} - Quiz Complete
                </div>
                <button
                    onClick={handleExit}
                    className="absolute right-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Exit
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="text-5xl font-black text-gray-900 mb-12">🎉 Quiz Complete! 🎉</div>

                    {/* Podium */}
                    <div className="flex items-end justify-center gap-8 mb-12">
                        {/* 2nd Place */}
                        <div className="text-center">
                            <div className="w-32 h-40 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-2xl flex items-center justify-center shadow-xl mb-3">
                                <div className="text-white">
                                    <div className="text-4xl font-black mb-1">2</div>
                                    <div className="text-sm font-semibold">Silver</div>
                                </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{second?.nick || '-'}</div>
                            <div className="text-lg text-gray-600">{second ? `${second.score.toLocaleString()} pts` : ''}</div>
                        </div>

                        {/* 1st Place */}
                        <div className="text-center">
                            <div className="w-40 h-56 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-t-2xl flex items-center justify-center shadow-2xl mb-3">
                                <div className="text-white">
                                    <Crown className="w-12 h-12 mx-auto mb-2" />
                                    <div className="text-5xl font-black mb-1">1</div>
                                    <div className="text-sm font-semibold">Gold</div>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-gray-900">{first?.nick || '-'}</div>
                            <div className="text-xl text-gray-600">{first ? `${first.score.toLocaleString()} pts` : ''}</div>
                        </div>

                        {/* 3rd Place */}
                        <div className="text-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-500 rounded-t-2xl flex items-center justify-center shadow-xl mb-3">
                                <div className="text-white">
                                    <div className="text-4xl font-black mb-1">3</div>
                                    <div className="text-sm font-semibold">Bronze</div>
                                </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{third?.nick || '-'}</div>
                            <div className="text-lg text-gray-600">{third ? `${third.score.toLocaleString()} pts` : ''}</div>
                        </div>
                    </div>

                    <div className="text-2xl font-semibold text-gray-700">
                        Thank you for participating! 🎓
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizResultsPage;
