/**
 * HSD Arena - useParticipantGameController Hook
 *
 * Manages the full participant game loop state + WebSocket events:
 * LOBBY → WAITING → QUESTION → ANSWERED → RESULT → LEADERBOARD → loop → GAME_OVER (→ navigate /play/results)
 *
 * Consolidates logic from ParticipantLobbyPage + ParticipantGamePage into a single hook.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useManagerNavigate } from '@/hooks';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import type {
    QuestionStartPlayload,
    QuestionEndPlayerPlayload,
    LeaderboardResultPlayerPlayload,
    GameOverPlayload,
    ForceDisconnectPlayload,
    ReconnectSuccessPlayerPlayload,
    GameStartingPlayload,
} from '@/types';

// ========================================
// Types
// ========================================

export type GameStatus = 'lobby' | 'countdown' | 'waiting' | 'incoming' | 'question' | 'answered' | 'result' | 'leaderboard' | 'finished';

interface LocationState {
    nickname?: string;
    pin?: string;
    initialQuestion?: QuestionStartPlayload;
    reconnectData?: ReconnectSuccessPlayerPlayload;
    gameMode?: string;
}

export interface ParticipantStats {
    correct: number;
    wrong: number;
    totalScore: number;
    rank: number;
}

// ========================================
// Hook
// ========================================

export function useParticipantGameController() {
    const navigate = useManagerNavigate();
    const location = useLocation();
    const locationState = location.state as LocationState | null;

    // Initial values from location.state
    const nickname = locationState?.nickname || 'Player';
    const pin = locationState?.pin || gameSocket.getSessionInfo()?.pin || '';
    const initialQuestion = locationState?.initialQuestion || null;
    const reconnectData = locationState?.reconnectData || null;
    const initialGameMode = locationState?.gameMode || initialQuestion?.mode || reconnectData?.mode || 'PERSONAL';

    // ========================================
    // Phase State
    // ========================================
    const [phase, setPhase] = useState<GameStatus>(() => {
        if (reconnectData) {
            if (reconnectData.hasAnswered) return 'answered';
            if (reconnectData.gameStatus === 'ACTIVE') return 'waiting';
            if (reconnectData.gameStatus === 'FINISHED') return 'finished';
        }
        if (initialQuestion) return 'question';
        return 'lobby';
    });

    const [gameMode, setGameMode] = useState(initialGameMode);

    // ========================================
    // Question State
    // ========================================
    const [questionType, setQuestionType] = useState<string>(reconnectData?.questionType || initialQuestion?.questionType || 'MULTIPLE_CHOICE');
    const [questionIndex, setQuestionIndex] = useState(reconnectData?.currentQuestionIndex ?? initialQuestion?.qIndex ?? 0);
    const [questionText, setQuestionText] = useState(reconnectData?.text || initialQuestion?.text || '');
    const [questionMedia, setQuestionMedia] = useState(reconnectData?.mediaUrl || initialQuestion?.mediaUrl || '');
    const [options, setOptions] = useState<Array<{ text: string; color: string }>>(reconnectData?.options || initialQuestion?.options || []);
    const [rangeMin, setRangeMin] = useState<number | undefined>(reconnectData?.rangeMin ?? initialQuestion?.rangeMin);
    const [rangeMax, setRangeMax] = useState<number | undefined>(reconnectData?.rangeMax ?? initialQuestion?.rangeMax);
    const [timeLeft, setTimeLeft] = useState(0);

    // Answer states
    const [selectedAnswer, setSelectedAnswer] = useState(-1);
    const [selectedAnswerIndices, setSelectedAnswerIndices] = useState<number[]>([]);
    const [orderedIndices, setOrderedIndices] = useState<number[]>([]);
    const [rangeValue, setRangeValue] = useState<number | undefined>(undefined);

    // ========================================
    // Result State
    // ========================================
    const [isCorrect, setIsCorrect] = useState(false);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [streak, setStreak] = useState(0);

    // Cumulative stats (ref to avoid stale closure in WS handlers)
    const statsRef = useRef<ParticipantStats>({ correct: 0, wrong: 0, totalScore: 0, rank: 0 });

    // ========================================
    // Leaderboard State
    // ========================================
    const [top5, setTop5] = useState<Array<{ nickname: string; score: number }>>([]);

    // ========================================
    // Lobby State
    // ========================================
    const [countdown, setCountdown] = useState(3);
    const [dots, setDots] = useState('.');

    // ========================================
    // Refs — avoid stale closures in WS handlers
    // ========================================
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const incomingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const phaseRef = useRef<GameStatus>(phase);
    const mountedRef = useRef(true);
    const pendingQuestionRef = useRef<QuestionStartPlayload | null>(null);
    const selectedAnswerRef = useRef(-1);
    const nicknameRef = useRef(nickname);
    const gameModeRef = useRef(gameMode);

    // Keep refs in sync with state
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    useEffect(() => { selectedAnswerRef.current = selectedAnswer; }, [selectedAnswer]);
    useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);

    // Track mounted state
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    // ========================================
    // Timer
    // ========================================
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback((duration: number) => {
        clearTimer();
        setTimeLeft(Math.max(0, duration));

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const remaining = Math.max(0, prev - 1);
                if (remaining <= 0) clearTimer();
                return remaining;
            });
        }, 1000);
    }, [clearTimer]);

    // ========================================
    // DRY helper: apply question payload
    // ========================================
    const applyQuestionPayload = useCallback((payload: QuestionStartPlayload) => {
        setQuestionIndex(payload.qIndex);
        setQuestionType(payload.questionType || 'MULTIPLE_CHOICE');
        setQuestionText(payload.text || '');
        setQuestionMedia(payload.mediaUrl || '');
        setOptions(payload.options || []);
        setRangeMin(payload.rangeMin);
        setRangeMax(payload.rangeMax);

        // Reset all answer states
        setSelectedAnswer(-1);
        setSelectedAnswerIndices([]);
        // For ordering, initial state is the default order [0, 1, 2, ...]
        setOrderedIndices((payload.options || []).map((_, i) => i));
        setRangeValue(undefined);

        setGameMode(payload.mode || 'PERSONAL');
        startTimer(payload.time);
    }, [startTimer]);

    // ========================================
    // Boot: start timer for initial question or reconnect data
    // ========================================
    useEffect(() => {
        if (reconnectData && reconnectData.gameStatus === 'ACTIVE' && !reconnectData.hasAnswered && reconnectData.remainingTime > 0) {
            const remaining = Math.floor(reconnectData.remainingTime);
            startTimer(remaining);
            statsRef.current.totalScore = reconnectData.score || 0;
        } else if (reconnectData && reconnectData.hasAnswered) {
            statsRef.current.totalScore = reconnectData.score || 0;
            setStreak(reconnectData.streak || 0);
        } else if (initialQuestion) {
            startTimer(initialQuestion.time);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Page-refresh reconnect
    useEffect(() => {
        if (!gameSocket.isConnected && gameSocket.hasSession() && !reconnectData) {
            gameSocket.reconnectWithSession();
        }
    }, [reconnectData]);

    // ========================================
    // Handle `finished` phase
    // ========================================
    // Previously: navigated to /play/results
    // Now: Handled via state and rendered in ParticipantGamePage
    // No action needed here as phase change handles the UI transition.

    // ========================================
    // Lobby: animate dots
    // ========================================
    useEffect(() => {
        if (phase !== 'lobby') return;
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '.' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, [phase]);

    // ========================================
    // Lobby: countdown interval
    // ========================================
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

    // Lobby: when countdown reaches 0, transition to waiting/question
    useEffect(() => {
        if (phase === 'countdown' && countdown <= 0) {
            if (pendingQuestionRef.current) {
                applyQuestionPayload(pendingQuestionRef.current);
                pendingQuestionRef.current = null;
                navigator.vibrate?.(50);
                setPhase('question');
            } else {
                navigator.vibrate?.(50);
                setPhase('waiting');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countdown, phase]);

    // ========================================
    // Unified WebSocket Event Listeners
    // ========================================
    useEffect(() => {
        const unsubs: Array<() => void> = [];

        // ------ GAME_STARTING (countdown) ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.GAME_STARTING, (payload: GameStartingPlayload) => {
                navigator.vibrate?.(50);
                setPhase('countdown');
                setCountdown(payload.countDown);
            })
        );

        // ------ QUESTION_START ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_START, (payload: QuestionStartPlayload) => {
                if (phaseRef.current === 'lobby') {
                    pendingQuestionRef.current = payload;
                    return;
                }

                // For subsequent questions (not first from waiting/countdown), show incoming transition
                if (phaseRef.current !== 'waiting' && phaseRef.current !== 'countdown') {
                    pendingQuestionRef.current = payload;
                    navigator.vibrate?.(50);
                    setPhase('incoming');

                    // Clear any existing incoming timer
                    if (incomingTimerRef.current) clearTimeout(incomingTimerRef.current);

                    incomingTimerRef.current = setTimeout(() => {
                        if (!mountedRef.current) return;
                        // Subtract 1s from timer to compensate for the transition delay
                        const adjusted = { ...payload, time: Math.max(1, payload.time - 1) };
                        applyQuestionPayload(adjusted);
                        pendingQuestionRef.current = null;
                        setPhase('question');
                    }, 1000);
                    return;
                }

                // First question — show immediately
                applyQuestionPayload(payload);
                navigator.vibrate?.(50);
                setPhase('question');
            })
        );

        // ------ QUESTION_END (player-specific) ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_END, (payload: QuestionEndPlayerPlayload) => {
                clearTimer();
                const correct = payload.correct;
                const pts = payload.points || 0;

                setIsCorrect(correct);
                setPointsEarned(pts);
                setStreak(payload.streak || 0);

                // Update cumulative stats
                if (correct) {
                    statsRef.current.correct += 1;
                } else {
                    statsRef.current.wrong += 1;
                }
                statsRef.current.totalScore += pts;

                navigator.vibrate?.(50);
                setPhase('result');
            })
        );

        // ------ LEADERBOARD_RESULT ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.LEADERBOARD_RESULT, (payload: LeaderboardResultPlayerPlayload) => {
                setTop5(payload.top5 || []);

                if (payload.myRank != null) {
                    statsRef.current.rank = payload.myRank;
                } else {
                    const idx = (payload.top5 || []).findIndex(p => p.nickname === nicknameRef.current);
                    statsRef.current.rank = idx >= 0 ? idx + 1 : 0;
                }
                if (payload.myTotalScore != null) {
                    statsRef.current.totalScore = payload.myTotalScore;
                }

                navigator.vibrate?.(50);
                setPhase('leaderboard');
            })
        );

        // ------ GAME_OVER ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.GAME_OVER, (payload: GameOverPlayload) => {
                gameSocket.clearStoredSession();

                // Keep locally accumulated stats (correct, wrong), but update exact rank and score from backend
                if (payload.myRank != null) {
                    statsRef.current.rank = payload.myRank;
                } else if (statsRef.current.rank === 0) {
                    // Fallback to searching finalScores if myRank wasn't provided for some reason
                    const idx = (payload.finalScores || []).findIndex(p => p.nickname === nicknameRef.current);
                    if (idx >= 0) statsRef.current.rank = idx + 1;
                }

                if (payload.myTotalScore != null) {
                    statsRef.current.totalScore = payload.myTotalScore;
                }

                // Save final data into state instead of navigating
                setTop5(payload.finalScores || []);
                navigator.vibrate?.(50);
                setPhase('finished');
            })
        );

        // ------ FORCE_DISCONNECT ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.FORCE_DISCONNECT, (payload: ForceDisconnectPlayload) => {
                gameSocket.disconnectAndClear();
                navigate('/join', { state: { error: payload.reason } });
            })
        );

        // ------ NEED_NICKNAME (session expired) ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.NEED_NICKNAME, () => {
                navigate('/join', {
                    state: { pin },
                    replace: true,
                });
            })
        );

        // ------ RECONNECT_SUCCESS ------
        unsubs.push(
            gameSocket.on(WS_EVENTS.RECONNECT_SUCCESS, (payload: ReconnectSuccessPlayerPlayload) => {
                if (payload.gameStatus === 'LOBBY') {
                    navigator.vibrate?.(50);
                    setPhase('lobby');
                    return;
                }
                if (payload.gameStatus === 'FINISHED') {
                    navigator.vibrate?.(50);
                    setPhase('finished');
                    return;
                }
                // ACTIVE — restore state
                setQuestionIndex(payload.currentQuestionIndex);
                setQuestionText(payload.text || '');
                setQuestionMedia(payload.mediaUrl || '');
                setOptions(payload.options || []);
                statsRef.current.totalScore = payload.score || 0;
                setStreak(payload.streak || 0);
                setGameMode(payload.mode || 'PERSONAL');

                if (payload.hasAnswered) {
                    navigator.vibrate?.(50);
                    setPhase('answered');
                } else if (payload.remainingTime > 0) {
                    const remaining = Math.floor(payload.remainingTime);
                    startTimer(remaining);
                    setSelectedAnswer(-1);
                    navigator.vibrate?.(50);
                    setPhase('question');
                }
            })
        );

        return () => {
            unsubs.forEach(u => u());
            clearTimer();
            if (incomingTimerRef.current) clearTimeout(incomingTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========================================
    // Actions
    // ========================================

    // 1. Single Answer (MULTIPLE_CHOICE, TRUE_FALSE)
    const handleSelectAnswer = useCallback((idx: number) => {
        if (selectedAnswerRef.current !== -1 || phaseRef.current !== 'question') return;
        setSelectedAnswer(idx);
        navigator.vibrate?.(50);
        setPhase('answered');
        gameSocket.submitAnswer({ answerIndex: idx });
    }, []);

    // 2. Multi Select (Toggle and Submit)
    const handleToggleMultiSelect = useCallback((idx: number) => {
        if (phaseRef.current !== 'question') return;
        setSelectedAnswerIndices(prev => {
            if (prev.includes(idx)) return prev.filter(i => i !== idx);
            return [...prev, idx];
        });
        navigator.vibrate?.(50);
    }, []);

    const handleSubmitMultiSelect = useCallback(() => {
        if (phaseRef.current !== 'question') return;
        navigator.vibrate?.(50);
        setPhase('answered');
        gameSocket.submitAnswer({ answerIndices: selectedAnswerIndices });
    }, [selectedAnswerIndices]);

    // 3. Ordering
    const handleChangeOrdering = useCallback((newOrder: number[]) => {
        if (phaseRef.current !== 'question') return;
        setOrderedIndices(newOrder);
    }, []);

    const handleSubmitOrdering = useCallback(() => {
        if (phaseRef.current !== 'question') return;
        navigator.vibrate?.(50);
        setPhase('answered');
        gameSocket.submitAnswer({ orderedIndices });
    }, [orderedIndices]);

    // 4. Range
    const handleChangeRange = useCallback((val: number) => {
        if (phaseRef.current !== 'question') return;
        setRangeValue(val);
    }, []);

    const handleSubmitRange = useCallback(() => {
        if (phaseRef.current !== 'question' || rangeValue === undefined) return;
        navigator.vibrate?.(50);
        setPhase('answered');
        gameSocket.submitAnswer({ rangeValue });
    }, [rangeValue]);

    const handleNavigateToJoin = useCallback(() => {
        navigate('/join');
    }, [navigate]);

    // ========================================
    // Return
    // ========================================
    return {
        state: {
            // Core
            phase,
            gameMode,
            nickname,
            pin,

            // Question
            questionType,
            questionIndex,
            questionText,
            questionMedia,
            options,
            rangeMin,
            rangeMax,
            timeLeft,

            // Answer states
            selectedAnswer,
            selectedAnswerIndices,
            orderedIndices,
            rangeValue,

            // Result
            isCorrect,
            pointsEarned,
            streak,

            // Stats (ref — stable because phase changes trigger re-render)
            stats: statsRef.current,

            // Leaderboard
            top5,

            // Lobby
            countdown,
            dots,
        },
        actions: {
            handleSelectAnswer,
            handleToggleMultiSelect,
            handleSubmitMultiSelect,
            handleChangeOrdering,
            handleSubmitOrdering,
            handleChangeRange,
            handleSubmitRange,
            handleNavigateToJoin,
        },
    };
}
