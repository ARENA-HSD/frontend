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
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import { SEO } from '@/components';
import maskotFace from '@/assets/maskot-yüz.png';
import type {
    QuestionStartPlayload,
    QuestionEndPlayerPlayload,
    LeaderboardResultPlayerPlayload,
    GameOverPlayload,
    ForceDisconnectPlayload,
    ReconnectSuccessPlayerPlayload,
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
    const initialQuestion: QuestionStartPlayload | null = state?.initialQuestion || null;
    const reconnectData: ReconnectSuccessPlayerPlayload | null = state?.reconnectData || null;
    const stategameMode: string = state?.gameMode || initialQuestion?.mode || reconnectData?.mode || 'PERSONAL';

    // ---------------- Phase ----------------
    const [phase, setPhase] = useState<GamePhase>(() => {
        if (reconnectData) {
            if (reconnectData.hasAnswered) return 'answered';
            if (reconnectData.gameStatus === 'ACTIVE') return 'question';
            return 'waiting';
        }
        return initialQuestion ? 'question' : 'waiting';
    });

    const [gameMode, setGameMode] = useState(stategameMode)

    // ------------- Question ----------------
    const [questionIndex, setQuestionIndex] = useState(reconnectData?.currentQuestionIndex ?? initialQuestion?.qIndex ?? 0);
    const [questionText, setQuestionText] = useState(reconnectData?.text || initialQuestion?.text || '');
    const [questionMedia, setQuestionMedia] = useState(reconnectData?.mediaUrl || initialQuestion?.mediaUrl || '');
    const [options, setOptions] = useState<Array<{ text: string; color: string }>>(reconnectData?.options || initialQuestion?.options || []);
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
    // Boot: start timer for initial question or reconnect data
    // ========================================
    useEffect(() => {
        if (reconnectData && reconnectData.gameStatus === 'ACTIVE' && !reconnectData.hasAnswered && reconnectData.remainingTime > 0) {
            // For reconnect, calculate serverTime from remainingTime
            const remaining = Math.floor(reconnectData.remainingTime);
            const syntheticServerTime = Date.now();
            startTimer(remaining, syntheticServerTime);

            // Restore score/streak from reconnect
            statsRef.current.totalScore = reconnectData.score || 0;
        } else if (reconnectData && reconnectData.hasAnswered) {
            statsRef.current.totalScore = reconnectData.score || 0;
            setStreak(reconnectData.streak || 0);
        } else if (initialQuestion) {
            startTimer(initialQuestion.time, initialQuestion.serverTime);
        }
    }, []); // run once on mount

    // ========================================
    // Page-refresh reconnect: if no WS connection but session exists
    // ========================================
    useEffect(() => {
        if (!gameSocket.isConnected && gameSocket.hasSession() && !reconnectData) {
            gameSocket.reconnectWithSession();
        }
    }, []);

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
                setGameMode(payload.mode);
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
                gameSocket.clearStoredSession();
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
                gameSocket.disconnectAndClear();
                navigate('/join', { state: { error: payload.reason } });
            })
        );

        // ---- RECONNECT_SUCCESS (in-game reconnect) ----
        unsubs.push(
            gameSocket.on(WS_EVENTS.RECONNECT_SUCCESS, (payload: ReconnectSuccessPlayerPlayload) => {
                if (payload.gameStatus === 'LOBBY') {
                    navigate('/play/lobby', {
                        state: { pin: gameSocket.getSessionInfo()?.pin, nickname },
                        replace: true,
                    });
                    return;
                }
                if (payload.gameStatus === 'FINISHED') {
                    navigate('/play/results', { replace: true });
                    return;
                }
                // ACTIVE - restore state
                setQuestionIndex(payload.currentQuestionIndex);
                setQuestionText(payload.text || '');
                setQuestionMedia(payload.mediaUrl || '');
                setOptions(payload.options || []);
                statsRef.current.totalScore = payload.score || 0;
                setStreak(payload.streak || 0);

                if (payload.hasAnswered) {
                    setPhase('answered');
                } else if (payload.remainingTime > 0) {
                    const remaining = Math.floor(payload.remainingTime);
                    const syntheticServerTime = Date.now();
                    startTimer(remaining, syntheticServerTime);
                    setSelectedAnswer(-1);
                    setPhase('question');
                }
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
                <SEO title="Quiz in Progress" description="Playing a live Quiz Strike session." noIndex />
                <ReconnectOverlay onNavigateToJoin={() => navigate('/join')} />
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
            <div className={'min-h-screen flex flex-col items-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
                style={{ fontFamily: '"Fredoka", sans-serif' }}>
                <ReconnectOverlay onNavigateToJoin={() => navigate('/join')} />
                {/* Timer */}
                <div className="flex justify-center mb-4">
                    <div
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-black transition-colors ${timeLeft <= 3
                            ? 'border-red-400 text-red-400 animate-pulse'
                            : 'border-white/60 text-white'
                            }`}
                    >
                        {timeLeft}
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 mb-4 w-full max-w-md border border-white/10">
                    {questionMedia && (
                        <div className="w-full h-32 bg-white/10 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                            <img
                                src={questionMedia}
                                alt="Question"
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    )}
                    <div className="text-white text-xl font-bold text-center"
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                        {questionText || `Question ${questionIndex + 1}`}
                    </div>
                </div>

                {/* Options */}
                <div className="flex-1 grid grid-cols-1 gap-3 w-full max-w-md">
                    {options.map((option, idx) => {
                        const color = OPTION_COLORS[idx] || OPTION_COLORS[0];
                        const isSelected = selectedAnswer === idx;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectAnswer(idx)}
                                disabled={phase === 'answered'}
                                className={`w-full p-4 rounded-xl font-bold text-white text-lg transition-all border-b-[6px] border-black/15 shadow-lg disabled:opacity-100 ${color.bg} ${phase === 'answered'
                                    ? isSelected
                                        ? 'ring-4 ring-white scale-[1.03]'
                                        : 'grayscale-[40%] brightness-75'
                                    : `${color.hover} active:scale-95 active:border-b-[2px]`
                                    }`}
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                            >
                                <span className="mr-2">{OPTION_LABELS[idx]}.</span>
                                {option.text}
                            </button>
                        );
                    })}
                </div>

                {/* Answered feedback */}
                {phase === 'answered' && (
                    <div className="mt-4 text-center text-white/50 text-sm animate-pulse">
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
            <div className={'min-h-screen flex flex-col items-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
                style={{ fontFamily: '"Fredoka", sans-serif' }}>
                <ReconnectOverlay onNavigateToJoin={() => navigate('/join')} />
                {/* Timer */}
                <div className="flex justify-center mb-4">
                    <div
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-black transition-colors ${timeLeft <= 3
                            ? 'border-red-400 text-red-400 animate-pulse'
                            : 'border-white/60 text-white'
                            }`}
                    >
                        {timeLeft}
                    </div>
                </div>

                {/* Large color buttons */}
                <div className="w-full max-w-md grid grid-cols-2 gap-4 flex-1">
                    {[0, 1, 2, 3].map((idx) => {
                        const color = OPTION_COLORS[idx];
                        const isSelected = selectedAnswer === idx;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectAnswer(idx)}
                                disabled={phase === 'answered'}
                                className={`rounded-xl font-black text-white text-5xl sm:text-6xl transition-all flex items-center justify-center border-b-[6px] border-black/15 shadow-lg disabled:opacity-100 ${color.bg} ${phase === 'answered'
                                    ? isSelected
                                        ? 'ring-4 ring-white scale-[1.03]'
                                        : 'grayscale-[40%] brightness-75'
                                    : `${color.hover} active:scale-95 active:border-b-[2px]`
                                    }`}
                                style={{ textShadow: '0 3px 6px rgba(0,0,0,0.25)' }}
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
                className={`min-h-screen flex flex-col items-center p-4 bg-cover bg-center ${isCorrect
                    ? 'bg-[url(../assets/images/correct.png)]'
                    : 'bg-[url(../assets/images/wrong.png)]'
                    }`}
                style={{ fontFamily: '"Fredoka", sans-serif' }}
            >
                <ReconnectOverlay onNavigateToJoin={() => navigate('/join')} />
                <div className='flex items-center gap-1 my-16'>
                    <h1 className="text-white text-4xl">
                        Quiz
                    </h1>

                    <img src={maskotFace} alt="maskot yüzü" className="w-12 h-14 rotate-12" />

                    <h1 className="text-white text-4xl">
                        Strike
                    </h1>
                </div>
                <div className="flex flex-col items-center justify-center">
                    {isCorrect ? (
                        <Check className="text-white" size={100} strokeWidth={5} />
                    ) : (
                        <X className="text-white" size={100} strokeWidth={5} />
                    )}

                    <div className="text-6xl text-white">
                        {isCorrect ? 'Correct!' : 'Wrong!'}
                    </div>

                    {isCorrect && pointsEarned > 0 && (
                        <span
                            className="text-[7rem] text-white font-[800]"
                            style={{
                                textShadow: `
            0 0 4px #ccff66,
            0 0 10px #aaee33,
            0 0 23px #88dd00,
            0 0 45px #55aa00,
            0 0 80px #338800
          `,
                            }}
                        >
                            +{pointsEarned}
                        </span>
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
            </div >
        );
    }

    // ========================================
    // RENDER: Leaderboard — PERSONAL (full list)
    // ========================================
    if (phase === 'leaderboard' && gameMode === 'PERSONAL') {
        const { rank, totalScore } = statsRef.current;

        return (
            <div
                className={'min-h-screen flex flex-col items-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
                style={{ fontFamily: '"Fredoka", sans-serif' }}
            >
                <ReconnectOverlay onNavigateToJoin={() => navigate('/join')} />

                {/* Logo */}
                <div className='flex items-center gap-1 mt-8 mb-6'>
                    <h1 className="text-white text-4xl font-bold">
                        Quiz
                    </h1>
                    <img src={maskotFace} alt="maskot yüzü" className="w-12 h-14 rotate-12" />
                    <h1 className="text-white text-4xl font-bold">
                        Strike
                    </h1>
                </div>

                {/* Leaderboard List */}
                <div className="w-full max-w-sm space-y-2 mb-6">
                    {top5.map((player, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur-sm ${player.nickname === nickname
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

                {/* Your position - glowing rank */}
                {rank > 0 && (
                    <div className="flex flex-col items-center gap-2">
                        <div
                            style={{
                                position: 'absolute',
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                background: 'rgba(120, 60, 220, 0.35)',
                                filter: 'blur(50px)',
                                zIndex: 0,
                            }}
                        />
                        <span
                            className="font-black"
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                fontSize: '5rem',
                                color: 'white',
                                textShadow: `
                                    0 0 5px rgba(255,255,255,0.6),
                                    0 0 15px rgba(200,180,255,0.5),
                                    0 0 40px rgba(160,120,255,0.7)
                                `,
                            }}
                        >
                            #{rank}
                        </span>
                        <span
                            className="font-black text-white mt-[-30px] z-10"
                            style={{
                                fontSize: '2rem',
                                textShadow: `0 0 10px rgba(0,0,0,1), 0 0 50px rgba(157,0,255,1)`,
                            }}
                        >
                            {totalScore.toLocaleString()}
                        </span>
                    </div>
                )}

                <div className="mt-6 text-center text-white/50 text-sm animate-pulse">
                    Next question coming...
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
            <div
                className={'min-h-screen flex flex-col items-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
                style={{ fontFamily: '"Fredoka", sans-serif' }}
            >
                <ReconnectOverlay onNavigateToJoin={() => navigate('/join')} />

                {/* Logo */}
                <div className='flex items-center gap-1 mt-16'>
                    <h1 className="text-white text-4xl font-bold">
                        Quiz
                    </h1>
                    <img src={maskotFace} alt="maskot yüzü" className="w-12 h-14 rotate-12" />
                    <h1 className="text-white text-4xl font-bold">
                        Strike
                    </h1>
                </div>

                {/* Skor Alanı */}
                <div className="flex flex-col items-center gap-2">
                    {rank > 0 ? (
                        <>
                            {/* Mor blur arka plan */}
                            <div
                                style={{
                                    position: 'absolute',
                                    width: '320px',
                                    height: '320px',
                                    borderRadius: '50%',
                                    background: 'rgba(120, 60, 220, 0.45)',
                                    filter: 'blur(60px)',
                                    zIndex: 0,
                                }}
                            />

                            {/* Rank - büyük beyaz glow yazı */}
                            <span
                                className="font-black"
                                style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    fontSize: '10rem',
                                    color: 'white',
                                    textShadow: `
            0 0 5px rgba(255,255,255,0.6),
            0 0 15px rgba(200,180,255,0.5),
            0 0 40px rgba(160,120,255,0.7),
            0 0 80px rgba(140,90,255,0.6),
            0 0 130px rgba(120,60,255,0.4)
        `,
                                    WebkitTextStroke: '1px rgba(255,255,255,0.3)',
                                }}
                            >
                                #{rank}
                            </span>
                            {/* Puan */}
                            <span
                                className="font-black text-white mt-[-75px] z-10"
                                style={{
                                    fontSize: '4rem',
                                    textShadow: `
            0 0 10px rgba(0, 0, 0, 1),
            0 0 50px rgba(157, 0, 255, 1)
        `,
                                }}
                            >
                                {totalScore.toLocaleString()}
                            </span>
                        </>
                    ) : (
                        <div className="text-2xl font-bold text-white mt-8">
                            Waiting for results...
                        </div>
                    )}
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