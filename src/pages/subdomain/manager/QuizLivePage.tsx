/**
 * HSD Arena - Quiz Live Page (Host)
 * 
 * Full game loop using WebSocket events:
 * GAME_STARTING → QUESTION_START → QUESTION_END → LEADERBOARD_RESULT → NEXT_QUESTION → loop
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Users, Check, TrendingUp, Crown, BookOpen, Clock } from 'lucide-react';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import { quizService, questionService } from '@/services';
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import { SEO } from '@/components';
import { HeaderLogo } from '@/components/layout';
import backgroundBg from '@/assets/images/background.png';
import maskot from '@/assets/maskot.png';
import maskotElsalliyor from '@/assets/maskot-elsalliyor.png';
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
} from '@/types';

type GamePhase = 'question' | 'results' | 'leaderboard' | 'finished';

const OPTION_COLORS = ['bg-teal-500', 'bg-pink-500', 'bg-purple-500', 'bg-orange-500'];
const OPTION_BORDER_COLORS = ['border-teal-400', 'border-pink-400', 'border-purple-400', 'border-orange-400'];

const QuizLivePage = () => {
    const navigate = useManagerNavigate();
    const { id: quizId } = useParams<{ id: string }>();
    const subdomain = useSubdomain();
    const location = useLocation();

    // Game state from lobby
    const gameId = (location.state as any)?.gameId || '';
    const gamePin = (location.state as any)?.gamePin || '';
    const initialQuestion = (location.state as any)?.initialQuestion as QuestionStartPlayload | undefined;
    const [quiz, setQuiz] = useState<Quiz | null>((location.state as any)?.quiz || null);

    // ========================================
    // State
    // ========================================
    const [questionIndex, setQuestionIndex] = useState(initialQuestion?.qIndex ?? 0);
    const [questionText, setQuestionText] = useState(initialQuestion?.text || '');
    const [questionMedia, setQuestionMedia] = useState(initialQuestion?.mediaUrl || '');
    const [options, setOptions] = useState<QuestionOption[]>(initialQuestion?.options || []);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [phase, setPhase] = useState<GamePhase>('question');
    const [time, setTime] = useState(initialQuestion?.time || 0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [serverTime, setServerTime] = useState(initialQuestion?.serverTime || 0);
    const [isLoading, setIsLoading] = useState(true);

    // Question End (results) state
    const [correctOptionIndex, setCorrectOptionIndex] = useState(-1);
    const [answerStats, setAnswerStats] = useState<Record<string, number>>({});

    // Leaderboard state
    const [leaderboard, setLeaderboard] = useState<Array<{ nickname: string; score: number }>>([]);
    const [highStreaks, setHighStreaks] = useState<Array<{ nickname: string; streak: number }>>([]);

    // Player connection notifications
    const [connectionToasts, setConnectionToasts] = useState<Array<{ id: number; message: string; type: 'disconnect' | 'reconnect' }>>([]);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const toastIdRef = useRef(0);

    // ========================================
    // Boot: start timer for initial question forwarded from lobby
    // ========================================
    useEffect(() => {
        if (initialQuestion) {
            startTimer(initialQuestion.time, initialQuestion.serverTime);
        }
    }, []); // run once on mount

    // Page-refresh reconnect for host
    useEffect(() => {
        if (!gameSocket.isConnected && gameSocket.hasSession()) {
            gameSocket.reconnectWithSession();
        }
    }, []);

    const showConnectionToast = useCallback((message: string, type: 'disconnect' | 'reconnect') => {
        const id = ++toastIdRef.current;
        setConnectionToasts((prev: Array<{ id: number; message: string; type: 'disconnect' | 'reconnect' }>) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setConnectionToasts((prev: Array<{ id: number; message: string; type: 'disconnect' | 'reconnect' }>) => prev.filter((t: any) => t.id !== id));
        }, 4000);
    }, []);

    // ========================================
    // Initialize
    // ========================================
    useEffect(() => {
        if (quizId && subdomain) {
            loadQuizData();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [quizId, subdomain]);

    const loadQuizData = async () => {
        if (!quizId || !subdomain) return;
        const orgDomain = subdomain;

        try {
            setIsLoading(true);

            // Fetch quiz if not in state (e.g. page refresh)
            if (!quiz) {
                const quizResponse = await quizService.getQuiz(orgDomain, quizId);
                const qr = quizResponse as any;
                setQuiz(qr?.data?.quiz || qr?.data || qr);
            }

            // Fetch questions
            const questionsResponse = await questionService.getQuestions(orgDomain, quizId);
            const questionsr = questionsResponse as any;
            const qList = questionsr?.data?.questions || (Array.isArray(questionsr?.data) ? questionsr.data : []);
            setQuestions(Array.isArray(qList) ? qList : []);
        } catch (error) {
            console.error('Failed to load quiz data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ========================================
    // WebSocket Event Listeners
    // ========================================
    useEffect(() => {
        const unsubs: Array<() => void> = [];

        // If session expired, auto-send __HOST__ nickname
        unsubs.push(
            gameSocket.on(WS_EVENTS.NEED_NICKNAME, () => {
                const currentPin = gamePin || gameSocket.getSessionInfo()?.pin || '';
                if (currentPin) {
                    gameSocket.setNickname(currentPin, '__HOST__');
                }
            })
        );
        // QUESTION_START - new question arrives
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_START, (payload: QuestionStartPlayload) => {
                console.log(payload);
                setQuestionIndex(payload.qIndex);
                setTime(payload.time);
                setServerTime(payload.serverTime);
                setQuestionText(payload.text || '');
                setQuestionMedia(payload.mediaUrl || '');
                setOptions(payload.options || []);
                startTimer(payload.time, payload.serverTime);
                setPhase('question');
            })
        );

        unsubs.push(
            gameSocket.on("ANSWER_STAT_UPDATE", (payload: {
                answeredCount: number;
                totalPlayers: number;
            }) => {
                setAnsweredCount(payload.answeredCount);
                setTotalPlayers(payload.totalPlayers);
            })
        );

        // QUESTION_END - answer stats for host
        unsubs.push(
            gameSocket.on(WS_EVENTS.QUESTION_END, (payload: QuestionEndHostPlayload) => {
                if (timerRef.current) clearInterval(timerRef.current);
                setCorrectOptionIndex(payload.correctIndex);
                setAnswerStats(payload.answerStats || {});
                // Update streaks from QUESTION_END; clear if empty
                const sl = (payload.streakLeaders || []).map((s: any) => ({ nickname: s.nickname || s.nickname, streak: s.streak }));
                setHighStreaks(sl);
                setPhase('results');
            })
        );

        // LEADERBOARD_RESULT - leaderboard data
        unsubs.push(
            gameSocket.on(WS_EVENTS.LEADERBOARD_RESULT, (payload: LeaderboardResultHostPlayload) => {
                const top5 = (payload.top5 || []).map((p: any) => ({ nickname: p.nickname || p.nickname, score: p.score }));
                setLeaderboard(top5);
                setPhase('leaderboard');
            })
        );

        // GAME_OVER
        unsubs.push(
            gameSocket.on(WS_EVENTS.GAME_OVER, (payload: GameOverPlayload) => {
                gameSocket.clearStoredSession();
                navigate(`/manager/quizzes/${quizId}/results`, {
                    state: {
                        quiz: quiz,
                        podium: payload.finalScores,
                    }
                });
            })
        );

        // RECONNECT_SUCCESS (host in-game reconnect)
        unsubs.push(
            gameSocket.on(WS_EVENTS.RECONNECT_SUCCESS, (payload: ReconnectSuccessHostPlayload) => {
                if (payload.gameStatus === 'LOBBY') {
                    navigate(`/manager/quizzes/${quizId}/lobby`, { replace: true });
                    return;
                }
                if (payload.gameStatus === 'FINISHED') {
                    navigate(`/manager/quizzes/${quizId}/results`, {
                        state: { quiz },
                        replace: true,
                    });
                    return;
                }

                // ACTIVE — restore game state
                if (payload.currentQuestionIndex != null) {
                    setQuestionIndex(payload.currentQuestionIndex);
                }

                // Restore question content if provided
                if (payload.text) setQuestionText(payload.text);
                if (payload.mediaUrl) setQuestionMedia(payload.mediaUrl);
                if (payload.options) setOptions(payload.options);

                // Restore phase based on backend hint or best guess
                if (payload.phase === 'leaderboard') {
                    if (payload.leaderboard) setLeaderboard(payload.leaderboard);
                    if (payload.highStreaks) setHighStreaks(payload.highStreaks);
                    setPhase('leaderboard');
                } else if (payload.phase === 'results') {
                    if (payload.answerStats) setAnswerStats(payload.answerStats);
                    if (payload.correctIndex != null) setCorrectOptionIndex(payload.correctIndex);
                    setPhase('results');
                } else {
                    // Default: question phase — start timer if time remaining
                    if (payload.remainingTime && payload.remainingTime > 0) {
                        const remaining = Math.floor(payload.remainingTime);
                        setTime(remaining);
                        startTimer(remaining, Date.now());
                    }
                    setPhase('question');
                }
            })
        );

        // PLAYER_DISCONNECTED
        unsubs.push(
            gameSocket.on(WS_EVENTS.PLAYER_DISCONNECTED, (payload: PlayerDisconnectedPlayload) => {
                showConnectionToast(`${payload.nickname} bağlantısı kesildi`, 'disconnect');
            })
        );

        // PLAYER_RECONNECTED
        unsubs.push(
            gameSocket.on(WS_EVENTS.PLAYER_RECONNECTED, (payload: PlayerReconnectedPlayload) => {
                showConnectionToast(`${payload.nickname} yeniden bağlandı`, 'reconnect');
            })
        );

        return () => {
            unsubs.forEach(unsub => unsub());
        };
    }, []);

    // ========================================
    // Timer
    // ========================================
    const startTimer = useCallback((duration: number, srvTime: number) => {
        if (timerRef.current) clearInterval(timerRef.current);

        // Set initial value immediately so UI doesn't flash 0
        const initialElapsed = Math.floor((Date.now() - srvTime) / 1000);
        setTimeLeft(Math.max(0, duration - initialElapsed));

        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - srvTime) / 1000);
            const remaining = Math.max(0, duration - elapsed);
            setTimeLeft(remaining);
            if (remaining <= 0 && timerRef.current) {
                clearInterval(timerRef.current);
            }
        }, 1000);
    }, []);

    // ========================================
    // Actions
    // ========================================

    const handleShowLeaderboard = () => {
        if (gameId) {
            gameSocket.showLeaderboard(gameId);
        }
        // Fallback if WS not connected
        setPhase('leaderboard');
    };

    const handleNextQuestion = () => {
        if (gameId) {
            gameSocket.nextQuestion(gameId);
        }
        setPhase('question');
    };

    const handleEndGame = () => {
        gameSocket.disconnectAndClear();
        navigate(`/manager/quizzes/${quizId}`);
    };

    // ========================================
    // Loading & Error
    // ========================================
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
                <SEO title="Live Quiz" description="Hosting a live Quiz Strike session." noIndex />
                <div className="text-inverse text-2xl font-bold animate-pulse">Loading quiz...</div>
            </div>
        );
    }

    if ((!quiz || questions.length === 0) && !isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-role-danger text-xl">Quiz not found or has no questions</div>
            </div>
        );
    }

    // Toast renderer helper
    const renderConnectionToasts = () => (
        connectionToasts.length > 0 ? (
            <div className="fixed top-24 right-6 z-[100] space-y-3">
                {connectionToasts.map((toast: any) => (
                    <div
                        key={toast.id}
                        className={`px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 animate-in slide-in-from-right duration-500 ${toast.type === 'success' ? 'bg-green-500 text-white' :
                            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                            }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        ) : null
    );

    // ========================================
    // PHASE: Live Question
    // ========================================
    if (phase === 'question') {
        const progress = (timeLeft / (time || 1)) * 100;

        return (
            <div className="fixed inset-0 z-0 flex flex-col overflow-hidden font-['Outfit',sans-serif]">
                {/* Background */}
                <img
                    src={backgroundBg}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/10" />

                <ReconnectOverlay />
                {renderConnectionToasts()}

                {/* Floating Header Area */}
                <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-center gap-6 pointer-events-none">
                    {/* Logo - Moved closer to the bar */}
                    <div className="hidden lg:block pointer-events-auto">
                        <HeaderLogo scale={0.55} className="m-0" />
                    </div>

                    {/* Main Header Bar */}
                    <div className="flex-1 max-w-3xl bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-b-[4px] border-black/5 p-2 px-6 flex items-center justify-between pointer-events-auto z-50">
                        {/* Left: Manage button */}
                        <div className="flex items-center">
                            <button className="flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-all border border-gray-200 shadow-sm group">
                                <BookOpen className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-black text-gray-700">Manage Participants</span>
                            </button>
                        </div>

                        {/* Center: Title and stats */}
                        <div className="flex-1 text-center flex flex-col items-center justify-center px-4">
                            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">
                                {quiz?.title || 'Quiz Session'}
                            </h1>
                            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-blue-100">
                                Question {questionIndex + 1} of {questions.length}
                            </div>
                        </div>

                        {/* Right: Timer and stats */}
                        <div className="flex items-center gap-6">
                            <div className="hidden lg:flex flex-col items-end mr-[-4px]">
                                <span className="text-[10px] font-black uppercase text-gray-400 leading-none mb-0.5">Answered</span>
                                <div className="text-xl font-black text-gray-900 tabular-nums">
                                    {answeredCount} <span className="text-gray-300 mx-0.5">/</span> {totalPlayers}
                                </div>
                            </div>

                            <div className="relative flex items-center justify-center w-12 h-12">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        className="text-gray-100"
                                    />
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray={2 * Math.PI * 20}
                                        strokeDashoffset={2 * Math.PI * 20 * (1 - progress / 100)}
                                        strokeLinecap="round"
                                        className="text-blue-500 transition-all duration-1000"
                                    />
                                </svg>
                                <span className="absolute text-lg font-black text-white bg-blue-500 w-9 h-9 rounded-full flex items-center justify-center shadow-md">
                                    {timeLeft}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Question Card - Added pt-24 for gap */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 lg:p-8 pt-28 lg:pt-32 min-h-0 overflow-hidden">
                    <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl p-6 lg:p-8 flex flex-col items-center border-b-[8px] border-black/5 overflow-hidden">
                        {/* Question Media Area - Reduced size */}
                        <div className="w-full max-w-md max-h-[30vh] bg-gray-100 rounded-[32px] overflow-hidden shadow-inner mb-6 border border-gray-200 flex items-center justify-center">
                            {questionMedia ? (
                                <img src={questionMedia} alt="Question" className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-48 flex items-center justify-center text-gray-300">
                                    <TrendingUp className="w-16 h-16 opacity-20" />
                                </div>
                            )}
                        </div>

                        {/* Question Text */}
                        <div className="w-full text-center mb-6">
                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                                {questionText}
                            </h2>
                        </div>

                        {/* Answers Grid */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            {(options || []).map((option, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white p-4 lg:p-6 rounded-[24px] shadow-lg border-2 border-gray-100 flex items-center justify-center group transition-all"
                                >
                                    <span className="text-xl lg:text-2xl font-black text-gray-800 group-hover:scale-105 transition-transform">
                                        {option.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Spacing */}
                <div className="h-4" />
            </div>
        );
    }

    // ========================================
    // PHASE: Answer Results
    // ========================================
    if (phase === 'results') {
        const maxCount = Math.max(...Object.values(answerStats).map(Number), 1);

        return (
            <div className="fixed inset-0 z-0 flex flex-col overflow-hidden font-['Outfit',sans-serif]">
                {/* Background */}
                <img
                    src={backgroundBg}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/10" />

                <ReconnectOverlay />
                {renderConnectionToasts()}

                {/* Top Floating Bar */}
                <div className="relative z-20 px-6 py-4">
                    <div className="max-w-[1400px] mx-auto bg-white rounded-[24px] shadow-xl p-2 flex items-center justify-between border-b-[4px] border-black/5">
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block">
                                <HeaderLogo scale={0.5} className="m-2" />
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700">
                                <Users className="w-5 h-5" />
                                <span>Question Results</span>
                            </button>
                        </div>

                        <div className="flex-1 text-center">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                {quiz?.title || 'Quiz Session'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 pr-4">
                            <button
                                onClick={handleShowLeaderboard}
                                className="px-8 py-4 bg-[#f5a623] text-white rounded-2xl font-black uppercase italic tracking-tighter shadow-[0_4px_0_rgba(200,130,0,1)] hover:translate-y-[1px] hover:shadow-[0_3px_0_rgba(200,130,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                            >
                                Leaderboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
                    <div className="w-full max-w-5xl flex flex-col gap-6">
                        {/* Bar Chart Card */}
                        <div className="bg-white rounded-[32px] shadow-2xl p-8 border-b-[8px] border-black/5">
                            <div className="h-64 flex items-end justify-around gap-6 mb-8">
                                {options.map((_option: any, idx: number) => {
                                    const count = Number(answerStats[String(idx)] || 0);
                                    const isCorrect = idx === correctOptionIndex;
                                    const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                    const colors = [
                                        'bg-blue-500',
                                        'bg-purple-500',
                                        'bg-orange-500',
                                        'bg-green-500'
                                    ];

                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                                            <div
                                                className={`w-full flex items-end justify-center rounded-2xl transition-all duration-1000 ease-out relative group ${isCorrect ? 'ring-4 ring-green-400' : ''} ${colors[idx % colors.length]}`}
                                                style={{ height: `${Math.max(heightPercent, 15)}%` }}
                                            >
                                                <div className="mb-4 text-white font-black text-3xl">
                                                    {count}
                                                </div>
                                                {isCorrect && (
                                                    <div className="absolute -top-12 bg-green-500 text-white p-2 rounded-full shadow-lg">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-4 text-gray-400 font-black text-xl">{String.fromCharCode(65 + idx)}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="text-center">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {questionText}
                                </h2>
                            </div>
                        </div>

                        {/* Answer Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {options.map((option: any, idx: number) => {
                                const isCorrect = idx === correctOptionIndex;
                                return (
                                    <div
                                        key={idx}
                                        className={`p-6 rounded-[24px] shadow-lg border-4 transition-all flex items-center justify-between ${isCorrect
                                            ? 'bg-green-50 border-green-400 scale-[1.02]'
                                            : 'bg-white border-gray-100 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xl ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <div className="text-2xl font-black text-gray-800">{option.text}</div>
                                        </div>
                                        {isCorrect && <Check className="w-8 h-8 text-green-500" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom stats Bar */}
                <div className="relative z-10 w-full max-w-5xl mx-auto px-12 mb-8 flex justify-between items-center text-white/80 font-bold">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        <span>Showing results for Question {questionIndex + 1}</span>
                    </div>
                    <div>{Object.values(answerStats).reduce((a, b) => Number(a) + Number(b), 0)} players answered</div>
                </div>
            </div>
        );
    }

    // ========================================
    // PHASE: Leaderboard
    // ========================================
    if (phase === 'leaderboard') {
        const isLastQuestion = questionIndex >= questions.length - 1;

        return (
            <div className="fixed inset-0 z-0 flex flex-col overflow-hidden font-['Outfit',sans-serif]">
                {/* Background */}
                <img
                    src={backgroundBg}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/10" />

                <ReconnectOverlay />
                {renderConnectionToasts()}

                {/* Top Floating Bar */}
                <div className="relative z-20 px-6 py-4">
                    <div className="max-w-[1400px] mx-auto bg-white rounded-[24px] shadow-xl p-2 flex items-center justify-between border-b-[4px] border-black/5">
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block">
                                <HeaderLogo scale={0.5} className="m-2" />
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700">
                                <Users className="w-5 h-5" />
                                <span>Leaderboard</span>
                            </button>
                        </div>

                        <div className="flex-1 text-center">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                {quiz?.title || 'Quiz Session'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 pr-4">
                            <button
                                onClick={handleNextQuestion}
                                className="px-8 py-4 bg-[#f5a623] text-white rounded-2xl font-black uppercase italic tracking-tighter shadow-[0_4px_0_rgba(200,130,0,1)] hover:translate-y-[1px] hover:shadow-[0_3px_0_rgba(200,130,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                            >
                                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
                    <div className="w-full max-w-3xl flex flex-col gap-4">
                        <div className="space-y-3 mb-8">
                            {leaderboard.map((player: any, idx: number) => {
                                const isTop3 = idx < 3;
                                const rankColors = [
                                    'bg-yellow-400 text-yellow-900 ring-yellow-200',
                                    'bg-gray-300 text-gray-900 ring-gray-100',
                                    'bg-orange-400 text-orange-900 ring-orange-200'
                                ];

                                return (
                                    <div
                                        key={idx}
                                        className="bg-white p-4 lg:p-6 rounded-[24px] shadow-lg border-b-[6px] border-black/5 flex items-center gap-6 group hover:translate-y-[-2px] transition-all"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${isTop3 ? rankColors[idx] + ' ring-4' : 'bg-gray-50 text-gray-400'}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-2xl font-black text-gray-800 tracking-tight">
                                                {player.nickname}
                                            </div>
                                            {highStreaks.find((s: any) => s.nickname === player.nickname && s.streak >= 3) && (
                                                <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span>On Fire! 🔥</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gray-900">
                                                {player.score.toLocaleString()}
                                            </div>
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Points</div>
                                        </div>
                                    </div>
                                );
                            })}

                            {leaderboard.length === 0 && (
                                <div className="text-center bg-white/50 backdrop-blur-md rounded-3xl py-16 border-2 border-dashed border-white/30">
                                    <div className="text-2xl font-black text-white/60">Waiting for results...</div>
                                </div>
                            )}
                        </div>

                        {highStreaks.length > 0 && (
                            <div className="bg-blue-600 p-6 rounded-[24px] shadow-2xl border-b-[8px] border-blue-800 flex items-center gap-6">
                                <div className="p-4 bg-white/20 rounded-2xl text-white">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-blue-100 font-bold text-sm uppercase tracking-widest mb-1">Current Top Streaks</div>
                                    <div className="text-white text-xl font-black">
                                        {highStreaks.slice(0, 3).map((s: any) => `${s.nickname} (🔥${s.streak})`).join(', ')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom stats Bar */}
                <div className="relative z-10 w-full max-w-5xl mx-auto px-12 mb-8 flex justify-between items-center text-white/80 font-bold">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        <span>Ready for the next question?</span>
                    </div>
                    <div>{leaderboard.length} participants ranked</div>
                </div>
            </div>
        );
    }

    // ========================================
    // PHASE: Finished (Quiz Complete)
    // ========================================
    if (phase === 'finished') {
        const top3 = leaderboard.slice(0, 3);
        const first = top3[0];
        const second = top3[1];
        const third = top3[2];

        return (
            <div className="fixed inset-0 z-0 flex flex-col overflow-hidden font-['Outfit',sans-serif]">
                {/* Background */}
                <img
                    src={backgroundBg}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/10" />

                <ReconnectOverlay />
                {renderConnectionToasts()}

                {/* Top Floating Bar */}
                <div className="relative z-20 px-6 py-4">
                    <div className="max-w-[1400px] mx-auto bg-white rounded-[24px] shadow-xl p-2 flex items-center justify-between border-b-[4px] border-black/5">
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block">
                                <HeaderLogo scale={0.5} className="m-2" />
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                <span>Final Standings</span>
                            </button>
                        </div>

                        <div className="flex-1 text-center">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                {quiz?.title || 'Quiz Session'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 pr-4">
                            <button
                                onClick={handleEndGame}
                                className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black uppercase italic tracking-tighter shadow-[0_4px_0_rgba(150,0,0,1)] hover:translate-y-[1px] hover:shadow-[0_3px_0_rgba(150,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                            >
                                Close Session
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content: Podium */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
                    <div className="w-full max-w-5xl flex flex-col items-center">
                        <h2 className="text-6xl lg:text-8xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] mb-16 tracking-tighter animate-bounce">
                            PODIUM
                        </h2>

                        <div className="flex items-end justify-center gap-4 lg:gap-8 w-full max-w-4xl">
                            {/* 2nd Place */}
                            <div className="flex-1 flex flex-col items-center group">
                                <div className="mb-4 text-center">
                                    <div className="text-2xl font-black text-white drop-shadow-md truncate max-w-[150px]">
                                        {second?.nickname || '---'}
                                    </div>
                                    <div className="text-white/80 font-bold">{second ? second.score.toLocaleString() : '0'} pts</div>
                                </div>
                                <div className="w-full h-48 bg-gray-300 rounded-t-[32px] border-x-8 border-t-8 border-gray-100 shadow-2xl relative flex items-center justify-center">
                                    <div className="text-7xl font-black text-gray-400 opacity-50">2</div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-xl border-4 border-gray-300">
                                        <div className="w-12 h-12 bg-gray-300 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* 1st Place */}
                            <div className="flex-1 flex flex-col items-center group scale-110 -translate-y-4">
                                <div className="mb-6 text-center">
                                    <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-pulse" />
                                    <div className="text-3xl font-black text-white drop-shadow-md truncate max-w-[200px]">
                                        {first?.nickname || '---'}
                                    </div>
                                    <div className="text-white font-black text-xl">{first ? first.score.toLocaleString() : '0'} pts</div>
                                </div>
                                <div className="w-full h-64 bg-yellow-400 rounded-t-[40px] border-x-8 border-t-8 border-yellow-200 shadow-[0_20px_50px_rgba(245,166,35,0.4)] relative flex items-center justify-center">
                                    <div className="text-9xl font-black text-yellow-600 opacity-30">1</div>
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white p-4 rounded-full shadow-2xl border-4 border-yellow-400">
                                        <div className="w-16 h-16 bg-yellow-400 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* 3rd Place */}
                            <div className="flex-1 flex flex-col items-center group">
                                <div className="mb-4 text-center">
                                    <div className="text-2xl font-black text-white drop-shadow-md truncate max-w-[150px]">
                                        {third?.nickname || '---'}
                                    </div>
                                    <div className="text-white/80 font-bold">{third ? third.score.toLocaleString() : '0'} pts</div>
                                </div>
                                <div className="w-full h-36 bg-orange-400 rounded-t-[32px] border-x-8 border-t-8 border-orange-200 shadow-2xl relative flex items-center justify-center">
                                    <div className="text-6xl font-black text-orange-600 opacity-40">3</div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-xl border-4 border-orange-400">
                                        <div className="w-12 h-12 bg-orange-400 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-4xl h-8 bg-black/20 blur-xl rounded-full -mt-2" />
                    </div>
                </div>

                {/* Mascot - Bottom Right */}
                <img
                    src={maskot}
                    alt="Mascot"
                    className="fixed bottom-[-60px] right-[-60px] w-80 h-auto transform rotate-[-15deg] pointer-events-none z-[60] select-none"
                />

                <div className="relative z-10 w-full max-w-5xl mx-auto px-12 mb-8 flex justify-center items-center text-white/60 font-black uppercase tracking-[0.2em]">
                    Congratulations to all participants!
                </div>
            </div>
        );
    }

    // Fallback
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-tertiary">Loading game...</div>
        </div>
    );
};

export default QuizLivePage;