/**
 * HSD Arena - Join Game Page (Participant)
 * 
 * Mobile-first PIN + nickname entry form.
 * Connects to WebSocket and joins the game room.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import { useManagerNavigate } from '@/hooks';
import type { ErrorPlayload, ForceDisconnectPlayload, JoinSuccessPlayload } from '@/types';

const JoinGamePage = () => {
    const navigate = useManagerNavigate();
    const [searchParams] = useSearchParams();

    const [pin, setPin] = useState(searchParams.get('pin') || '');
    const [nickname, setNickname] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async () => {
        if (!pin.trim() || !nickname.trim()) {
            setError('Please enter both PIN and nickname');
            return;
        }

        setIsJoining(true);
        setError('');

        try {
            // Önce bağlan
            await gameSocket.connect();

            // Declare unsubs first to avoid TDZ
            let successUnsub: () => void;
            let errorUnsub: () => void;
            let disconnectUnsub: () => void;

            // Listener'ları kur
            successUnsub = gameSocket.on(WS_EVENTS.JOIN_SUCCESS, (payload: JoinSuccessPlayload) => {
                if (successUnsub) successUnsub();
                if (errorUnsub) errorUnsub();
                if (disconnectUnsub) disconnectUnsub();
                navigate('/play/lobby', {
                    state: { pin, nickname: payload.myNick || nickname }
                });
            });

            errorUnsub = gameSocket.on(WS_EVENTS.ERROR, (payload: ErrorPlayload) => {
                if (successUnsub) successUnsub();
                if (errorUnsub) errorUnsub();
                if (disconnectUnsub) disconnectUnsub();
                setError(payload.message || 'Failed to join game');
                setIsJoining(false);
            });

            disconnectUnsub = gameSocket.on(WS_EVENTS.FORCE_DISCONNECT, (payload: ForceDisconnectPlayload) => {
                if (successUnsub) successUnsub();
                if (errorUnsub) errorUnsub();
                if (disconnectUnsub) disconnectUnsub();
                setError(payload.reason || 'You have been disconnected');
                setIsJoining(false);
            });

            // Sonra mesajı gönder (tek seferlik)
            gameSocket.joinRoom(pin.trim(), nickname.trim());

            setTimeout(() => {
                if (isJoining) {
                    setError('Connection timed out. Please try again.');
                    setIsJoining(false);
                }
            }, 10000);

        } catch (err) {
            setError('Could not connect to server. Please try again.');
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
            <div className="bg-card rounded-3xl p-8 shadow-2xl w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-primary mb-2">Join Quiz</h1>
                    <p className="text-tertiary">Enter your game PIN to start</p>
                </div>

                {/* Form */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">Game PIN</label>
                        <input
                            type="text"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit PIN"
                            maxLength={6}
                            className="w-full px-4 py-4 border-2 border-light rounded-xl text-center text-3xl font-bold tracking-widest focus:border-focus focus:outline-none transition-colors"
                            disabled={isJoining}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">Nickname</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Choose a nickname"
                            maxLength={20}
                            className="w-full px-4 py-3 border-2 border-light rounded-xl text-lg font-medium focus:border-focus focus:outline-none transition-colors"
                            disabled={isJoining}
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-role-danger-light border border-role-danger rounded-xl text-role-danger text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                {/* Join Button */}
                <button
                    onClick={handleJoin}
                    disabled={isJoining || !pin.trim() || !nickname.trim()}
                    className={`w-full py-4 rounded-xl text-xl font-bold transition-all ${isJoining || !pin.trim() || !nickname.trim()
                        ? 'bg-page text-tertiary cursor-not-allowed'
                        : 'btn-primary hover:shadow-xl'
                        }`}
                >
                    {isJoining ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Connecting...
                        </div>
                    ) : (
                        'Join Game'
                    )}
                </button>
            </div>
        </div>
    );
};

export default JoinGamePage;