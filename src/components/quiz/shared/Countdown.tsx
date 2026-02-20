/**
 * HSD Arena - Countdown Component
 * 
 * 3-2-1 countdown transition between questions
 */

import { useEffect, useState } from 'react';

interface CountdownProps {
    onComplete: () => void;
}

const Countdown = ({ onComplete }: CountdownProps) => {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (count === 0) {
            onComplete();
            return;
        }

        const timer = setTimeout(() => {
            setCount(count - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [count, onComplete]);

    if (count === 0) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-white text-9xl font-bold animate-pulse">
                {count}
            </div>
        </div>
    );
};

export default Countdown;
