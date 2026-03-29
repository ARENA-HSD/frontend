/**
 * HSD Arena - Participant Result Component
 *
 * Shows correct/wrong feedback, points earned, and streak after each question.
 */

import { Check, X, TrendingUp } from 'lucide-react';
import QuizStrikeLogo from './QuizStrikeLogo';

interface ResultProps {
    isCorrect: boolean;
    pointsEarned: number;
    streak: number;
}

const Result = ({ isCorrect, pointsEarned, streak }: ResultProps) => (
    <div
        className={`min-h-screen flex flex-col items-center p-4 bg-cover bg-center ${isCorrect
            ? 'bg-[url(../assets/images/correct.png)]'
            : 'bg-[url(../assets/images/wrong.png)]'
            }`}
        style={{ fontFamily: '"Fredoka", sans-serif' }}
    >
        <QuizStrikeLogo className="my-16" />

        <div className="flex flex-col items-center justify-center">
            {isCorrect ? (
                <Check className="text-white" size={100} strokeWidth={5} />
            ) : (
                <X className="text-white" size={100} strokeWidth={5} />
            )}

            <div className="text-6xl text-white">
                {isCorrect ? 'Correct!' : 'Wrong!'}
            </div>

            {isCorrect && pointsEarned > 0 && (
                <span
                    className="text-[7rem] text-white font-[800]"
                    style={{
                        textShadow: `
            0 0 4px #ccff66,
            0 0 10px #aaee33,
            0 0 23px #88dd00,
            0 0 45px #55aa00,
            0 0 80px #338800
          `,
                    }}
                >
                    +{pointsEarned}
                </span>
            )}

            {streak >= 3 && (
                <div className="bg-white/20 backdrop-blur rounded-full px-6 py-2 inline-flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">
                        {streak}x Streak!
                        {streak >= 7 ? ' 🔥🔥🔥' : streak >= 5 ? ' 🔥🔥' : ' 🔥'}
                    </span>
                </div>
            )}

            <div className="mt-4 text-white/50 text-sm animate-pulse">
                Waiting for leaderboard...
            </div>
        </div>
    </div>
);

export default Result;
