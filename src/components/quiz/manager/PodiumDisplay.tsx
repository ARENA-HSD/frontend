/**
 * HSD Arena - Podium Display Component
 * 
 * Shows top 3 winners on podium
 */

import type { LeaderboardEntry } from '@/types';

interface PodiumDisplayProps {
    topThree: LeaderboardEntry[];
}

const PodiumDisplay = ({ topThree }: PodiumDisplayProps) => {
    // Reorder for podium: [2nd, 1st, 3rd]
    const podiumOrder = [
        topThree[1], // 2nd place
        topThree[0], // 1st place
        topThree[2]  // 3rd place
    ].filter(Boolean);

    const getPodiumHeight = (rank: number) => {
        switch (rank) {
            case 1: return 'h-64';
            case 2: return 'h-48';
            case 3: return 'h-40';
            default: return 'h-32';
        }
    };

    const getMedalEmoji = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏅';
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                🎉 Winners! 🎉
            </h2>

            <div className="flex items-end justify-center gap-8">
                {podiumOrder.map((entry, idx) => {
                    if (!entry) return null;

                    const displayOrder = [2, 1, 3][idx]; // Visual position

                    return (
                        <div key={entry.nickname} className="flex flex-col items-center">
                            {/* Avatar */}
                            <div className="mb-4">
                                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-2">
                                    {entry.nickname.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-gray-900 text-lg">
                                        {entry.nickname}
                                    </div>
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {(entry.score ?? 0).toLocaleString()} pts
                                    </div>
                                </div>
                            </div>

                            {/* Podium */}
                            <div className={`w-32 ${getPodiumHeight(entry.rank)} bg-gradient-to-t ${entry.rank === 1
                                    ? 'from-yellow-400 to-yellow-500'
                                    : entry.rank === 2
                                        ? 'from-gray-300 to-gray-400'
                                        : 'from-amber-600 to-amber-700'
                                } rounded-t-xl flex items-center justify-center`}>
                                <div className="text-6xl">
                                    {getMedalEmoji(entry.rank)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PodiumDisplay;
