/**
 * HSD Arena - Quiz Lobby Page (Host)
 * 
 * Real-time lobby screen where participants join via PIN.
 * Uses WebSocket for live participant updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Zap } from 'lucide-react';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { gameService } from '@/services';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import { quizService } from '@/services';
import type { GameStartingPlayload, LobbyUpdatePlayload, QuestionStartPlayload, Quiz } from '@/types';

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

                // Host joins the room too (so server knows this is the host)
                gameSocket.joinRoom(pin, '__HOST__');
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

        // Listen for errors
        unsubs.push(
            gameSocket.on(WS_EVENTS.ERROR, (payload: any) => {
                console.error('Game error:', payload);
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

    const handleKickPlayer = useCallback((socketId: string, ban: boolean = false) => {
        gameSocket.kickPlayer(socketId, ban);
    }, []);

    // ========================================
    // Loading State
    // ========================================
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Creating game session...</div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">Quiz not found</div>
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
            {/* Top Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex items-center justify-between">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Manage Participants
                </button>
                <div className="text-xl font-bold text-gray-900">{quiz.title}</div>
                <div className="flex items-center gap-2">
                    {wsConnected && (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected" />
                    )}
                    <span className="text-sm text-gray-500">
                        {wsConnected ? 'Live' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* PIN Display */}
            <div className="flex justify-center text-center mb-4">
                <div className="flex flex-col items-center bg-white rounded-2xl p-8 shadow-lg">
                    <div className="text-sm text-gray-500 font-medium mb-2">Game PIN</div>
                    <div className="text-6xl font-black text-indigo-600 tracking-widest mb-4">
                        {gamePin || '------'}
                    </div>
                    <div className="text-gray-500 text-sm">
                        Share this PIN with participants to join
                    </div>
                </div>
            </div>

            {/* Participants */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participants ({participantCount})
                </h3>

                {participantCount === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg animate-pulse">
                            Waiting for participants to join...
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Large tiles - first 3 */}
                        {largePlayers.length > 0 && (
                            <div className="flex justify-evenly items-center mb-3">
                                {largePlayers.map((name, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm animate-fadeIn">
                                        <div className="text-xl font-semibold text-gray-900">{name}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Medium tiles - next 5 */}
                        {mediumPlayers.length > 0 && (
                            <div className="flex justify-evenly items-center mb-3">
                                {mediumPlayers.map((name, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                                        <div className="text-lg font-medium text-gray-800">{name}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Small tiles - remaining */}
                        {smallPlayers.length > 0 && (
                            <div className="flex justify-evenly items-center overflow-x-auto pb-2 gap-2">
                                {smallPlayers.map((name, idx) => (
                                    <div key={idx} className="bg-white px-4 py-2 rounded-lg shadow-sm whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-700">{name}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Start Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleStartGame}
                    disabled={isStarting || participantCount === 0}
                    className={`px-12 py-4 rounded-lg text-xl font-bold shadow-lg flex items-center gap-3 transition-all ${isStarting || participantCount === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl'
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