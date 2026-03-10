/**
 * HSD Arena - Join Game Page (Participant)
 * 
 * Mobile-first PIN + nickname entry form.
 * Connects to WebSocket and joins the game room.
 * 
 * Flow:
 *   1. User enters PIN (or has it from URL param)
 *   2. JOIN_ROOM { pin, sessionToken? } sent to server
 *   3a. If valid sessionToken → RECONNECT_SUCCESS → restore game state
 *   3b. If no/invalid token → NEED_NICKNAME → show nickname input
 *   4. User enters nickname → SET_NICKNAME { pin, nickname }
 *   5. JOIN_SUCCESS { myNick, sessionToken } → save token, go to lobby
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import { useManagerNavigate } from '@/hooks';
import { Button, SEO } from '@/components';
import type {
    ErrorPlayload,
    ForceDisconnectPlayload,
    JoinSuccessPlayload,
    ReconnectSuccessPlayload,
} from '@/types';
import HeaderLogo from '@/components/layout/HeaderLogo';

type Phase = 'pin' | 'nickname' | 'connecting';

const JoinGamePage = () => {
    const navigate = useManagerNavigate();
    const [searchParams] = useSearchParams();

    const [pin, setPin] = useState(searchParams.get('pin') || '');
    const [nickname, setNickname] = useState('');
    const [phase, setPhase] = useState<Phase>('pin');
    const [error, setError] = useState('');
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // ------------------------------------------------------------------
    // WebSocket event listeners — registered once, cleaned up on unmount
    // ------------------------------------------------------------------
    useEffect(() => {
        // NEED_NICKNAME → server says "give me a nickname"
        const unsubNeedNick = gameSocket.on(WS_EVENTS.NEED_NICKNAME, () => {
            clearTimeoutRef();
            setPhase('nickname');
            setError('');
        });

        // JOIN_SUCCESS → new join completed, sessionToken already auto-saved by ws service
        const unsubJoinSuccess = gameSocket.on(
            WS_EVENTS.JOIN_SUCCESS,
            (payload: JoinSuccessPlayload) => {
                clearTimeoutRef();
                navigate('/play/lobby', {
                    state: { pin, nickname: payload.myNick || nickname },
                });
            }
        );

        // RECONNECT_SUCCESS → sessionToken was valid, restore state
        const unsubReconnect = gameSocket.on(
            WS_EVENTS.RECONNECT_SUCCESS,
            (payload: ReconnectSuccessPlayload) => {
                clearTimeoutRef();

                if (payload.gameStatus === 'LOBBY') {
                    navigate('/play/lobby', {
                        state: { pin, nickname: 'Player' },
                        replace: true,
                    });
                } else if (payload.gameStatus === 'ACTIVE' && !payload.isHost) {
                    navigate('/play/game', {
                        state: {
                            pin,
                            nickname: 'Player',
                            gameMode: payload.mode || 'PERSONAL',
                            reconnectData: payload,
                        },
                        replace: true,
                    });
                } else {
                    navigate('/play/results', { replace: true });
                }
            }
        );

        // ERROR → something went wrong
        const unsubError = gameSocket.on(WS_EVENTS.ERROR, (payload: ErrorPlayload) => {
            clearTimeoutRef();
            setError(payload.message || 'Failed to join game');
            // If we were connecting, go back to appropriate phase
            if (phase === 'connecting') {
                setPhase(nickname ? 'nickname' : 'pin');
            }
        });

        // FORCE_DISCONNECT → kicked or banned
        const unsubDisconnect = gameSocket.on(
            WS_EVENTS.FORCE_DISCONNECT,
            (payload: ForceDisconnectPlayload) => {
                clearTimeoutRef();
                setError(payload.reason || 'You have been disconnected');
                setPhase('pin');
                localStorage.removeItem(`session_${pin}`);
            }
        );

        return () => {
            unsubNeedNick();
            unsubJoinSuccess();
            unsubReconnect();
            unsubError();
            unsubDisconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin, nickname, phase]);

    const clearTimeoutRef = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const startTimeout = () => {
        timeoutRef.current = setTimeout(() => {
            setError('Connection timed out. Please try again.');
            setPhase(nickname ? 'nickname' : 'pin');
        }, 10000);
    };

    // ------------------------------------------------------------------
    // Step 1: User submits PIN → connect + JOIN_ROOM
    // ------------------------------------------------------------------
    const handlePinSubmit = useCallback(async () => {
        if (!pin.trim()) {
            setError('Please enter a game PIN');
            return;
        }

        setPhase('connecting');
        setError('');

        try {
            if (!gameSocket.isConnected) await gameSocket.connect();

            const storedToken = localStorage.getItem(`arena_player_session_${pin}`) || undefined;
            gameSocket.joinRoom(pin.trim(), storedToken, 'player');
            startTimeout();
        } catch {
            setError('Could not connect to server. Please try again.');
            setPhase('pin');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin]);

    // ------------------------------------------------------------------
    // Step 2: User submits nickname → SET_NICKNAME
    // ------------------------------------------------------------------
    const handleNicknameSubmit = useCallback(async () => {
        if (!nickname.trim()) {
            setError('Please enter a nickname');
            return;
        }

        setPhase('connecting');
        setError('');

        try {
            if (!gameSocket.isConnected) await gameSocket.connect();

            gameSocket.setNickname(pin.trim(), nickname.trim());
            startTimeout();
        } catch {
            setError('Could not connect to server. Please try again.');
            setPhase('nickname');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin, nickname]);

    // ------------------------------------------------------------------
    // Auto-reconnect on mount:
    //   1. If PIN comes from URL params → submit immediately
    //   2. If no URL param but stored session in localStorage → reconnect
    // ------------------------------------------------------------------
    useEffect(() => {
        const urlPin = searchParams.get('pin');
        if (urlPin && pin.trim()) {
            handlePinSubmit();
            return;
        }

        // Check localStorage for stored player session
        const storedPin = localStorage.getItem('arena_pin');
        const storedRole = localStorage.getItem('arena_role');
        if (storedPin && storedRole === 'player') {
            const storedToken = localStorage.getItem(`arena_player_session_${storedPin}`);
            if (storedToken) {
                // Auto-fill pin and attempt reconnect
                setPin(storedPin);
                setPhase('connecting');
                setError('');

                (async () => {
                    try {
                        if (!gameSocket.isConnected) await gameSocket.connect();
                        gameSocket.joinRoom(storedPin, storedToken, 'player');
                        startTimeout();
                    } catch {
                        setError('Could not reconnect. Please enter PIN manually.');
                        setPhase('pin');
                    }
                })();
            }
        }
        // Only run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------
    const isConnecting = phase === 'connecting';
    const showPinInput = phase === 'pin' || (phase === 'connecting' && !nickname);
    const showNicknameInput = phase === 'nickname';

    const buttonDisabled =
        isConnecting ||
        (showPinInput && !pin.trim()) ||
        (showNicknameInput && !nickname.trim());

    const handleSubmit = showNicknameInput ? handleNicknameSubmit : handlePinSubmit;
    const buttonLabel = isConnecting
        ? undefined // will show spinner
        : showNicknameInput
            ? 'Join Game'
            : 'Continue';

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <SEO
                title="Join Quiz"
                description="Enter your game PIN and nickname to join a live Quiz Strike session."
            />
            <div className="bg-card rounded-3xl p-8 shadow-2xl w-full max-w-sm">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="scale-75">
                        <HeaderLogo />
                    </div>
                    <h1 className="text-2xl font-black text-primary mb-2">Join the fun!</h1>
                    <p className="text-tertiary">
                        {showNicknameInput
                            ? 'Enter your nickname to play'
                            : 'Enter your game PIN to start'}
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-4 mb-6">
                    {showPinInput && (
                        <div>
                            <label className="block text-sm font-semibold text-secondary mb-2">
                                Game PIN
                            </label>
                            <input
                                type="text"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 6-digit PIN"
                                maxLength={6}
                                className="w-full px-4 py-4 border-2 border-light rounded-xl text-center text-3xl font-bold tracking-widest focus:border-focus focus:outline-none transition-colors"
                                disabled={isConnecting}
                                onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                            />
                        </div>
                    )}

                    {showNicknameInput && (
                        <div>
                            <label className="block text-sm font-semibold text-secondary mb-2">
                                Nickname
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Choose a nickname"
                                maxLength={20}
                                className="w-full px-4 py-3 border-2 border-light rounded-xl text-lg font-medium focus:border-focus focus:outline-none transition-colors"
                                disabled={isConnecting}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleNicknameSubmit()}
                            />
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-role-danger-light border border-role-danger rounded-xl text-role-danger text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={buttonDisabled}
                    variant="primary"
                    fullWidth
                    className={`py-4 text-xl font-bold ${buttonDisabled
                        ? 'bg-page text-tertiary cursor-not-allowed'
                        : 'btn-primary hover:shadow-xl'
                        }`}
                >
                    {isConnecting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Connecting...
                        </div>
                    ) : (
                        buttonLabel
                    )}
                </Button>
            </div>
        </div>
    );
};

export default JoinGamePage;