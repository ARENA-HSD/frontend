/**
 * HSD Arena - Participant Game Page
 *
 * Single page managing all game states for the participant:
 * question (PERSONAL / STAGE) → answered → result → leaderboard → loop → game over
 *
 * WebSocket payloads (actual backend):
 *   QUESTION_START  → { qIndex, text, time, serverTime, options, mode }
 *   QUESTION_END    → { qIndex, correct, correctIndex, points, streakLeaders }
 *   LEADERBOARD     → { top5: [{ nickname, score }] }
 *   GAME_OVER       → { finalScores }
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useManagerNavigate } from '@/hooks';
import { Check, X, TrendingUp } from 'lucide-react';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import type {
    QuestionStartPlayload,
    QuestionEndPlayerPlayload,
    LeaderboardResultPlayerPlayload,
    GameOverPlayload,
    ForceDisconnectPlayload,
} from '@/types';

// ============================================================================
// Constants
// ============================================================================

type GamePhase = 'waiting' | 'question' | 'answered' | 'result' | 'leaderboard';

const OPTION_COLORS = [
    { bg: 'bg-teal-500', hover: 'hover:bg-teal-600', border: 'border-teal-400' },
    { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', border: 'border-pink-400' },
    { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', border: 'border-purple-400' },
    { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', border: 'border-orange-400' },
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ============================================================================
// Component
// ============================================================================

const ParticipantGamePage = () => {
    const navigate = useManagerNavigate();
    const location = useLocation();
    const state = location.state as any;
    const nickname: string = state?.nickname || 'Player';
    const gameMode: string = state?.gameMode || 'PERSONAL';
    const initialQuestion: QuestionStartPlayload | null = state?.initialQuestion || null;

    // ---------------- Phase ----------------
    const [phase, setPhase] = useState<GamePhase>(initialQuestion ? 'question' : 'waiting');

    // ------------- Question ----------------
    const [questionIndex, setQuestionIndex] = useState(initialQuestion?.qIndex ?? 0);
    const [questionText, setQuestionText] = useState(initialQuestion?.text || '');
    const [questionMedia, setQuestionMedia] = useState(initialQuestion?.mediaUrl || '');
    const [options, setOptions] = useState<Array<{ text: string; color: string }>>(initialQuestion?.options || []);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(-1);

    // ------------- Result ------------------
    const [isCorrect, setIsCorrect] = useState(false);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [streak, setStreak] = useState(0);
    const [correctIndex, setCorrectIndex] = useState(-1);

    // Cumulative stats (ref to avoid stale closure)
    const statsRef = useRef({ correct: 0, wrong: 0, totalScore: 0, rank: 0 });

    // ------------- Leaderboard -------------
    const [top5, setTop5] = useState<Array<{ nickname: string; score: number }>>([]);

    // ------------- Timer -------------------
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback((duration: number, srvTime: number) => {
        clearTimer();

        // Immediately set so UI doesn't flash 0
        const initialElapsed = Math.floor((Date.now() - srvTime) / 1000);
        setTimeLeft(Math.max(0, duration - initialElapsed));

        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - srvTime) / 1000);
            const remaining = Math.max(0, duration - elapsed);
            setTimeLeft(remaining);
            if (remaining <= 0) clearTimer();
        }, 1000);
    }, [clearTimer]);

    // ========================================
    // Boot: start timer for initial question if forwarded from lobby
    // ========================================
    useEffect(() => {
        if (initialQuestion) {
            startTimer(initialQuestion.time, initialQuestion.serverTime);
        }
    }, []); // run once on mount

    // ========================================
    // WebSocket Event Listeners
    // ========================================
    useEffect(() => {
        const unsubs: Array<() => void> = [];

        // ---- QUESTION_START ----
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_START, (payload: QuestionStartPlayload) => {
                setQuestionIndex(payload.qIndex);
                setQuestionText(payload.text || '');
                setQuestionMedia(payload.mediaUrl || '');
                setOptions(payload.options || []);
                setSelectedAnswer(-1);
                startTimer(payload.time, payload.serverTime);
                setPhase('question');
            })
        );

        // ---- QUESTION_END (player-specific) ----
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_END, (payload: QuestionEndPlayerPlayload) => {
                clearTimer();
                const correct = payload.correct;
                const pts = payload.points || 0;

                setIsCorrect(correct);
                setPointsEarned(pts);
                setStreak(payload.streak || 0);
                setCorrectIndex(payload.correctIndex);

                // Update cumulative stats
                if (correct) {
                    statsRef.current.correct += 1;
                } else {
                    statsRef.current.wrong += 1;
                }
                statsRef.current.totalScore += pts;

                setPhase('result');
            })
        );

        // ---- LEADERBOARD_RESULT ----
        unsubs.push(
            gameSocket.on(WS_EVENTS.LEADERBOARD_RESULT, (payload: LeaderboardResultPlayerPlayload) => {
                setTop5(payload.top5 || []);

                // Update rank if provided
                if (payload.myRank != null) {
                    statsRef.current.rank = payload.myRank;
                } else {
                    // Derive rank from top5 list
                    const idx = (payload.top5 || []).findIndex(
                        (p) => p.nickname === nickname
                    );
                    statsRef.current.rank = idx >= 0 ? idx + 1 : 0;
                }
                if (payload.myTotalScore != null) {
                    statsRef.current.totalScore = payload.myTotalScore;
                }

                setPhase('leaderboard');
            })
        );

        // ---- GAME_OVER ----
        unsubs.push(
            gameSocket.on(WS_EVENTS.GAME_OVER, (payload: GameOverPlayload) => {
                const s = statsRef.current;
                navigate('/play/results', {
                    state: {
                        nickname,
                        myRank: s.rank,
                        myTotalScore: s.totalScore,
                        podium: payload.finalScores,
                        correctAnswers: s.correct,
                        wrongAnswers: s.wrong,
                        gameMode,
                    },
                    replace: true,
                });
            })
        );

        // ---- FORCE_DISCONNECT ----
        unsubs.push(
            gameSocket.on(WS_EVENTS.FORCE_DISCONNECT, (payload: ForceDisconnectPlayload) => {
                gameSocket.disconnect();
                navigate('/join', { state: { error: payload.reason } });
            })
        );

        return () => {
            unsubs.forEach((u) => u());
            clearTimer();
        };
    }, [navigate, nickname, gameMode, startTimer, clearTimer]);

    // ========================================
    // Submit Answer
    // ========================================
    const handleSelectAnswer = (idx: number) => {
        if (selectedAnswer !== -1 || phase !== 'question') return;
        setSelectedAnswer(idx);
        setPhase('answered');
        gameSocket.submitAnswer(idx);
    };

    // ========================================
    // RENDER: Waiting for first question
    // ========================================
    if (phase === 'waiting') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
                <div className="text-center">
                    <div className="text-white text-2xl font-bold animate-pulse mb-4">
                        Waiting for question...
                    </div>
                    <div className="text-white/50 text-sm">{nickname}</div>
                </div>
            </div>
        );
    }

    // ========================================
    // RENDER: Question — PERSONAL MODE (full question + options)
    // ========================================
    if ((phase === 'question' || phase === 'answered') && gameMode === 'PERSONAL') {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
                {/* Timer */}
                <div className="flex justify-center mb-4">
                    <div
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-black transition-colors ${
                            timeLeft <= 3
                                ? 'border-red-400 text-red-400 animate-pulse'
                                : 'border-white/60 text-white'
                        }`}
                    >
                        {timeLeft}
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-4">
                    {questionMedia && (
                        <div className="w-full h-32 bg-white/10 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                            <img
                                src={questionMedia}
                                alt="Question"
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    )}
                    <div className="text-white text-xl font-bold text-center">
                        {questionText || `Question ${questionIndex + 1}`}
                    </div>
                </div>

                {/* Options */}
                <div className="flex-1 grid grid-cols-1 gap-3">
                    {options.map((option, idx) => {
                        const color = OPTION_COLORS[idx] || OPTION_COLORS[0];
                        const isSelected = selectedAnswer === idx;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectAnswer(idx)}
                                disabled={phase === 'answered'}
                                className={`w-full p-4 rounded-xl font-bold text-white text-lg transition-all ${color.bg} ${
                                    phase === 'answered'
                                        ? isSelected
                                            ? 'ring-4 ring-white scale-[1.03]'
                                            : 'opacity-40'
                                        : `${color.hover} active:scale-95`
                                }`}
                            >
                                <span className="mr-2">{OPTION_LABELS[idx]}.</span>
                                {option.text}
                            </button>
                        );
                    })}
                </div>

                {/* Answered feedback */}
                {phase === 'answered' && (
                    <div className="mt-4 text-center text-white/70 text-sm animate-pulse">
                        Answer submitted! Waiting for results...
                    </div>
                )}
            </div>
        );
    }

    // ========================================
    // RENDER: Question — STAGE MODE (only colored buttons)
    // ========================================
    if ((phase === 'question' || phase === 'answered') && gameMode === 'STAGE') {
        return (
            <div className="min-h-screen flex flex-col bg-gray-900 p-4">
                {/* Timer */}
                <div className="flex justify-center mb-4">
                    <div
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-black transition-colors ${
                            timeLeft <= 3
                                ? 'border-red-400 text-red-400 animate-pulse'
                                : 'border-white/60 text-white'
                        }`}
                    >
                        {timeLeft}
                    </div>
                </div>

                {/* Large color buttons */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((idx) => {
                        const color = OPTION_COLORS[idx];
                        const isSelected = selectedAnswer === idx;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectAnswer(idx)}
                                disabled={phase === 'answered'}
                                className={`rounded-2xl font-black text-white text-6xl transition-all flex items-center justify-center ${color.bg} ${
                                    phase === 'answered'
                                        ? isSelected
                                            ? 'ring-4 ring-white scale-[1.03]'
                                            : 'opacity-30'
                                        : `${color.hover} active:scale-95`
                                }`}
                            >
                                {OPTION_LABELS[idx]}
                            </button>
                        );
                    })}
                </div>

                {phase === 'answered' && (
                    <div className="mt-4 text-center text-white/50 text-sm animate-pulse">
                        Waiting for results...
                    </div>
                )}
            </div>
        );
    }

    // ========================================
    // RENDER: Answer Result
    // ========================================
    if (phase === 'result') {
        return (
            <div
                className={`min-h-screen flex items-center justify-center p-4 ${
                    isCorrect
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : 'bg-gradient-to-br from-red-500 to-rose-600'
                }`}
            >
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
                        {isCorrect ? (
                            <Check className="w-14 h-14 text-white" />
                        ) : (
                            <X className="w-14 h-14 text-white" />
                        )}
                    </div>

                    <div className="text-4xl font-black text-white mb-2">
                        {isCorrect ? 'Correct!' : 'Wrong!'}
                    </div>

                    {isCorrect && pointsEarned > 0 && (
                        <div className="text-2xl font-bold text-white/90 mb-4">
                            +{pointsEarned.toLocaleString()} points
                        </div>
                    )}

                    {streak >= 3 && (
                        <div className="bg-white/20 backdrop-blur rounded-full px-6 py-2 inline-flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-white" />
                            <span className="text-white font-bold">
                                {streak}x Streak!
                                {streak >= 7 ? ' 🔥🔥🔥' : streak >= 5 ? ' 🔥🔥' : ' 🔥'}
                            </span>
                        </div>
                    )}

                    <div className="mt-4 text-white/50 text-sm animate-pulse">
                        Waiting for leaderboard...
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // RENDER: Leaderboard — PERSONAL (full list)
    // ========================================
    if (phase === 'leaderboard' && gameMode === 'PERSONAL') {
        const { rank, totalScore } = statsRef.current;

        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
                <div className="max-w-sm mx-auto">
                    <h2 className="text-2xl font-black text-white text-center mb-6">
                        Leaderboard
                    </h2>

                    <div className="space-y-2 mb-6">
                        {top5.map((player, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 p-4 rounded-xl ${
                                    player.nickname === nickname
                                        ? 'bg-white/30 ring-2 ring-white'
                                        : 'bg-white/10'
                                }`}
                            >
                                <div className="text-white font-black text-xl w-8">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 text-white font-semibold">
                                    {player.nickname}
                                </div>
                                <div className="text-white font-bold">
                                    {player.score.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Your position */}
                    {rank > 0 && (
                        <div className="bg-white rounded-2xl p-5 text-center">
                            <div className="text-gray-500 text-sm mb-1">Your Position</div>
                            <div className="text-4xl font-black text-indigo-600 mb-1">
                                #{rank}
                            </div>
                            <div className="text-lg font-bold text-gray-800">
                                {totalScore.toLocaleString()} points
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center text-white/50 text-sm animate-pulse">
                        Next question coming...
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // RENDER: Leaderboard — STAGE (simple rank only)
    // ========================================
    if (phase === 'leaderboard' && gameMode === 'STAGE') {
        const { rank, totalScore } = statsRef.current;

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
                <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full">
                    {rank > 0 ? (
                        <>
                            <div className="text-gray-500 text-sm mb-2">Your Current Position</div>
                            <div className="text-6xl font-black text-indigo-600 mb-2">
                                #{rank}
                            </div>
                            <div className="text-2xl font-bold text-gray-800 mb-4">
                                {totalScore.toLocaleString()} points
                            </div>
                        </>
                    ) : (
                        <div className="text-2xl font-bold text-gray-800 mb-4">
                            Waiting for results...
                        </div>
                    )}
                    <div className="text-gray-400 text-sm">
                        Look at the screen for full leaderboard
                    </div>
                </div>
            </div>
        );
    }

    // Fallback — should rarely render
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
            <div className="text-white text-xl animate-pulse">Loading...</div>
        </div>
    );
};

export default ParticipantGamePage;