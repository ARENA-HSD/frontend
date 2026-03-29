/**
 * HSD Arena - useGameController Hook
 *
 * Manages the full game loop state + WebSocket events:
 * LOBBY → GAME_STARTING → QUESTION_START → QUESTION_END → LEADERBOARD_RESULT → NEXT_QUESTION → loop → GAME_OVER
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import { quizService, questionService, gameService } from '@/services';
import { dedupeRequest } from '@/lib/requestDedup';
import type {
    Quiz, Question,
    GameStartingPlayload,
    QuestionEndHostPlayload,
    QuestionStartPlayload,
    LeaderboardResultHostPlayload,
    GameOverPlayload,
    LeaderboardEntry,
    QuestionOption,
    ReconnectSuccessHostPlayload,
    PlayerDisconnectedPlayload,
    PlayerReconnectedPlayload,
    LobbyUpdatePlayload,
    PlayerKickedPlayload,
} from '@/types';

// ========================================
// Types
// ========================================

export type GameState =
    | 'lobby'
    | 'question'
    | 'results'
    | 'leaderboard'
    | 'finished'

interface LocationState {
    gameId?: string;
    gamePin?: string;
    initialQuestion?: QuestionStartPlayload;
    quiz?: Quiz;
    podium?: LeaderboardEntry[];
}

export interface ConnectionToast {
    id: number;
    message: string;
    type: 'disconnect' | 'reconnect';
}

// ========================================
// Hook
// ========================================

export function useGameController() {
    const navigate = useManagerNavigate();
    const { id: quizId } = useParams<{ id: string }>();
    const subdomain = useSubdomain();
    const location = useLocation();

    // ========================================
    // Initial state from location (forwarded from old lobby/live navigation)
    // ========================================
    const locationState = location.state as LocationState | null;
    const initialGameId = locationState?.gameId || '';
    const initialGamePin = locationState?.gamePin || '';
    const initialQuestion = locationState?.initialQuestion;
    const initialQuiz = locationState?.quiz || null;

    // ========================================
    // Game State
    // ========================================
    const [quiz, setQuiz] = useState<Quiz | null>(initialQuiz);
    const [gameId, setGameId] = useState<string>(initialGameId);
    const [gamePin, setGamePin] = useState<string>(initialGamePin);
    const [phase, setPhase] = useState<GameState>(initialQuestion ? 'question' : 'lobby');
    const [isLoading, setIsLoading] = useState(true);

    // Question state
    const [questionIndex, setQuestionIndex] = useState(initialQuestion?.qIndex ?? 0);
    const [questionText, setQuestionText] = useState(initialQuestion?.text || '');
    const [questionMedia, setQuestionMedia] = useState(initialQuestion?.mediaUrl || '');
    const [options, setOptions] = useState<QuestionOption[]>(initialQuestion?.options || []);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [time, setTime] = useState(initialQuestion?.time || 0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [serverTime, setServerTime] = useState(initialQuestion?.serverTime || 0);

    // Question End (results) state
    const [correctOptionIndex, setCorrectOptionIndex] = useState(-1);
    const [answerStats, setAnswerStats] = useState<Record<string, number>>({});

    // Leaderboard state
    const [leaderboard, setLeaderboard] = useState<Array<{ nickname: string; score: number }>>([]);
    const [highStreaks, setHighStreaks] = useState<Array<{ nickname: string; streak: number }>>([]);

    // Lobby state
    const [participantCount, setParticipantCount] = useState(0);
    const [recentPlayers, setRecentPlayers] = useState<string[]>([]);
    const [isStarting, setIsStarting] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [lobbyPhase, setLobbyPhase] = useState<'lobby' | 'countdown'>('lobby');
    const [countdown, setCountdown] = useState(1);
    const [copied, setCopied] = useState(false);
    const [winHeight, setWinHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

    // Finished state (podium data from GAME_OVER)
    const [podium, setPodium] = useState<LeaderboardEntry[]>(locationState?.podium || []);

    // Player connection notifications
    const [connectionToasts, setConnectionToasts] = useState<ConnectionToast[]>([]);

    // ========================================
    // Refs
    // ========================================
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const toastIdRef = useRef(0);
    const toastTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
    const mountedRef = useRef(true);
    const phaseRef = useRef<GameState>(phase);

    // Keep phaseRef in sync
    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    // Track mounted state for safe cleanup
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            // Clear all pending toast timeouts on unmount
            toastTimersRef.current.forEach(timer => clearTimeout(timer));
            toastTimersRef.current.clear();
        };
    }, []);

    // Build join URL using subdomain
    const joinUrl = subdomain ? `${window.location.host}/join?pin=${gamePin}` : '';

    // ========================================
    // Track window height for responsive scaling (lobby)
    // ========================================
    useEffect(() => {
        const handleResize = () => setWinHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ========================================
    // Toast system (with unmount-safe cleanup)
    // ========================================
    const showConnectionToast = useCallback((message: string, type: 'disconnect' | 'reconnect') => {
        const id = ++toastIdRef.current;
        setConnectionToasts(prev => [...prev, { id, message, type }]);

        const timer = setTimeout(() => {
            if (mountedRef.current) {
                setConnectionToasts(prev => prev.filter(t => t.id !== id));
            }
            toastTimersRef.current.delete(timer);
        }, 4000);

        toastTimersRef.current.add(timer);
    }, []);

    // ========================================
    // Timer
    // ========================================
    const startTimer = useCallback((duration: number) => {
        if (timerRef.current) clearInterval(timerRef.current);

        setTimeLeft(Math.max(0, duration));

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const remaining = Math.max(0, prev - 1);
                if (remaining <= 0 && timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                return remaining;
            });
        }, 1000);
    }, []);

    // ========================================
    // DRY helper: apply question payload to state
    // ========================================
    const applyQuestionPayload = useCallback((payload: QuestionStartPlayload) => {
        setQuestionIndex(payload.qIndex);
        setTime(payload.time);
        setServerTime(payload.serverTime);
        setQuestionText(payload.text || '');
        setQuestionMedia(payload.mediaUrl || '');
        setOptions(payload.options || []);
        setAnsweredCount(0);
        setTotalPlayers(0);
        startTimer(payload.time);
    }, [startTimer]);

    // ========================================
    // Boot: start timer for initial question forwarded from lobby
    // ========================================
    useEffect(() => {
        if (initialQuestion) {
            startTimer(initialQuestion.time);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount

    // Page-refresh reconnect for host
    useEffect(() => {
        if (!gameSocket.isConnected && gameSocket.hasSession()) {
            gameSocket.reconnectWithSession();
        }
    }, []);

    // ========================================
    // Initialize: Lobby or Live data
    // ========================================
    useEffect(() => {
        if (quizId && subdomain) {
            if (phase === 'lobby' && !initialQuestion) {
                initializeLobby();
            } else {
                loadQuizData();
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId, subdomain]);

    // ========================================
    // Lobby initialization
    // ========================================
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

            const gr = gameResponse as any;
            const gId = gr?.gameId || gr?.data?.gameId || '';
            const pin = gr?.pin || gr?.data?.pin || '';
            setGameId(gId);
            setGamePin(pin);

            // Connect WebSocket
            try {
                await gameSocket.connect();
                setWsConnected(true);

                // Listen for NEED_NICKNAME → auto-send __HOST__
                const unsubNeedNick = gameSocket.on(WS_EVENTS.NEED_NICKNAME, () => {
                    unsubNeedNick();
                    gameSocket.setNickname(pin, '__HOST__');
                });

                // Listen for JOIN_SUCCESS
                const unsubJoinSuccess = gameSocket.on(WS_EVENTS.JOIN_SUCCESS, () => {
                    unsubJoinSuccess();
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
    // Load quiz data (for live/question phases)
    // ========================================
    const loadQuizData = async (force = false) => {
        if (!quizId || !subdomain) return;
        const requestKey = `quiz-live:${subdomain}:${quizId}`;

        try {
            setIsLoading(true);

            const [quizResponse, questionsResponse] = await dedupeRequest(
                requestKey,
                async () => {
                    return Promise.all([
                        quizService.getQuiz(subdomain, quizId),
                        questionService.getQuestions(subdomain, quizId),
                    ]);
                },
                { cacheMs: 3000, force }
            );

            const qr = quizResponse as any;
            const questionsr = questionsResponse as any;

            if (!quiz) {
                setQuiz(qr?.data?.quiz || qr?.data || qr);
            }

            const qList = questionsr?.data?.questions || (Array.isArray(questionsr?.data) ? questionsr.data : []);
            setQuestions(Array.isArray(qList) ? qList : []);
        } catch (error) {
            console.error('Failed to load quiz data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ========================================
    // Unified WebSocket Event Listeners
    // ========================================
    useEffect(() => {
        const unsubs: Array<() => void> = [];

        // ------ NEED_NICKNAME (auto-send __HOST__) ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.NEED_NICKNAME, () => {
                const currentPin = gamePin || gameSocket.getSessionInfo()?.pin || '';
                if (currentPin) {
                    gameSocket.setNickname(currentPin, '__HOST__');
                }
            })
        );

        // ------ LOBBY_UPDATE ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.LOBBY_UPDATE, (payload: LobbyUpdatePlayload) => {
                setParticipantCount(payload.count);
                setRecentPlayers(payload.recentPlayers || []);
            })
        );

        // ------ GAME_STARTING (countdown) ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.GAME_STARTING, (payload: GameStartingPlayload) => {
                setLobbyPhase('countdown');
                setCountdown(payload.countDown);
            })
        );

        // ------ QUESTION_START ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_START, (payload: QuestionStartPlayload) => {
                applyQuestionPayload(payload);

                if (phaseRef.current === 'lobby') {
                    // Transitioning from lobby to question — load quiz data
                    loadQuizData();
                }

                setPhase('question');
            })
        );

        // ------ ANSWER_STAT_UPDATE ------
        unsubs.push(
            gameSocket.on("ANSWER_STAT_UPDATE", (payload: {
                answeredCount: number;
                totalPlayers: number;
            }) => {
                setAnsweredCount(payload.answeredCount);
                setTotalPlayers(payload.totalPlayers);
            })
        );

        // ------ QUESTION_END (results) ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_END, (payload: QuestionEndHostPlayload) => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setCorrectOptionIndex(payload.correctIndex);
                setAnswerStats(payload.answerStats || {});
                const sl = (payload.streakLeaders || []).map((s: any) => ({
                    nickname: s.nickname || '',
                    streak: s.streak,
                }));
                setHighStreaks(sl);
                setPhase('results');
            })
        );

        // ------ LEADERBOARD_RESULT ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.LEADERBOARD_RESULT, (payload: LeaderboardResultHostPlayload) => {
                const top5 = (payload.top5 || []).map((p: any) => ({
                    nickname: p.nickname || '',
                    score: p.score,
                }));
                setLeaderboard(top5);
                setPhase('leaderboard');
            })
        );

        // ------ GAME_OVER ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.GAME_OVER, (payload: GameOverPlayload) => {
                gameSocket.clearStoredSession();
                setPodium(payload.finalScores || []);
                const finalLeaderboard = (payload.finalScores || []).map((p: any) => ({
                    nickname: p.nickname || p.nick || '',
                    score: p.score || 0,
                }));
                setLeaderboard(finalLeaderboard);
                setPhase('finished');
            })
        );

        // ------ PLAYER_KICKED ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.PLAYER_KICKED, (payload: PlayerKickedPlayload) => {
                setRecentPlayers(prev => prev.filter(name => name !== payload.nickname));
                setParticipantCount(prev => Math.max(0, prev - 1));
            })
        );

        // ------ PLAYER_DISCONNECTED ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.PLAYER_DISCONNECTED, (payload: PlayerDisconnectedPlayload) => {
                showConnectionToast(`${payload.nickname} bağlantısı kesildi`, 'disconnect');
            })
        );

        // ------ PLAYER_RECONNECTED ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.PLAYER_RECONNECTED, (payload: PlayerReconnectedPlayload) => {
                showConnectionToast(`${payload.nickname} yeniden bağlandı`, 'reconnect');
            })
        );

        // ------ RECONNECT_SUCCESS ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.RECONNECT_SUCCESS, (payload: ReconnectSuccessHostPlayload) => {
                if (payload.gameStatus === 'ACTIVE') {
                    if (payload.currentQuestionIndex != null) {
                        setQuestionIndex(payload.currentQuestionIndex);
                    }
                    if (payload.text) setQuestionText(payload.text);
                    if (payload.mediaUrl) setQuestionMedia(payload.mediaUrl);
                    if (payload.options) setOptions(payload.options);

                    if (payload.phase === 'leaderboard') {
                        if (payload.leaderboard) setLeaderboard(payload.leaderboard);
                        if (payload.highStreaks) setHighStreaks(payload.highStreaks);
                        setPhase('leaderboard');
                    } else if (payload.phase === 'results') {
                        if (payload.answerStats) setAnswerStats(payload.answerStats);
                        if (payload.correctIndex != null) setCorrectOptionIndex(payload.correctIndex);
                        setPhase('results');
                    } else {
                        if (payload.remainingTime && payload.remainingTime > 0) {
                            const remaining = Math.floor(payload.remainingTime);
                            setTime(remaining);
                            startTimer(remaining);
                        }
                        setPhase('question');
                    }
                    loadQuizData();
                }

                if (payload.gameStatus === 'LOBBY') {
                    if (payload.count != null) setParticipantCount(payload.count);
                    if (payload.recentPlayers) setRecentPlayers(payload.recentPlayers);
                    if (payload.gameId) setGameId(payload.gameId);
                    if (payload.pin) setGamePin(payload.pin);
                    setPhase('lobby');
                }

                if (payload.gameStatus === 'FINISHED') {
                    gameSocket.clearStoredSession();
                    setPhase('finished');
                }
            })
        );

        // ------ ERROR ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.ERROR, (payload: any) => {
                console.error('Game error:', payload);
            })
        );

        return () => {
            unsubs.forEach(unsub => unsub());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========================================
    // Polling fallback: fetch player count via HTTP in case pub/sub lost
    // ========================================
    useEffect(() => {
        if (!gamePin || phase !== 'lobby' || lobbyPhase !== 'lobby') return;

        const pollInterval = setInterval(async () => {
            try {
                const summary = await gameService.getGameSummary(gamePin) as any;
                if (summary?.totalPlayers != null && summary.totalPlayers > participantCount) {
                    setParticipantCount(summary.totalPlayers);
                }
            } catch {
                // Polling is a safety net — ignore errors
            }
        }, 10000);

        return () => clearInterval(pollInterval);
    }, [gamePin, phase, lobbyPhase, participantCount]);

    // Countdown interval — only depends on lobbyPhase
    useEffect(() => {
        if (lobbyPhase !== 'countdown') return;
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
    }, [lobbyPhase]);

    // When countdown reaches 0, load quiz data so questions array is populated
    useEffect(() => {
        if (lobbyPhase === 'countdown' && countdown <= 0) {
            if (phaseRef.current === 'lobby') {
                loadQuizData();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countdown, lobbyPhase]);

    // ========================================
    // Actions
    // ========================================
    const handleStartGame = useCallback(() => {
        if (!gameId) return;
        setIsStarting(true);
        gameSocket.startGame(gameId);
    }, [gameId]);

    const handleKickPlayer = useCallback((nickname: string, ban: boolean = false) => {
        gameSocket.kickPlayer(nickname, ban);
    }, []);

    const copyToClipboard = useCallback(() => {
        if (!joinUrl) return;
        navigator.clipboard.writeText(joinUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [joinUrl]);

    const handleShowLeaderboard = useCallback(() => {
        if (gameId) {
            gameSocket.showLeaderboard(gameId);
        }
        // Phase transition happens via LEADERBOARD_RESULT event
    }, [gameId]);

    const handleNextQuestion = useCallback(() => {
        if (gameId) {
            gameSocket.nextQuestion(gameId);
        }
        // Phase transition happens via QUESTION_START event
    }, [gameId]);

    const handleEndGame = useCallback(() => {
        gameSocket.disconnectAndClear();
        navigate(`/manager/quizzes/${quizId}`);
    }, [navigate, quizId]);

    // ========================================
    // Return
    // ========================================
    return {
        state: {
            // Core
            quiz,
            quizId,
            phase,
            isLoading,
            gameId,
            gamePin,

            // Question
            questionIndex,
            questionText,
            questionMedia,
            options,
            answeredCount,
            totalPlayers,
            questions,
            time,
            timeLeft,
            serverTime,

            // Results
            correctOptionIndex,
            answerStats,

            // Leaderboard
            leaderboard,
            highStreaks,

            // Lobby
            participantCount,
            recentPlayers,
            isStarting,
            wsConnected,
            lobbyPhase,
            countdown,
            copied,
            winHeight,
            joinUrl,

            // Finished
            podium,

            // Toasts
            connectionToasts,
        },
        actions: {
            handleStartGame,
            handleKickPlayer,
            copyToClipboard,
            handleShowLeaderboard,
            handleNextQuestion,
            handleEndGame,
        },
    };
}
