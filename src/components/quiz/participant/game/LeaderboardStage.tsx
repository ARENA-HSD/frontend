/**
 * HSD Arena - Participant Leaderboard (STAGE Mode)
 *
 * Stage mode: shows only rank and score with dramatic glow effect.
 */

import QuizStrikeLogo from './QuizStrikeLogo';
import type { ParticipantStats } from '@/hooks/useParticipantGameController';

interface LeaderboardStageProps {
    stats: ParticipantStats;
}

const LeaderboardStage = ({ stats }: LeaderboardStageProps) => {
    const { rank, totalScore } = stats;

    return (
        <div
            className={'min-h-screen flex flex-col items-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
            style={{ fontFamily: '"Fredoka", sans-serif' }}
        >
            <QuizStrikeLogo className="mt-16" />

            {/* Score Area */}
            <div className="flex flex-col items-center gap-2">
                {rank > 0 ? (
                    <>
                        {/* Purple blur background */}
                        <div
                            style={{
                                position: 'absolute',
                                width: '320px',
                                height: '320px',
                                borderRadius: '50%',
                                background: 'rgba(120, 60, 220, 0.45)',
                                filter: 'blur(60px)',
                                zIndex: 0,
                            }}
                        />

                        {/* Rank */}
                        <span
                            className="font-black"
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                fontSize: '10rem',
                                color: 'white',
                                textShadow: `
            0 0 5px rgba(255,255,255,0.6),
            0 0 15px rgba(200,180,255,0.5),
            0 0 40px rgba(160,120,255,0.7),
            0 0 80px rgba(140,90,255,0.6),
            0 0 130px rgba(120,60,255,0.4)
        `,
                                WebkitTextStroke: '1px rgba(255,255,255,0.3)',
                            }}
                        >
                            #{rank}
                        </span>
                        {/* Score */}
                        <span
                            className="font-black text-white mt-[-75px] z-10"
                            style={{
                                fontSize: '4rem',
                                textShadow: `
            0 0 10px rgba(0, 0, 0, 1),
            0 0 50px rgba(157, 0, 255, 1)
        `,
                            }}
                        >
                            {totalScore.toLocaleString()}
                        </span>
                    </>
                ) : (
                    <div className="text-2xl font-bold text-white mt-8">
                        Waiting for results...
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardStage;
