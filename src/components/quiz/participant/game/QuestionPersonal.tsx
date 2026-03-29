/**
 * HSD Arena - Participant Question (PERSONAL Mode)
 *
 * Full question display with text, media, timer, and answer options.
 */

import { OPTION_COLORS, OPTION_LABELS } from './participantConstants';
import type { GameStatus } from '@/hooks/useParticipantGameController';

interface QuestionPersonalProps {
    phase: GameStatus;
    questionIndex: number;
    questionText: string;
    questionMedia: string;
    options: Array<{ text: string; color: string }>;
    timeLeft: number;
    selectedAnswer: number;
    handleSelectAnswer: (idx: number) => void;
}

const QuestionPersonal = ({
    phase,
    questionIndex,
    questionText,
    questionMedia,
    options,
    timeLeft,
    selectedAnswer,
    handleSelectAnswer,
}: QuestionPersonalProps) => (
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

        {/* Question */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 mb-4 w-full max-w-md border border-white/10">
            {questionMedia && (
                <div className="w-full h-32 bg-white/10 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                    <img
                        src={questionMedia}
                        alt="Question"
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
            )}
            <div className="text-white text-xl font-bold text-center"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {questionText || `Question ${questionIndex + 1}`}
            </div>
        </div>

        {/* Options */}
        <div className="flex-1 grid grid-cols-1 gap-3 w-full max-w-md">
            {options.map((option, idx) => {
                const color = OPTION_COLORS[idx] || OPTION_COLORS[0];
                const isSelected = selectedAnswer === idx;

                return (
                    <button
                        key={idx}
                        onClick={() => handleSelectAnswer(idx)}
                        disabled={phase === 'answered'}
                        className={`w-full p-4 rounded-xl font-bold text-white text-lg transition-all border-b-[6px] border-black/15 shadow-lg disabled:opacity-100 ${color.bg} ${phase === 'answered'
                            ? isSelected
                                ? 'ring-4 ring-white scale-[1.03]'
                                : 'grayscale-[40%] brightness-75'
                            : `${color.hover} active:scale-95 active:border-b-[2px]`
                            }`}
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                    >
                        <span className="mr-2">{OPTION_LABELS[idx]}.</span>
                        {option.text}
                    </button>
                );
            })}
        </div>

        {/* Answered feedback */}
        {phase === 'answered' && (
            <div className="mt-4 text-center text-white/50 text-sm animate-pulse">
                Answer submitted! Waiting for results...
            </div>
        )}
    </div>
);

export default QuestionPersonal;
