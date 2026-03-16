/**
 * HSD Arena - Quiz Timer Component
 * 
 * Circular countdown timer for questions
 */

interface QuizTimerProps {
    timeLeft: number;
    totalTime: number;
}

const QuizTimer = ({ timeLeft, totalTime }: QuizTimerProps) => {
    const percentage = (timeLeft / totalTime) * 100;
    const strokeDasharray = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    // Color class based on time left
    const colorClass = percentage > 50 ? 'text-emerald-500' : percentage > 25 ? 'text-amber-500' : 'text-red-500';
    const strokeColor = percentage > 50 ? '#10b981' : percentage > 25 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="transform -rotate-90 w-32 h-32">
                <circle
                    cx="64"
                    cy="64"
                    r="45"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx="64"
                    cy="64"
                    r="45"
                    stroke={strokeColor}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                />
            </svg>

            {/* Time text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${colorClass}`}>
                    {timeLeft}
                </span>
            </div>
        </div>
    );
};

export default QuizTimer;
