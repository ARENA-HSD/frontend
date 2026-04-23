/**
 * HSD Arena - Incoming Question Transition Component
 *
 * Shown between questions as a brief transition screen.
 * Displays "Yeni soru geliyor..." with an animated loading bar.
 */

import { motion } from 'framer-motion';

const Incoming = () => (
    <div
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]"
        style={{ fontFamily: '"Fredoka", sans-serif' }}
    >
        <div
            className="text-white text-3xl font-black mb-8"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
            Yeni soru geliyor...
        </div>
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, ease: 'linear' }}
            />
        </div>
    </div>
);

export default Incoming;
