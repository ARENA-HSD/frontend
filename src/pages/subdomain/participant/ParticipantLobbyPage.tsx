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
import { SEO } from '@/components';
import type { ForceDisconnectPlayload, GameStartingPlayload, QuestionStartPlayload, ReconnectSuccessPlayerPlayload } from '@/types';
import maskot from "@/assets/maskot.png";
import maskot160Webp from '@/assets/optimized/maskot-160.webp';
import maskot320Webp from '@/assets/optimized/maskot-320.webp';
import maskot480Webp from '@/assets/optimized/maskot-480.webp';
import Countdown from '@/components/quiz/shared/Countdown';

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
                console.log(payload.countDown)
                setCountdown(payload.countDown);
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

    // Countdown interval — only depends on phase, not countdown value
    useEffect(() => {
        if (phase !== 'countdown') return;
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [phase]);

    // Navigate when countdown reaches 0
    useEffect(() => {
        if (phase === 'countdown' && countdown <= 0) {
            navigate('/play/game', {
                state: { ...state },
                replace: true,
            });
        }
    }, [countdown, phase, navigate, state]);

    // ========================================
    // RENDER: Countdown
    // ========================================
    if (phase === 'countdown') {
        return (
            <Countdown countdown={countdown} />
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/20">
            <SEO
                title="Game Lobby"
                description="Waiting for the quiz to start. Get ready to play!"
                noIndex
            />
            <ReconnectOverlay onNavigateToJoin={() => navigate('/join')} />
            <div className="flex flex-col gap-4 w-[80%] max-w-[400px] text-center">

                <div className='bg-card shadow-[0_10px_15px_-12px_rgba(0,0,0,1)] rounded-2xl w-full flex flex-col items-center gap-2 py-10'>
                    <h1 className='text-4xl font-black'>Welcome!</h1>
                    <h2 className="text-3xl font-black text-blue-500">{nickname}</h2>

                </div>

                {/* Waiting Message */}
                <div className="flex flex-col items-center gap-2 text-white">
                    <div className='flex items-center gap-2 font-bold'>
                        <div className='w-4 h-4 rounded-full bg-green-500'></div>
                        <div className="text-xl">
                            Connected
                        </div>
                    </div>
                    <div className='text-sm text-white/80'>
                        Waiting for host to start{dots}
                    </div>
                </div>

                {/* PIN reminder */}
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

export default ParticipantLobbyPage;