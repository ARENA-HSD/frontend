/**
 * HSD Arena - Leaderboard Display Component
 * 
 * Shows top participants with ranking
 */

import { Trophy, TrendingUp } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardDisplayProps {
    entries: LeaderboardEntry[];
    maxEntries?: number;
}

const LeaderboardDisplay = ({ entries, maxEntries = 5 }: LeaderboardDisplayProps) => {
    const displayEntries = entries.slice(0, maxEntries);

    const getMedalColor = (rank: number) => {
        switch (rank) {
            case 1: return 'text-yellow-500';
            case 2: return 'text-gray-400';
            case 3: return 'text-amber-600';
            default: return 'text-secondary';
        }
    };

    return (
        <div className="bg-card rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-2xl font-bold text-primary">Leaderboard</h3>
            </div>

            <div className="space-y-3">
                {displayEntries.map((entry) => (
                    <div
                        key={entry.nickname}
                        className={`flex items-center gap-4 p-4 rounded-xl ${entry.rank <= 3
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50'
                            : 'bg-page'
                            }`}
                    >
                        {/* Rank */}
                        <div className={`w-8 text-center font-bold text-2xl ${getMedalColor(entry.rank)}`}>
                            {entry.rank <= 3 ? '🏆' : entry.rank}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 bg-role-primary rounded-full flex items-center justify-center text-inverse font-bold">
                            {entry.nickname.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Name and Stats */}
                        <div className="flex-1">
                            <div className="font-bold text-primary">{entry.nickname}</div>
                            <div className="text-sm text-tertiary">
                                {entry.correctAnswers ?? 0} correct
                                {(entry.streak ?? 0) > 0 && (
                                    <span className="ml-2 text-orange-600 flex items-center gap-1 inline-flex">
                                        <TrendingUp className="w-3 h-3" />
                                        {entry.streak} streak
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Points */}
                        <div className="text-2xl font-bold text-role-primary">
                            {(entry.score ?? 0).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardDisplay;
