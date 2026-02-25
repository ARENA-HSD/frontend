/**
 * HSD Arena - Participant Lobby Page
 * 
 * Waiting screen after successfully joining a game.
 * Listens for GAME_STARTING to transition to the game.
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import { useManagerNavigate } from '@/hooks';

const ParticipantLobbyPage = () => {
    const navigate = useManagerNavigate();
    const location = useLocation();
    const state = location.state as any;
    const nickname = state?.nickname || 'Player';
    const pin = state?.pin || '';

    const [dots, setDots] = useState('.');

    // Animate dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '.' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Listen for game start
    useEffect(() => {
        const unsubs: Array<() => void> = [];

        unsubs.push(
            gameSocket.on(WS_EVENTS.GAME_STARTING, (payload: any) => {
                navigate('/play/game', {
                    state: {
                        ...state,
                        countDown: payload.countDown,
                    }
                });
            })
        );

        unsubs.push(
            gameSocket.on(WS_EVENTS.FORCE_DISCONNECT, (payload: any) => {
                navigate('/join', {
                    state: { error: payload.reason || 'You have been disconnected' }
                });
            })
        );

        return () => {
            unsubs.forEach(unsub => unsub());
        };
    }, [navigate, state]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
            <div className="text-center">
                {/* Connected Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-6 py-3 rounded-full mb-8">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white font-semibold">Connected</span>
                </div>

                {/* Avatar */}
                <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-4xl font-black text-white">
                        {nickname.charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Nickname */}
                <h2 className="text-3xl font-black text-white mb-2">{nickname}</h2>
                <p className="text-white/70 text-lg mb-8">You're in!</p>

                {/* Waiting Message */}
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-w-xs mx-auto">
                    <div className="text-white/80 text-lg font-medium">
                        Waiting for the host to start{dots}
                    </div>
                </div>

                {/* PIN reminder */}
                {pin && (
                    <div className="mt-6 text-white/40 text-sm">
                        Game PIN: {pin}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParticipantLobbyPage;
