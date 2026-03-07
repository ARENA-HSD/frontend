/**
 * HSD Arena - Reconnect Overlay
 * 
 * Full-screen overlay shown during WebSocket reconnection.
 * Blocks user interaction and shows reconnection status.
 */

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, XCircle } from 'lucide-react';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';

interface ReconnectOverlayProps {
    onNavigateToJoin?: () => void;
}

const ReconnectOverlay = ({ onNavigateToJoin }: ReconnectOverlayProps) => {
    const [visible, setVisible] = useState(false);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [maxAttempts, setMaxAttempts] = useState(5);
    const [failReason, setFailReason] = useState('');

    useEffect(() => {
        const unsubs: Array<() => void> = [];

        unsubs.push(
            gameSocket.on(WS_EVENTS.RECONNECTING, (payload: { attempt: number; maxAttempts: number }) => {
                setVisible(true);
                setFailed(false);
                setAttempt(payload.attempt);
                setMaxAttempts(payload.maxAttempts);
            })
        );

        unsubs.push(
            gameSocket.on(WS_EVENTS.RECONNECT_SUCCESS, () => {
                setVisible(false);
                setFailed(false);
            })
        );

        unsubs.push(
            gameSocket.on(WS_EVENTS.RECONNECT_FAILED, (payload: { reason?: string }) => {
                setFailed(true);
                setFailReason(payload?.reason || 'Bağlantı yeniden kurulamadı');
            })
        );

        return () => {
            unsubs.forEach(u => u());
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-card rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
                {!failed ? (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                            <WifiOff className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-2">
                            Bağlantı Kesildi
                        </h3>
                        <p className="text-secondary mb-4">
                            Yeniden bağlanılıyor...
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <RefreshCw className="w-5 h-5 text-role-primary animate-spin" />
                            <span className="text-sm text-tertiary">
                                Deneme {attempt}/{maxAttempts}
                            </span>
                        </div>
                        <div className="w-full bg-page rounded-full h-2">
                            <div
                                className="bg-role-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(attempt / maxAttempts) * 100}%` }}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-2">
                            Bağlantı Kurulamadı
                        </h3>
                        <p className="text-secondary mb-6">
                            {failReason}
                        </p>
                        {onNavigateToJoin && (
                            <button
                                onClick={onNavigateToJoin}
                                className="w-full py-3 btn-primary rounded-xl font-semibold"
                            >
                                Oyuna Yeniden Katıl
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReconnectOverlay;
