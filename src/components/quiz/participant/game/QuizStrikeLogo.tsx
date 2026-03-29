/**
 * HSD Arena - Quiz Strike Logo
 *
 * Shared "Quiz 🐻 Strike" logo used in Result, LeaderboardPersonal, and LeaderboardStage.
 */

import maskotFace from '@/assets/maskot-yüz.png';

interface QuizStrikeLogoProps {
    className?: string;
}

const QuizStrikeLogo = ({ className = 'mt-8 mb-6' }: QuizStrikeLogoProps) => (
    <div className={`flex items-center gap-1 ${className}`}>
        <h1 className="text-white text-4xl font-bold">Quiz</h1>
        <img src={maskotFace} alt="maskot yüzü" className="w-12 h-14 rotate-12" />
        <h1 className="text-white text-4xl font-bold">Strike</h1>
    </div>
);

export default QuizStrikeLogo;
