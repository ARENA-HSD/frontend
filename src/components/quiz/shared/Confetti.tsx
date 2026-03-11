/**
 * HSD Arena - Confetti Component
 * 
 * Reusable confetti decoration for result/celebration screens
 */

const CONFETTI_PIECES = [
    { top: '10%', left: '8%', color: 'bg-red-500', rotate: 'rotate-[45deg]', delay: 'delay-0' },
    { top: '20%', left: '15%', color: 'bg-green-500', rotate: '-rotate-[30deg]', delay: 'delay-75' },
    { top: '15%', left: '85%', color: 'bg-yellow-500', rotate: 'rotate-[60deg]', delay: 'delay-150' },
    { top: '35%', left: '92%', color: 'bg-blue-500', rotate: '-rotate-[15deg]', delay: 'delay-300' },
    { top: '70%', left: '10%', color: 'bg-yellow-500', rotate: 'rotate-[20deg]', delay: 'delay-200' },
    { top: '80%', left: '18%', color: 'bg-blue-500', rotate: '-rotate-[45deg]', delay: 'delay-500' },
    { top: '75%', left: '88%', color: 'bg-red-500', rotate: 'rotate-[30deg]', delay: 'delay-700' },
    { top: '60%', left: '92%', color: 'bg-green-500', rotate: '-rotate-[60deg]', delay: 'delay-1000' },
    { top: '45%', left: '5%', color: 'bg-orange-500', rotate: 'rotate-[80deg]', delay: 'delay-300' },
    { top: '25%', left: '75%', color: 'bg-sky-500', rotate: '-rotate-[80deg]', delay: 'delay-150' },
    { top: '55%', left: '12%', color: 'bg-pink-500', rotate: 'rotate-[15deg]', delay: 'delay-200', size: 'w-3 h-3' },
    { top: '40%', left: '85%', color: 'bg-purple-500', rotate: '-rotate-[25deg]', delay: 'delay-500', size: 'w-3 h-3' },
];

const Confetti = () => {
    return (
        <>
            {CONFETTI_PIECES.map((confetti, i) => (
                <div
                    key={i}
                    className={`absolute rounded-sm ${confetti.color} ${confetti.rotate} animate-pulse ${confetti.delay} ${confetti.size || 'w-2 md:w-3 max-w-[12px] h-4 md:h-6 max-h-[24px]'}`}
                    style={{ top: confetti.top, left: confetti.left }}
                />
            ))}
        </>
    );
};

export default Confetti;
