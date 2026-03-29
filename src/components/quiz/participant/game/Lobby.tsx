/**
 * HSD Arena - Participant Lobby Component
 *
 * Waiting screen after joining. Shows nickname, PIN, and animated dots.
 */

import { SEO } from '@/components';
import Countdown from '@/components/quiz/shared/Countdown';
import maskot from "@/assets/maskot.png";
import maskot160Webp from '@/assets/optimized/maskot-160.webp';
import maskot320Webp from '@/assets/optimized/maskot-320.webp';
import maskot480Webp from '@/assets/optimized/maskot-480.webp';

interface LobbyProps {
    nickname: string;
    pin: string;
    lobbyPhase: 'lobby' | 'countdown';
    countdown: number;
    dots: string;
}

const Lobby = ({ nickname, pin, lobbyPhase, countdown, dots }: LobbyProps) => {
    if (lobbyPhase === 'countdown') {
        return <Countdown countdown={countdown} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/20">
            <SEO
                title="Game Lobby"
                description="Waiting for the quiz to start. Get ready to play!"
                noIndex
            />
            <div className="flex flex-col gap-4 w-[80%] max-w-[400px] text-center">

                <div className='bg-card shadow-[0_10px_15px_-12px_rgba(0,0,0,1)] rounded-2xl w-full flex flex-col items-center gap-2 py-10'>
                    <h1 className='text-4xl font-black'>Welcome!</h1>
                    <h2 className="text-3xl font-black text-blue-500">{nickname}</h2>
                </div>

                {/* Waiting Message */}
                <div className="flex flex-col items-center gap-2 text-white">
                    <div className='flex items-center gap-2 font-bold'>
                        <div className='w-4 h-4 rounded-full bg-green-500'></div>
                        <div className="text-xl">Connected</div>
                    </div>
                    <div className='text-sm text-white/80'>
                        Waiting for host to start{dots}
                    </div>
                </div>

                {pin && (
                    <div className="mt-2 text-white/60 text-sm">
                        Game PIN: {pin}
                    </div>
                )}
            </div>
            <picture className='fixed w-[40%] rotate-[15deg] bottom-0 right-0 mb-8 mr-4'>
                <source
                    type="image/webp"
                    srcSet={`${maskot160Webp} 160w, ${maskot320Webp} 320w, ${maskot480Webp} 480w`}
                    sizes="40vw"
                />
                <img
                    src={maskot}
                    alt="maskot"
                    className="w-full h-auto"
                    width={1051}
                    height={758}
                    loading="lazy"
                    decoding="async"
                />
            </picture>
        </div>
    );
};

export default Lobby;
