/**
 * HSD Arena - ConnectionToasts Component
 *
 * Shared toast notification renderer for player connection events.
 * Correctly maps 'disconnect' → red and 'reconnect' → green.
 */

import type { ConnectionToast } from '@/hooks/useGameController';

interface ConnectionToastsProps {
    toasts: ConnectionToast[];
}

const TOAST_STYLES: Record<ConnectionToast['type'], string> = {
    disconnect: 'bg-red-500 text-white',
    reconnect: 'bg-green-500 text-white',
};

const ConnectionToasts = ({ toasts }: ConnectionToastsProps) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-24 right-6 z-[100] space-y-3">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-in slide-in-from-right duration-500 ${TOAST_STYLES[toast.type]}`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
};

export default ConnectionToasts;
