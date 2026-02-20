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

    // Color based on time left
    const getColor = () => {
        if (percentage > 50) return '#10b981'; // green
        if (percentage > 25) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

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
                    stroke={getColor()}
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
                <span className="text-3xl font-bold" style={{ color: getColor() }}>
                    {timeLeft}
                </span>
            </div>
        </div>
    );
};

export default QuizTimer;
