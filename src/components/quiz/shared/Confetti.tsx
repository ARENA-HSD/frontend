/**
 * HSD Arena - Confetti Component
 * 
 * Reusable confetti decoration for result/celebration screens
 */

const CONFETTI_PIECES = [
    { topClass: 'top-[10%]', leftClass: 'left-[8%]', color: 'bg-red-500', rotate: 'rotate-[45deg]', delay: 'delay-0' },
    { topClass: 'top-[20%]', leftClass: 'left-[15%]', color: 'bg-green-500', rotate: '-rotate-[30deg]', delay: 'delay-75' },
    { topClass: 'top-[15%]', leftClass: 'left-[85%]', color: 'bg-yellow-500', rotate: 'rotate-[60deg]', delay: 'delay-150' },
    { topClass: 'top-[35%]', leftClass: 'left-[92%]', color: 'bg-blue-500', rotate: '-rotate-[15deg]', delay: 'delay-300' },
    { topClass: 'top-[70%]', leftClass: 'left-[10%]', color: 'bg-yellow-500', rotate: 'rotate-[20deg]', delay: 'delay-200' },
    { topClass: 'top-[80%]', leftClass: 'left-[18%]', color: 'bg-blue-500', rotate: '-rotate-[45deg]', delay: 'delay-500' },
    { topClass: 'top-[75%]', leftClass: 'left-[88%]', color: 'bg-red-500', rotate: 'rotate-[30deg]', delay: 'delay-700' },
    { topClass: 'top-[60%]', leftClass: 'left-[92%]', color: 'bg-green-500', rotate: '-rotate-[60deg]', delay: 'delay-1000' },
    { topClass: 'top-[45%]', leftClass: 'left-[5%]', color: 'bg-orange-500', rotate: 'rotate-[80deg]', delay: 'delay-300' },
    { topClass: 'top-[25%]', leftClass: 'left-[75%]', color: 'bg-sky-500', rotate: '-rotate-[80deg]', delay: 'delay-150' },
    { topClass: 'top-[55%]', leftClass: 'left-[12%]', color: 'bg-pink-500', rotate: 'rotate-[15deg]', delay: 'delay-200', size: 'w-3 h-3' },
    { topClass: 'top-[40%]', leftClass: 'left-[85%]', color: 'bg-purple-500', rotate: '-rotate-[25deg]', delay: 'delay-500', size: 'w-3 h-3' },
];

const Confetti = () => {
    return (
        <>
            {CONFETTI_PIECES.map((confetti, i) => (
                <div
                    key={i}
                    className={`absolute rounded-sm ${confetti.color} ${confetti.rotate} animate-pulse ${confetti.delay} ${confetti.topClass} ${confetti.leftClass} ${confetti.size || 'w-2 md:w-3 max-w-[12px] h-4 md:h-6 max-h-[24px]'}`}
                />
            ))}
        </>
    );
};

export default Confetti;
