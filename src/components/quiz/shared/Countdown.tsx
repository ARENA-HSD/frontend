/**
 * HSD Arena - Countdown Component
 * 
 * 3-2-1 countdown transition between questions
 */

import countdownBg from '@/assets/images/background.png';
import maskotBase from '@/assets/maskot.png'
import { ReconnectOverlay } from '@/components/ui';

interface CountdownProps {
    countdown: number;
}

const Countdown = ({ countdown }: CountdownProps) => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden">
            {/* Full Screen Background Image */}
            <img
                src={countdownBg}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay to ensure readability if background is too busy */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

            <ReconnectOverlay />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center scale-110 lg:scale-125">
                {/* Top Text with heavy shadow */}
                <div
                    className="text-white text-5xl lg:text-7xl mb-8 tracking-tighter select-none"
                    style={{
                        fontFamily: "'Titan One', sans-serif",
                        textShadow: '0 8px 0 rgba(0,0,0,0.2), 0 15px 30px rgba(0,0,0,0.3)'
                    }}
                >
                    Question incoming!
                </div>

                {/* Central Circle Countdown */}
                <div className="relative flex items-center justify-center">
                    {/* THE Green Circle */}
                    <div className="relative w-40 h-40 lg:w-48 lg:h-48 bg-[#4CAF50] rounded-full flex items-center justify-center border-b-[10px] border-black/20 shadow-2xl">
                        <span
                            className="text-[#f5a623] text-7xl lg:text-9xl font-black leading-none select-none"
                            style={{
                                fontFamily: "'Titan One', sans-serif",
                                textShadow: '0 8px 0 rgba(0,0,0,0.2)'
                            }}
                        >
                            {countdown > 0 ? countdown : '🚀'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Mascot in the corner - Rotated 15deg left and slightly off-screen */}
            <div
                className="absolute bottom-[-40px] right-[-60px] w-64 lg:w-[450px] select-none pointer-events-none"
                style={{ transform: 'rotate(-15deg)' }}
            >
                <img src={maskotBase} alt="Mascot" className="w-full h-auto drop-shadow-2xl" />
            </div>
        </div>
    );
};

export default Countdown;
