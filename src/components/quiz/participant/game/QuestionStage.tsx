/**
 * HSD Arena - Participant Question (STAGE Mode)
 *
 * Stage mode: only colored button grid, no question text visible.
 */

import { OPTION_COLORS, OPTION_LABELS } from './participantConstants';
import type { GameStatus } from '@/hooks/useParticipantGameController';

interface QuestionStageProps {
    phase: GameStatus;
    timeLeft: number;
    selectedAnswer: number;
    handleSelectAnswer: (idx: number) => void;
}

const QuestionStage = ({
    phase,
    timeLeft,
    selectedAnswer,
    handleSelectAnswer,
}: QuestionStageProps) => (
    <div className={'min-h-screen flex flex-col items-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
        style={{ fontFamily: '"Fredoka", sans-serif' }}>
        {/* Timer */}
        <div className="flex justify-center mb-4">
            <div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-black transition-colors ${timeLeft <= 3
                    ? 'border-red-400 text-red-400 animate-pulse'
                    : 'border-white/60 text-white'
                    }`}
            >
                {timeLeft}
            </div>
        </div>

        {/* Large color buttons */}
        <div className="w-full max-w-md grid grid-cols-2 gap-4 flex-1">
            {[0, 1, 2, 3].map((idx) => {
                const color = OPTION_COLORS[idx];
                const isSelected = selectedAnswer === idx;

                return (
                    <button
                        key={idx}
                        onClick={() => handleSelectAnswer(idx)}
                        disabled={phase === 'answered'}
                        className={`rounded-xl font-black text-white text-5xl sm:text-6xl transition-all flex items-center justify-center border-b-[6px] border-black/15 shadow-lg disabled:opacity-100 ${color.bg} ${phase === 'answered'
                            ? isSelected
                                ? 'ring-4 ring-white scale-[1.03]'
                                : 'grayscale-[40%] brightness-75'
                            : `${color.hover} active:scale-95 active:border-b-[2px]`
                            }`}
                        style={{ textShadow: '0 3px 6px rgba(0,0,0,0.25)' }}
                    >
                        {OPTION_LABELS[idx]}
                    </button>
                );
            })}
        </div>

        {phase === 'answered' && (
            <div className="mt-4 text-center text-white/50 text-sm animate-pulse">
                Waiting for results...
            </div>
        )}
    </div>
);

export default QuestionStage;
