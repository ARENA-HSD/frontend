/**
 * HSD Arena - Participant Lobby Page
 * 
 * Waiting screen after successfully joining a game.
 * Listens for GAME_STARTING to transition to the game.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useManagerNavigate } from '@/hooks';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import type { ForceDisconnectPlayload, GameStartingPlayload, QuestionStartPlayload, ReconnectSuccessPlayerPlayload } from '@/types';

const ParticipantLobbyPage = () => {
    const navigate = useManagerNavigate();
    const location = useLocation();
    const state = location.state as any;
    const storedSession = gameSocket.getSessionInfo();
    const nickname = state?.nickname || 'Player';
    const pin = state?.pin || storedSession?.pin || '';
    const [phase, setPhase] = useState<'lobby' | 'countdown'>('lobby');
    const [countdown, setCountdown] = useState(3);

    const [dots, setDots] = useState('.');

    // Animate dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '.' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Page-refresh reconnect: if no WS connection but session exists
    useEffect(() => {
        if (!gameSocket.isConnected && gameSocket.hasSession()) {
            gameSocket.reconnectWithSession();
        }
    }, []);

    // Listen for game start
    useEffect(() => {
        const unsubs: Array<() => void> = [];

        unsubs.push(
            gameSocket.on(WS_EVENTS.GAME_STARTING, (payload: GameStartingPlayload) => {
                setPhase('countdown');
                const diffSeconds = Math.floor((Date.now() - payload.serverTime) / 1000);
                setCountdown(payload.countDown - diffSeconds);
            })
        );

        // SYNC FIX: If question starts while in lobby, move to game page immediately
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_START, (payload: QuestionStartPlayload) => {
                navigate('/play/game', {
                    state: { ...state, initialQuestion: payload },
                    replace: true
                });
            })
        );

        unsubs.push(
            gameSocket.on(WS_EVENTS.FORCE_DISCONNECT, (payload: ForceDisconnectPlayload) => {
                navigate('/join', {
                    state: { error: payload.reason || 'You have been disconnected' }
                });
            })
        );

        // Handle expired session: server needs a new nickname
        unsubs.push(
            gameSocket.on(WS_EVENTS.NEED_NICKNAME, () => {
                navigate('/join', {
                    state: { pin },
                    replace: true,
                });
            })
        );

        // Handle reconnect while in lobby
        unsubs.push(
            gameSocket.on(WS_EVENTS.RECONNECT_SUCCESS, (payload: ReconnectSuccessPlayerPlayload) => {
                if (payload.gameStatus === 'ACTIVE') {
                    navigate('/play/game', {
                        state: {
                            ...state,
                            gameMode: payload.mode || 'PERSONAL',
                            reconnectData: payload,
                        },
                        replace: true,
                    });
                }
                // LOBBY → stay here, FINISHED → results
                if (payload.gameStatus === 'FINISHED') {
                    navigate('/play/results', { replace: true });
                }
            })
        );

        return () => {
            unsubs.forEach(unsub => unsub());
            // Cleanup WebSocket disabled here to maintain connection during path change
        };
    }, [navigate, state]);

    useEffect(() => {
        if (phase === 'countdown') {
            const interval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
        if (countdown <= 0) {
            navigate('/play/game', {
                state: {
                    ...state,
                }
            });
        }
    }, [phase, countdown, navigate, state]);

    // ========================================
    // RENDER: Countdown
    // ========================================
    if (phase === 'countdown') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
                <ReconnectOverlay onNavigateToJoin={() => navigate('/join')} />
                <div className="text-center">
                    <div className="text-white text-2xl font-bold mb-6 animate-pulse">
                        Get Ready!
                    </div>
                    <div className="text-white text-9xl font-black">
                        {countdown > 0 ? countdown : '🚀'}
                    </div>
                    <div className="text-white/60 text-lg mt-6">
                        Question is coming...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
            <ReconnectOverlay onNavigateToJoin={() => navigate('/join')} />
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