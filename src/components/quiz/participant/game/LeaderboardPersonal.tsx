/**
 * HSD Arena - Participant Leaderboard (PERSONAL Mode)
 *
 * Shows top 5 player list with personal rank and score.
 */

import QuizStrikeLogo from './QuizStrikeLogo';
import type { ParticipantStats } from '@/hooks/useParticipantGameController';

interface LeaderboardPersonalProps {
    nickname: string;
    top5: Array<{ nickname: string; score: number }>;
    stats: ParticipantStats;
}

const LeaderboardPersonal = ({ nickname, top5, stats }: LeaderboardPersonalProps) => {
    const { rank, totalScore } = stats;

    return (
        <div
            className={'min-h-screen flex flex-col items-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
            style={{ fontFamily: '"Fredoka", sans-serif' }}
        >
            <QuizStrikeLogo />

            {/* Leaderboard List */}
            <div className="w-full max-w-sm space-y-2 mb-6">
                {top5.map((player) => (
                    <div
                        key={player.nickname}
                        className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur-sm ${player.nickname === nickname
                            ? 'bg-white/30 ring-2 ring-white'
                            : 'bg-white/10'
                            }`}
                    >
                        <div className="text-white font-black text-xl w-8">
                            {top5.indexOf(player) + 1}
                        </div>
                        <div className="flex-1 text-white font-semibold">
                            {player.nickname}
                        </div>
                        <div className="text-white font-bold">
                            {player.score.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Your position - glowing rank */}
            {rank > 0 && (
                <div className="flex flex-col items-center gap-2">
                    <div
                        style={{
                            position: 'absolute',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            background: 'rgba(120, 60, 220, 0.35)',
                            filter: 'blur(50px)',
                            zIndex: 0,
                        }}
                    />
                    <span
                        className="font-black"
                        style={{
                            position: 'relative',
                            zIndex: 1,
                            fontSize: '5rem',
                            color: 'white',
                            textShadow: `
                                0 0 5px rgba(255,255,255,0.6),
                                0 0 15px rgba(200,180,255,0.5),
                                0 0 40px rgba(160,120,255,0.7)
                            `,
                        }}
                    >
                        #{rank}
                    </span>
                    <span
                        className="font-black text-white mt-[-30px] z-10"
                        style={{
                            fontSize: '2rem',
                            textShadow: `0 0 10px rgba(0,0,0,1), 0 0 50px rgba(157,0,255,1)`,
                        }}
                    >
                        {totalScore.toLocaleString()}
                    </span>
                </div>
            )}

            <div className="mt-6 text-center text-white/50 text-sm animate-pulse">
                Next question coming...
            </div>
        </div>
    );
};

export default LeaderboardPersonal;
