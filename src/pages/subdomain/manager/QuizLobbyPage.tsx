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
import { dedupeRequest } from '@/lib/requestDedup';
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import { SEO } from '@/components';
import { HeaderLogo } from '@/components/layout';
import countdownBg from '@/assets/images/background.png';
import maskotWaving from '@/assets/maskot-elsalliyor.png';
import maskotBase from '@/assets/maskot.png';
import type { GameStartingPlayload, LobbyUpdatePlayload, PlayerKickedPlayload, QuestionStartPlayload, ReconnectSuccessHostPlayload, Quiz } from '@/types';
import Countdown from '@/components/quiz/shared/Countdown';

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
    const [winHeight, setWinHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

    // Track window height for responsive scaling
    useEffect(() => {
        const handleResize = () => setWinHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Page-refresh reconnect for host — only if we already have
    // a gamePin from THIS lobby session (not a stale one from localStorage)
    useEffect(() => {
        if (gamePin && !gameSocket.isConnected && gameSocket.hasSession()) {
            gameSocket.reconnectWithSession();
        }
    }, [gamePin]);

    const initializeLobby = async () => {
        if (!quizId || !subdomain) return;
        const requestKey = `quiz-lobby-init:${subdomain}:${quizId}`;

        // Clear any stale session from previous games to prevent
        // background reconnect from joining an old game room
        gameSocket.clearStoredSession();

        try {
            setIsLoading(true);

            const [quizResponse, gameResponse] = await dedupeRequest(
                requestKey,
                async () => {
                    return Promise.all([
                        quizService.getQuiz(subdomain, quizId),
                        gameService.createGame(quizId),
                    ]);
                }
            );

            const qr = quizResponse as any;
            setQuiz(qr?.data?.quiz || qr?.data || qr);

            // 2. Create game session (POST /games)
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
                setCountdown(payload.countDown);
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
                setRecentPlayers((prev: string[]) => prev.filter(name => name !== payload.nickname));
                setParticipantCount((prev: number) => Math.max(0, prev - 1));
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

    // ========================================
    // Polling fallback: fetch player count via HTTP in case pub/sub lost
    // ========================================
    useEffect(() => {
        if (!gamePin || phase !== 'lobby') return;

        const pollInterval = setInterval(async () => {
            try {
                const summary = await gameService.getGameSummary(gamePin) as any;
                if (summary?.totalPlayers != null && summary.totalPlayers > participantCount) {
                    setParticipantCount(summary.totalPlayers);
                }
            } catch {
                // Polling is a safety net — ignore errors
            }
        }, 10000); // every 10 seconds

        return () => clearInterval(pollInterval);
    }, [gamePin, phase, participantCount]);

    // Countdown interval — only depends on phase, not countdown value
    useEffect(() => {
        if (phase !== 'countdown') return;
        const interval = setInterval(() => {
            setCountdown((prev: number) => {
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
            navigate(`/manager/quizzes/${quizId}/live`, {
                state: { gameId, gamePin, quiz },
            });
        }
    }, [countdown, phase, navigate, quizId, gameId, gamePin, quiz]);

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
            <Countdown countdown={countdown} />
        );
    }

    // Split players into tiers for the cascade display
    const largePlayers = recentPlayers.slice(0, 3);
    const mediumPlayers = recentPlayers.slice(3, 8);
    const smallPlayers = recentPlayers.slice(8)    // ========================================
    // Render
    // ========================================
    return (
        <div className="h-screen flex flex-col overflow-hidden p-4 md:p-6 lg:p-8 bg-transparent">
            <SEO
                title="Quiz Lobby"
                description="Waiting for participants to join your Quiz Strike session."
                noIndex
            />
            <ReconnectOverlay />

            {/* Premium Header Bar - Slimmer for better fit */}
            <div className="w-full max-w-7xl mx-auto mb-6 flex items-center justify-between flex-shrink-0">
                {/* Logo & Maskot */}
                <HeaderLogo />

                {/* Header Actions Card - Glassmorphic feel */}
                <div className="flex-1 max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-4 py-3 flex items-center justify-between md:ml-[-60px] z-10 border border-white/50">
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-all border-b-2 border-black/10 active:translate-y-[1px] active:border-b-0">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-black uppercase tracking-tight hidden sm:inline">Manage Participants</span>
                    </button>

                    <div className="flex flex-col items-center px-4 overflow-hidden">
                        <h1 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tighter truncate leading-none mb-1">
                            {quiz.title}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">PIN: {gamePin}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-500 px-3 py-1 rounded-full border-b-2 border-black/10">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-white text-xs font-black uppercase">Live</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid - Flex-1 with min-h-0 for scroll-less behavior */}
            <div className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 min-h-0 mb-6">

                {/* Left Column: Join Info */}
                <div className="bg-white rounded-[32px] shadow-2xl py-20 flex flex-col items-center justify-center border-b-[6px] border-black/10 relative overflow-hidden h-full min-h-[350px]">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />

                    <div className="flex flex-col items-center justify-center space-y-2 lg:space-y-4 w-full">
                        <div className="flex flex-col items-center">
                            <div className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Game PIN</div>
                            <div className="text-4xl lg:text-7xl font-black text-[#f5a623] drop-shadow-[0_4px_0_rgba(0,0,0,0.05)] tracking-tighter italic leading-none">
                                {gamePin || '------'}
                            </div>
                        </div>

                        <div className="flex flex-col items-center w-full">
                            <div className="text-xs lg:text-sm font-black text-gray-900 uppercase tracking-wider mb-2 lg:mb-4">Scan to Join</div>

                            <div className="flex flex-col items-center w-full">
                                <QRCodeSVG
                                    value={joinUrl}
                                    size={winHeight < 700 ? 120 : winHeight < 900 ? 160 : 200}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#111"
                                />
                                {/* Copy Link Input Group */}
                                <div className="w-full max-w-sm flex items-center bg-gray-50 rounded-full p-1 border border-gray-200 mt-2 lg:mt-4">
                                    <div className="flex-1 px-4 text-[10px] lg:text-xs font-medium text-gray-400 truncate lowercase">
                                        {joinUrl.replace(/^https?:\/\//, '')}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`px-4 lg:px-6 py-1.5 lg:py-2 rounded-full font-black uppercase tracking-wider text-[10px] lg:text-xs transition-all active:scale-95 ${copied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-900 text-white hover:bg-black'
                                            }`}
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Right Column: Participants */}
                <div className="flex flex-col h-full min-h-0">
                    <div className="flex items-center justify-between mb-3 px-4">
                        <div className="text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] uppercase italic tracking-tighter">
                            Participants
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold">
                            {participantCount} Joined
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-[32px] shadow-2xl p-6 lg:p-8 border-b-[6px] border-black/10 relative flex flex-col min-h-0">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500" />

                        {participantCount === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="text-2xl lg:text-3xl font-black text-gray-900 uppercase tracking-tight max-w-[240px] leading-none mb-4 opacity-20">
                                    Waiting for participants...
                                </div>
                                <div className="w-16 h-1 bg-gray-100 rounded-full animate-pulse" />
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                                <div className="flex flex-wrap gap-3 content-start pb-4">
                                    {recentPlayers.map((name, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleKickPlayer(name)}
                                            className="bg-gray-100 px-4 py-2 lg:px-6 lg:py-3 rounded-xl font-black text-gray-800 uppercase tracking-tighter shadow-sm hover:bg-red-50 hover:text-red-600 hover:line-through transition-all border-b-2 border-black/5 active:translate-y-[1px] active:border-b-0"
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Action: Start Button - Fixed at bottom of flex column */}
            <div className="flex-shrink-0 flex justify-center pb-2">
                <button
                    onClick={handleStartGame}
                    disabled={isStarting || participantCount === 0}
                    className={`group relative flex items-center gap-4 px-12 lg:px-20 py-4 lg:py-6 rounded-full text-xl lg:text-2xl font-black uppercase italic tracking-tighter transition-all shadow-[0_8px_0_rgba(200,130,0,1)] active:shadow-none active:translate-y-[8px] ${isStarting || participantCount === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed grayscale'
                        : 'bg-[#f5a623] text-white hover:bg-[#f6b03c]'
                        }`}
                >
                    <Zap className={`w-6 h-6 lg:w-8 lg:h-8 fill-current ${!isStarting && participantCount > 0 ? "animate-pulse" : ""}`} />
                    <span>{isStarting ? 'Starting...' : 'Start Quiz'}</span>
                </button>
            </div>
        </div>
    );
};

export default QuizLobbyPage;