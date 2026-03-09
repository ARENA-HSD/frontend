/**
 * HSD Arena - Quiz Lobby Page (Host)
 * 
 * Real-time lobby screen where participants join via PIN.
 * Uses WebSocket for live participant updates.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Zap, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { gameService } from '@/services';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import { quizService } from '@/services';
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import type { GameStartingPlayload, LobbyUpdatePlayload, PlayerKickedPlayload, QuestionStartPlayload, ReconnectSuccessHostPlayload, Quiz } from '@/types';

const QuizLobbyPage = () => {
    const navigate = useManagerNavigate();
    const { id: quizId } = useParams<{ id: string }>();
    const subdomain = useSubdomain();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [gameId, setGameId] = useState<string>('');
    const [gamePin, setGamePin] = useState<string>('');
    const [participantCount, setParticipantCount] = useState(0);
    const [recentPlayers, setRecentPlayers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);

    const [phase, setPhase] = useState<'lobby' | 'countdown'>('lobby');
    const [countdown, setCountdown] = useState(1);
    const [copied, setCopied] = useState(false);

    // Build join URL using subdomain
    const joinUrl = subdomain ? `${window.location.host}/join?pin=${gamePin}` : '';

    const copyToClipboard = useCallback(() => {
        if (!joinUrl) return;
        navigator.clipboard.writeText(joinUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [joinUrl]);

    // ========================================
    // Load quiz and create game session
    // ========================================
    useEffect(() => {
        if (quizId && subdomain) {
            initializeLobby();
        }

        return () => {
            // Cleanup WebSocket on unmount - DISABLED to keep connection alive during transition
            // gameSocket.disconnect();
        };
    }, [quizId, subdomain]);

    // Page-refresh reconnect for host
    useEffect(() => {
        if (!gameSocket.isConnected && gameSocket.hasSession()) {
            gameSocket.reconnectWithSession();
        }
    }, []);

    const initializeLobby = async () => {
        if (!quizId || !subdomain) return;

        try {
            setIsLoading(true);

            // 1. Fetch quiz info
            const quizResponse = await quizService.getQuiz(subdomain, quizId);
            const qr = quizResponse as any;
            setQuiz(qr?.data?.quiz || qr?.data || qr);

            // 2. Create game session (POST /games)
            const gameResponse = await gameService.createGame(quizId);
            const gr = gameResponse as any;
            const gId = gr?.gameId || gr?.data?.gameId || '';
            const pin = gr?.pin || gr?.data?.pin || '';
            setGameId(gId);
            setGamePin(pin);

            // 3. Connect WebSocket
            try {
                await gameSocket.connect();
                setWsConnected(true);

                // Listen for NEED_NICKNAME → auto-send __HOST__
                const unsubNeedNick = gameSocket.on(WS_EVENTS.NEED_NICKNAME, () => {
                    unsubNeedNick();
                    gameSocket.setNickname(pin, '__HOST__');
                });

                // Listen for JOIN_SUCCESS (new join or after SET_NICKNAME)
                const unsubJoinSuccess = gameSocket.on(WS_EVENTS.JOIN_SUCCESS, () => {
                    unsubJoinSuccess();
                    console.log('Host joined lobby successfully');
                });

                // Host joins the room with stored session token (if any)
                const storedToken = localStorage.getItem(`arena_host_session_${pin}`) || undefined;
                gameSocket.joinRoom(pin, storedToken, 'host');
            } catch (wsErr) {
                console.warn('WebSocket connection failed, lobby will work without live updates:', wsErr);
            }
        } catch (error) {
            console.error('Failed to initialize lobby:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ========================================
    // WebSocket event listeners
    // ========================================
    useEffect(() => {
        if (!wsConnected) return;
        console.log('WebSocket connected');

        const unsubs: Array<() => void> = [];

        // Listen for participant joins
        unsubs.push(
            gameSocket.on(WS_EVENTS.LOBBY_UPDATE, (payload: LobbyUpdatePlayload) => {
                setParticipantCount(payload.count);
                setRecentPlayers(payload.recentPlayers || []);
            })
        );

        // Listen for game start
        unsubs.push(
            gameSocket.on(WS_EVENTS.GAME_STARTING, (payload: GameStartingPlayload) => {
                setPhase('countdown');
                const diffSeconds = Math.floor((Date.now() - payload.serverTime) / 1000);
                setCountdown(payload.countDown - diffSeconds);
            })
        );

        // SYNC FIX: If question starts while in lobby, move to live page immediately
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_START, (payload: QuestionStartPlayload) => {
                navigate(`/manager/quizzes/${quizId}/live`, {
                    state: { gameId, gamePin, quiz, initialQuestion: payload },
                    replace: true
                });
            })
        );

        // Listen for player kicked confirmation
        unsubs.push(
            gameSocket.on(WS_EVENTS.PLAYER_KICKED, (payload: PlayerKickedPlayload) => {
                setRecentPlayers(prev => prev.filter(name => name !== payload.nickname));
                setParticipantCount(prev => Math.max(0, prev - 1));
            })
        );

        // Listen for errors
        unsubs.push(
            gameSocket.on(WS_EVENTS.ERROR, (payload: any) => {
                console.error('Game error:', payload);
            })
        );

        // Handle reconnect while in lobby (host)
        unsubs.push(
            gameSocket.on(WS_EVENTS.RECONNECT_SUCCESS, (payload: ReconnectSuccessHostPlayload) => {
                if (payload.gameStatus === 'ACTIVE') {
                    navigate(`/manager/quizzes/${quizId}/live`, {
                        state: {
                            gameId: payload.gameId || gameId,
                            gamePin: payload.pin || gamePin,
                            quiz,
                        },
                        replace: true,
                    });
                }
                if (payload.gameStatus === 'LOBBY') {
                    // Restore lobby state
                    if (payload.count != null) setParticipantCount(payload.count);
                    if (payload.recentPlayers) setRecentPlayers(payload.recentPlayers);
                    if (payload.gameId) setGameId(payload.gameId);
                    if (payload.pin) setGamePin(payload.pin);
                }
                if (payload.gameStatus === 'FINISHED') {
                    navigate(`/manager/quizzes/${quizId}/results`, {
                        state: { quiz },
                        replace: true,
                    });
                }
            })
        );

        return () => {
            unsubs.forEach(unsub => unsub());
        };
    }, [wsConnected]);

    useEffect(() => {
        if (phase === 'countdown') {
            const interval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
        if (countdown <= 0) {
            navigate(`/manager/quizzes/${quizId}/live`, {
                state: {
                    gameId,
                    gamePin,
                    quiz,
                }
            });
        }
    }, [phase, countdown, navigate]);

    // ========================================
    // Actions
    // ========================================
    const handleStartGame = useCallback(() => {
        if (!gameId) return;
        setIsStarting(true);
        // Host emits start. Navigation will happen via GAME_STARTING or QUESTION_START events
        // to stay synchronized with participants.
        gameSocket.startGame(gameId);
    }, [gameId]);

    const handleKickPlayer = useCallback((nickname: string, ban: boolean = false) => {
        gameSocket.kickPlayer(nickname, ban);
    }, []);

    // ========================================
    // Loading State
    // ========================================
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-tertiary">Creating game session...</div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-role-danger">Quiz not found</div>
            </div>
        );
    }

    // ========================================
    // RENDER: Countdown
    // ========================================
    if (phase === 'countdown') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
                <ReconnectOverlay />
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

    // Split players into tiers for the cascade display
    const largePlayers = recentPlayers.slice(0, 3);
    const mediumPlayers = recentPlayers.slice(3, 8);
    const smallPlayers = recentPlayers.slice(8);

    // ========================================
    // Render
    // ========================================
    return (
        <div className="max-w-6xl mx-auto p-4">
            <ReconnectOverlay />
            {/* Top Bar */}
            <div className="bg-card p-4 rounded-lg shadow-sm mb-4 flex items-center justify-between">
                <button className="px-4 py-2 bg-page text-secondary rounded-lg font-medium hover:opacity-80 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Manage Participants
                </button>
                <div className="text-xl font-bold text-primary">{quiz.title}</div>
                <div className="flex items-center gap-2">
                    {wsConnected && (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected" />
                    )}
                    <span className="text-sm text-tertiary">
                        {wsConnected ? 'Live' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* PIN & QR Display */}
            <div className="flex">
                {/* QR Code */}
                {joinUrl && (
                    <div className="flex flex-col items-center bg-card rounded-2xl p-8 shadow-lg">
                        <div className="text-sm text-tertiary font-medium mb-2">Game PIN</div>
                        <div className="text-6xl font-black text-role-primary tracking-widest mb-4">
                            {gamePin || '------'}
                        </div>
                        <div className="text-sm text-tertiary font-medium mb-3">Scan to Join</div>
                        <div className="bg-card p-3 rounded-xl border-2 border-light">
                            <QRCodeSVG
                                value={joinUrl}
                                size={160}
                                level="H"
                                bgColor={getComputedStyle(document.documentElement).getPropertyValue('--surface-card-bg').trim() || '#ffffff'}
                                fgColor={getComputedStyle(document.documentElement).getPropertyValue('--role-primary').trim() || '#3b82f6'}
                            />
                        </div>
                        <div className="mt-3 flex items-center gap-2 bg-page rounded-lg px-3 py-2 max-w-xs">
                            <span className="text-xs text-secondary truncate select-all font-mono">
                                {joinUrl}
                            </span>
                            <button
                                onClick={copyToClipboard}
                                className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
                                title="Copy link"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4 text-tertiary" />
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Participants */}
                <div className="mb-6 w-full p-4">
                    <h3 className="text-lg font-semibold text-secondary mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Participants ({participantCount})
                    </h3>

                    {participantCount === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-tertiary text-lg animate-pulse">
                                Waiting for participants to join...
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Large tiles - first 3 */}
                            {largePlayers.length > 0 && (
                                <div className="flex flex-wrap justify-evenly items-center mb-3">
                                    {largePlayers.map((name, idx) => (
                                        <button key={idx} onClick={() => handleKickPlayer(name)} className="bg-card p-4 rounded-lg shadow-sm animate-fadeIn hover:bg-page hover:line-through">
                                            <div className="text-xl font-semibold text-primary">{name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Medium tiles - next 5 */}
                            {mediumPlayers.length > 0 && (
                                <div className="flex flex-wrap justify-evenly items-center mb-3">
                                    {mediumPlayers.map((name, idx) => (
                                        <button key={idx} onClick={() => handleKickPlayer(name)} className="bg-card p-3 rounded-lg shadow-sm hover:bg-page hover:line-through">
                                            <div className="text-lg font-medium text-primary">{name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Small tiles - remaining */}
                            {smallPlayers.length > 0 && (
                                <div className="flex flex-wrap justify-evenly items-center pb-2 gap-2">
                                    {smallPlayers.map((name, idx) => (
                                        <button key={idx} onClick={() => handleKickPlayer(name)} className="bg-card px-4 py-2 rounded-lg shadow-sm whitespace-nowrap hover:bg-page hover:line-through">
                                            <div className="text-sm font-medium text-secondary">{name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>


            {/* Start Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleStartGame}
                    disabled={isStarting || participantCount === 0}
                    className={`px-12 py-4 rounded-lg text-xl font-bold shadow-lg flex items-center gap-3 transition-all ${isStarting || participantCount === 0
                        ? 'bg-page text-tertiary cursor-not-allowed'
                        : 'btn-primary hover:shadow-xl'
                        }`}
                >
                    <Zap className="w-6 h-6" />
                    {isStarting ? 'Starting...' : 'Start Quiz'}
                </button>
            </div>
        </div>
    );
};

export default QuizLobbyPage;