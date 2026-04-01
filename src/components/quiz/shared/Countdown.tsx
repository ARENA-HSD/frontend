/**
 * HSD Arena - Countdown Component
 * 
 * 3-2-1 countdown transition between questions
 */

import countdownBgMobile from '@/assets/images/background-mobile.png';
import countdownBg from '@/assets/images/background.png';
import maskotBase from '@/assets/maskot.png'
import maskot160Webp from '@/assets/optimized/maskot-160.webp';
import maskot320Webp from '@/assets/optimized/maskot-320.webp';
import maskot480Webp from '@/assets/optimized/maskot-480.webp';
import { ReconnectOverlay } from '@/components/ui';

interface CountdownProps {
    countdown: number;
}

const Countdown = ({ countdown }: CountdownProps) => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden">
            <picture className="absolute inset-0 w-full h-full">
                <source media="(orientation: portrait)" srcSet={countdownBgMobile} />
                <source media="(orientation: landscape)" srcSet={countdownBg} />
                <img src={countdownBg} alt="Background" className="w-full h-full object-cover" />
            </picture>
            <div className="absolute inset-0 bg-black/40" />
            <ReconnectOverlay />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center px-4 scale-100 sm:scale-110 lg:scale-125">
                {/* Top Text with heavy shadow */}
                <div
                    className="text-white text-3xl sm:text-5xl lg:text-7xl mb-4 sm:mb-8 tracking-tighter select-none text-center font-['Titan_One',sans-serif]"
                    style={{
                        textShadow: '0 8px 0 rgba(0,0,0,0.2), 0 15px 30px rgba(0,0,0,0.3)'
                    }}
                >
                    Question incoming!
                </div>

                {/* Central Circle Countdown */}
                <div className="relative flex flex-col items-center justify-center">
                    {/* THE Green Circle */}
                    <div className="relative w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-[#4CAF50] rounded-full flex items-center justify-center border-b-[6px] sm:border-b-[10px] border-black/20 shadow-2xl">
                        <span
                            className="text-[#f5a623] text-5xl sm:text-7xl lg:text-9xl font-black leading-none select-none font-['Titan_One',sans-serif]"
                            style={{
                                textShadow: '0 8px 0 rgba(0,0,0,0.2)'
                            }}
                        >
                            {countdown > 0 ? countdown : '🚀'}
                        </span>
                    </div>

                    <div className="text-white text-xl sm:text-3xl font-black tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-6 text-center">
                        Eğlence başlıyor
                    </div>
                </div>
            </div>

            {/* Mascot in the corner - Rotated 15deg left and slightly off-screen */}
            <div
                className="absolute bottom-[-20px] right-[-30px] lg:bottom-[-40px] lg:right-[-60px] w-[300px] lg:w-[450px] select-none pointer-events-none -rotate-[15deg]"
            >
                <picture>
                    <source
                        type="image/webp"
                        srcSet={`${maskot160Webp} 160w, ${maskot320Webp} 320w, ${maskot480Webp} 480w`}
                        sizes="(max-width: 1024px) 300px, 450px"
                    />
                    <img
                        src={maskotBase}
                        alt="Mascot"
                        className="w-full h-auto drop-shadow-2xl"
                        width={1051}
                        height={758}
                        loading="eager"
                        decoding="async"
                    />
                </picture>
            </div>
        </div>
    );
};

export default Countdown;
