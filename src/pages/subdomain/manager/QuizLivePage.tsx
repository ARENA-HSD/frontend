/**
 * HSD Arena - Quiz Live Page (Host)
 * 
 * Full game loop using WebSocket events:
 * GAME_STARTING → QUESTION_START → QUESTION_END → LEADERBOARD_RESULT → NEXT_QUESTION → loop
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Users, Check, TrendingUp, Crown, BookOpen, Clock, Layers } from 'lucide-react';
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

                {/* Main Non-Scrollable Area - Centered Layout */}
                <div className="relative z-10 w-full h-full flex flex-col items-center p-2 md:p-4 pt-4 md:pt-6 overflow-hidden">

                    {/* Header Row Container - Tightly coupled Logo and Bar perfectly aligned left to the Question Card */}
                    <div className="w-full max-w-5xl flex flex-row items-center justify-start gap-1 md:gap-2 mb-2 md:mb-4 z-50 shrink-0 relative">
                        {/* Logo - Static and scaled */}
                        <HeaderLogo />

                        {/* Top Bar - Right next to Logo */}
                        <div className="flex-1 w-full bg-white rounded-[24px] shadow-[0_5px_0_rgba(0,0,0,0.12)] border-[3px] border-black/5 p-1.5 md:p-2 flex items-center justify-between pointer-events-auto z-40">
                            {/* Left: Manage button */}
                            <div className="flex items-center">
                                <button className="flex items-center gap-2 bg-white hover:bg-gray-50 px-3 md:px-4 py-2 rounded-[14px] transition-all border-[2px] border-gray-200 shadow-sm group">
                                    <Layers className="w-4 h-4 text-yellow-500 fill-yellow-100" />
                                    <span className="text-xs md:text-sm font-black text-black tracking-tight">Manage Participants</span>
                                </button>
                            </div>

                            {/* Center: Title and stats */}
                            <div className="flex-1 text-center px-2 flex flex-col items-center justify-center">
                                <h1 className="text-base lg:text-xl font-black text-black leading-tight drop-shadow-sm max-w-[280px] break-words mb-0.5">
                                    {quiz?.title || 'Quiz Session'}
                                </h1>
                                <div className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8.5px] font-black uppercase tracking-wider border border-blue-100">
                                    Question {questionIndex + 1} of {questions.length}
                                </div>
                            </div>

                            {/* Right: Timer and stats */}
                            <div className="flex items-center gap-3 lg:gap-5 pr-1 lg:pr-2">
                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-[9px] font-black uppercase text-gray-400 leading-none mb-0.5">Answered</span>
                                    <div className="text-lg font-black text-gray-900 tabular-nums">
                                        {answeredCount} <span className="text-gray-300 mx-0.5">/</span> {totalPlayers}
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-gray-100" />
                                        <circle
                                            cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent"
                                            strokeDasharray={2 * Math.PI * 16}
                                            strokeDashoffset={2 * Math.PI * 16 * (1 - progress / 100)}
                                            strokeLinecap="round"
                                            className="text-blue-500 transition-all duration-1000"
                                        />
                                    </svg>
                                    <span className="absolute text-sm font-black text-white bg-blue-500 w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                                        {timeLeft}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Card Container */}
                    <div className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col items-center border-b-[6px] md:border-b-[8px] border-black/5 shrink relative z-40 min-h-0 flex-1 max-h-[85vh]">
                        {/* Question Media Area */}
                        {questionMedia ? (
                            <div className="w-full max-w-lg lg:max-w-xl h-28 md:h-40 max-h-[25vh] bg-gray-100 rounded-[24px] overflow-hidden shadow-inner mb-3 md:mb-5 border border-gray-200 flex items-center justify-center shrink-0">
                                <img src={questionMedia} alt="Question" className="w-full h-full object-contain" />
                            </div>
                        ) : null}


                        {/* Question Text */}
                        <div className="w-full text-center mb-3 md:mb-6 px-2 md:px-4 shrink min-h-0 overflow-hidden">
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                                {questionText}
                            </h2>
                        </div>

                        {/* Answers Grid */}
                        <div className={`w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 lg:gap-4 shrink-0 ${!questionMedia ? 'flex-1' : 'mt-auto'}`}>
                            {(options || []).map((option, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-white p-2.5 md:p-4 rounded-[16px] md:rounded-[20px] shadow-[0_3px_12px_rgba(0,0,0,0.04)] border-[2px] border-gray-100 flex items-center justify-center group transition-all shrink-0 ${!questionMedia ? 'min-h-[5rem] md:min-h-[6rem]' : 'min-h-[3.5rem] md:min-h-[4rem]'} hover:border-gray-200 cursor-default`}
                                >
                                    <span className="text-base md:text-lg lg:text-2xl font-black text-gray-800 group-hover:scale-[1.02] transition-transform text-center select-none">
                                        {option.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Spacing */}
                    <div className="h-3 md:h-6 shrink-0 w-full" />
                </div>
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

                {/* Main Non-Scrollable Area - Centered Layout */}
                <div className="relative z-10 w-full h-full flex flex-col items-center p-2 md:p-4 pt-4 md:pt-6 overflow-hidden">

                    {/* Header Row Container - Tightly coupled Logo and Bar perfectly aligned left to the Question Card */}
                    <div className="w-full max-w-5xl flex flex-row items-center justify-start gap-1 md:gap-2 mb-2 md:mb-4 z-50 shrink-0 relative">
                        {/* Logo - Static and scaled */}
                        <HeaderLogo />

                        {/* Top Bar - Right next to Logo */}
                        <div className="flex-1 w-full bg-white rounded-[24px] shadow-[0_5px_0_rgba(0,0,0,0.12)] border-[3px] border-black/5 p-1.5 md:p-2 flex items-center justify-between pointer-events-auto z-40">
                            {/* Left: Manage button */}
                            <div className="flex items-center">
                                <button className="flex items-center gap-2 bg-white hover:bg-gray-50 px-3 md:px-4 py-2 rounded-[14px] transition-all border-[2px] border-gray-200 shadow-sm group">
                                    <Layers className="w-4 h-4 text-yellow-500 fill-yellow-100" />
                                    <span className="text-xs md:text-sm font-black text-black tracking-tight">Manage Participants</span>
                                </button>
                            </div>

                            {/* Center: Title */}
                            <div className="flex-1 text-center px-3 flex items-center justify-center">
                                <h1 className="text-base lg:text-xl font-black text-black leading-tight drop-shadow-sm max-w-[320px] break-words">
                                    {quiz?.title || 'Quiz Session'}
                                </h1>
                            </div>

                            {/* Right: Leaderboard Button */}
                            <div className="flex items-center">
                                <button
                                    onClick={handleShowLeaderboard}
                                    className="px-5 md:px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-2xl font-black text-sm md:text-base transition-all shadow-[0_4px_0_rgba(2,132,199,1)] hover:translate-y-[1px] hover:shadow-[0_3px_0_rgba(2,132,199,1)] active:translate-y-[4px] active:shadow-none whitespace-nowrap"
                                >
                                    Leaderboard
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Unified Card */}
                    <div className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col items-center border-b-[6px] md:border-b-[8px] border-black/5 shrink relative z-40 min-h-0 flex-1 max-h-[85vh]">

                        {/* Bar Chart Area */}
                        <div className="w-full max-w-3xl min-h-[100px] h-[20vh] md:h-40 max-h-[180px] flex items-end justify-around gap-3 md:gap-6 lg:gap-8 mb-3 md:mb-5 mt-1 shrink-0">
                            {options.map((option: any, idx: number) => {
                                const count = Number(answerStats[String(idx)] || 0);
                                const isCorrect = idx === correctOptionIndex;
                                const referenceMax = Math.max(totalPlayers || 0, maxCount, 5);
                                const heightPercent = referenceMax > 0 ? (count / referenceMax) * 100 : 0;

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                                        {count > 0 ? (
                                            <div
                                                className={`w-full max-w-[150px] flex flex-col items-center justify-start rounded-t-xl transition-all duration-1000 ease-out ${isCorrect ? 'bg-[#22c55e]' : 'bg-[#e2e8f0]'}`}
                                                style={{ height: `${heightPercent}%`, minHeight: '3rem' }}
                                            >
                                                <div className={`mt-2 font-black text-xl lg:text-2xl ${isCorrect ? 'text-white' : 'text-gray-500'}`}>
                                                    {count}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="font-black text-xl lg:text-2xl text-gray-400 mb-1">
                                                {count}
                                            </div>
                                        )}
                                        <div className="text-gray-800 font-black text-xs lg:text-sm text-center truncate w-full px-1">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Question Text */}
                        <div className="w-full text-center mb-3 md:mb-6 mt-1 px-2 md:px-4 shrink min-h-0 overflow-y-auto">
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                                {questionText}
                            </h2>
                        </div>

                        {/* Options Grid */}
                        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mt-auto shrink-0">
                            {options.map((option: any, idx: number) => {
                                const isCorrect = idx === correctOptionIndex;
                                return (
                                    <div
                                        key={idx}
                                        className={`relative p-3 lg:p-4 rounded-[16px] lg:rounded-[20px] flex flex-col items-center justify-center text-center transition-all min-h-[4rem] lg:min-h-[5rem] ${isCorrect
                                            ? 'bg-[#ecfdf5] border-[3px] border-[#10b981] text-[#047857]'
                                            : 'bg-white border-[2px] border-gray-200 text-gray-400 opacity-60'
                                            }`}
                                    >
                                        <span className={`text-base lg:text-xl leading-tight ${isCorrect ? 'font-black' : 'font-bold'}`}>
                                            {option.text}
                                        </span>
                                        {isCorrect && (
                                            <div className="absolute -top-2 -right-2 bg-[#10b981] rounded-full p-1 shadow-sm border-[2px] border-white">
                                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={5} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Bottom Spacing */}
                    <div className="h-3 md:h-6 shrink-0 w-full" />
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

                {/* Main Scrollable Area */}
                <div className="relative z-10 w-full h-full flex flex-col items-center p-4 lg:p-6 pt-6 lg:pt-8 overflow-y-auto">

                    {/* Header Row Container - Tightly coupled Logo and Bar perfectly aligned left to the Question Card */}
                    <div className="w-full max-w-5xl flex flex-row items-center justify-start gap-1 md:gap-2 mb-4 lg:mb-6 z-50 shrink-0 relative">
                        {/* Logo - Static and scaled */}
                        <HeaderLogo />

                        {/* Top Bar - Right next to Logo */}
                        <div className="flex-1 w-full flex-col sm:flex-row bg-white rounded-[24px] shadow-[0_5px_0_rgba(0,0,0,0.12)] border-[3px] border-black/5 p-1.5 md:p-2 flex items-center justify-between pointer-events-auto z-40 gap-2 sm:gap-0">
                            {/* Left: Manage button */}
                            <div className="flex items-center">
                                <button className="flex items-center gap-2 bg-white hover:bg-gray-50 px-3 md:px-4 py-2 rounded-[14px] transition-all border-[2px] border-gray-200 shadow-sm group">
                                    <Layers className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-100" />
                                    <span className="text-xs md:text-sm font-black text-black tracking-tight hidden sm:inline">Manage Participants</span>
                                    <span className="text-xs font-black text-black tracking-tight sm:hidden">Manage</span>
                                </button>
                            </div>

                            {/* Center: Title */}
                            <div className="flex-1 text-center px-2 flex items-center justify-center">
                                <h1 className="text-sm md:text-base lg:text-xl font-black text-black leading-tight drop-shadow-sm max-w-[200px] md:max-w-[320px] break-words">
                                    {quiz?.title || 'Advanced Mathematics'}
                                </h1>
                            </div>

                            {/* Right: Next Question Button */}
                            <div className="flex items-center">
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-4 md:px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm lg:text-base transition-all shadow-[0_4px_0_rgba(2,132,199,1)] hover:translate-y-[1px] hover:shadow-[0_3px_0_rgba(2,132,199,1)] active:translate-y-[4px] active:shadow-none whitespace-nowrap"
                                >
                                    {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Card Container */}
                    <div className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] px-4 py-6 lg:p-10 flex flex-col items-center border-b-[6px] md:border-b-[8px] border-black/5 shrink-0 relative z-40">

                        {/* Leaderboard Title */}
                        <div className="mb-6 lg:mb-8 text-center w-full">
                            <h2
                                className="text-4xl md:text-5xl lg:text-6xl text-black select-none"
                                style={{
                                    fontFamily: "'Titan One', sans-serif",
                                    WebkitTextStroke: '2px black'
                                }}
                            >
                                Leaderboard
                            </h2>
                        </div>

                        {/* Leaderboard Flex Layout wrapper */}
                        <div className="w-full flex flex-col items-center gap-2 lg:gap-4 max-w-4xl mx-auto px-1 md:px-4 pb-4">

                            {/* Tier 1: Gold Rank */}
                            <div className="w-full flex justify-center z-30">
                                {leaderboard[0] ? (
                                    <div className="w-full sm:w-auto min-w-[300px] max-w-[420px] bg-[#f5a623] rounded-full flex items-center gap-3 p-1.5 md:p-2 shadow-[0_4px_0_rgba(200,130,0,1)] border-[3px] border-amber-500/30 transition-transform hover:scale-105">
                                        <div className="bg-[#f0c14b] text-yellow-900 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-xl md:text-2xl shadow-inner border border-yellow-200 shrink-0">
                                            1
                                        </div>
                                        <div className="font-black text-gray-900 text-lg md:text-xl truncate pt-0.5">
                                            {leaderboard[0].nickname}
                                        </div>
                                        <div className="ml-auto font-black text-gray-900 text-xl md:text-2xl pr-2 tracking-tighter tabular-nums flex items-center gap-1.5 pt-0.5">
                                            {leaderboard[0].score}
                                            {highStreaks.find((s: any) => s.nickname === leaderboard[0].nickname && s.streak > 2) && (
                                                <span className="text-lg md:text-xl shrink-0 -mt-0.5">🔥</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full sm:w-auto min-w-[300px] h-[60px] md:h-[68px] bg-gray-100 rounded-full border-[3px] border-gray-200 border-dashed animate-pulse text-gray-400 flex items-center justify-center font-bold">Waiting for P1...</div>
                                )}
                            </div>

                            {/* Tier 2: Green & Silver & Bronze */}
                            <div className="w-full flex gap-3 md:gap-5 min-h-[60px] md:min-h-[68px] justify-center mt-[-10px] md:mt-[-16px] z-20 flex-wrap">

                                <div className="flex-1 min-w-[200px] max-w-[300px]">
                                    {leaderboard[1] && (
                                        <div className="w-full h-full bg-[#10b981] rounded-full flex items-center gap-2 p-1.5 md:p-2 shadow-[0_4px_0_rgba(4,120,87,1)] border-[3px] border-emerald-600/30 transition-transform hover:scale-105">
                                            <div className="bg-[#34d399] text-emerald-900 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-inner border border-emerald-300 shrink-0">
                                                2
                                            </div>
                                            <div className="font-black text-gray-900 text-base md:text-lg truncate pt-0.5">
                                                {leaderboard[1].nickname}
                                            </div>
                                            <div className="ml-auto font-black text-gray-900 text-lg md:text-xl pr-2 tracking-tighter tabular-nums flex items-center pt-0.5">
                                                {leaderboard[1].score}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-[200px] max-w-[300px]">
                                    {leaderboard[2] && (
                                        <div className="w-full h-full bg-[#d4d4d8] rounded-full flex items-center gap-2 p-1.5 md:p-2 shadow-[0_4px_0_rgba(161,161,170,1)] border-[3px] border-gray-400/30 transition-transform hover:scale-105">
                                            <div className="bg-[#f4f4f5] text-gray-600 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-inner border border-white shrink-0">
                                                3
                                            </div>
                                            <div className="font-black text-gray-900 text-base md:text-lg truncate pt-0.5">
                                                {leaderboard[2].nickname}
                                            </div>
                                            <div className="ml-auto font-black text-gray-900 text-lg md:text-xl pr-2 tracking-tighter tabular-nums flex items-center gap-1 pt-0.5">
                                                {leaderboard[2].score}
                                                <span className="text-base shrink-0 -mt-0.5 opacity-60">🔥</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full sm:w-auto flex-1 min-w-[200px] max-w-[300px]">
                                    {leaderboard[3] && (
                                        <div className="w-full h-full bg-[#d97736] rounded-full flex items-center gap-2 p-1.5 md:p-2 shadow-[0_4px_0_rgba(184,81,1,1)] border-[3px] border-orange-700/30 transition-transform hover:scale-105">
                                            <div className="bg-[#f09c62] text-orange-950 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-inner border border-orange-300 shrink-0">
                                                4
                                            </div>
                                            <div className="font-black text-gray-900 text-base md:text-lg truncate pt-0.5">
                                                {leaderboard[3].nickname}
                                            </div>
                                            <div className="ml-auto font-black text-gray-900 text-lg md:text-xl pr-2 tracking-tighter tabular-nums flex items-center gap-1 pt-0.5">
                                                {leaderboard[3].score}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tier 3: White Outline Ranks */}
                            <div className="w-full flex gap-3 md:gap-5 justify-center mt-[-8px] md:mt-[-12px] z-10 flex-wrap">
                                {leaderboard.slice(4, 6).map((player: any, i: number) => {
                                    const rank = i + 5;
                                    return (
                                        <div key={rank} className="flex-1 min-w-[200px] max-w-[300px] h-[52px] md:h-[60px] bg-white rounded-full flex items-center pr-3 md:pr-4 pl-1.5 md:pl-2 shadow-[0_3px_0_rgba(0,0,0,0.08)] border-[3px] border-gray-100 transition-transform hover:scale-105">
                                            <div className="text-black w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-lg md:text-xl shrink-0">
                                                {rank}
                                            </div>
                                            <div className="ml-1 font-black text-gray-900 text-sm md:text-base truncate pt-0.5">
                                                {player.nickname}
                                            </div>
                                            <div className="ml-auto font-black text-gray-900 text-base md:text-lg tracking-tighter tabular-nums flex items-center gap-1 pt-0.5">
                                                {player.score}
                                                {highStreaks.find((s: any) => s.nickname === player.nickname && s.streak > 2) && (
                                                    <span className="text-sm shrink-0">🔥</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Biggest climber info bar */}
                            {highStreaks.length > 0 && (
                                <div className="w-full max-w-[95%] sm:max-w-3xl bg-[#e0f2fe] border-[3px] border-[#7dd3fc] rounded-2xl flex items-center justify-between mt-4 md:mt-6 px-4 py-2.5 md:py-3.5 shadow-sm">
                                    <div className="font-black text-[#0ea5e9] text-xs md:text-sm lg:text-base px-2">
                                        Top Streaks: <span className="text-gray-900 ml-1">{highStreaks.slice(0, 3).map((s: any) => `${s.nickname} (🔥${s.streak})`).join(', ')}</span>
                                    </div>
                                    <div className="bg-[#38bdf8] p-1.5 rounded-full text-white shrink-0 shadow-[0_2px_0_rgba(2,132,199,1)]">
                                        <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Spacing */}
                    <div className="h-6 lg:h-10 shrink-0 w-full" />
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

        const confettiPieces = [
            { top: '10%', left: '8%', color: 'bg-red-500', rotate: 'rotate-[45deg]', delay: 'delay-0' },
            { top: '20%', left: '15%', color: 'bg-green-500', rotate: '-rotate-[30deg]', delay: 'delay-75' },
            { top: '15%', left: '85%', color: 'bg-yellow-500', rotate: 'rotate-[60deg]', delay: 'delay-150' },
            { top: '35%', left: '92%', color: 'bg-blue-500', rotate: '-rotate-[15deg]', delay: 'delay-300' },
            { top: '70%', left: '10%', color: 'bg-yellow-500', rotate: 'rotate-[20deg]', delay: 'delay-200' },
            { top: '80%', left: '18%', color: 'bg-blue-500', rotate: '-rotate-[45deg]', delay: 'delay-500' },
            { top: '75%', left: '88%', color: 'bg-red-500', rotate: 'rotate-[30deg]', delay: 'delay-700' },
            { top: '60%', left: '92%', color: 'bg-green-500', rotate: '-rotate-[60deg]', delay: 'delay-1000' },
            { top: '45%', left: '5%', color: 'bg-orange-500', rotate: 'rotate-[80deg]', delay: 'delay-300' },
            { top: '25%', left: '75%', color: 'bg-sky-500', rotate: '-rotate-[80deg]', delay: 'delay-150' },
            // Small squares
            { top: '55%', left: '12%', color: 'bg-pink-500', rotate: 'rotate-[15deg]', delay: 'delay-200', size: 'w-3 h-3' },
            { top: '40%', left: '85%', color: 'bg-purple-500', rotate: '-rotate-[25deg]', delay: 'delay-500', size: 'w-3 h-3' },
        ];

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

                {/* Main Non-Scrollable Area with Header */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-start p-2 md:p-4 pt-4 md:pt-6 overflow-hidden">

                    {/* Header Row Container */}
                    <div className="w-full max-w-5xl flex flex-row items-center justify-start gap-1 md:gap-2 mb-2 md:mb-4 z-50 shrink-0 relative">
                        {/* Logo - Static and scaled */}
                        <HeaderLogo />

                        {/* Top Bar - Right next to Logo */}
                        <div className="flex-1 w-full bg-white rounded-[24px] shadow-[0_5px_0_rgba(0,0,0,0.12)] border-[3px] border-black/5 p-1.5 md:p-2 flex items-center justify-between pointer-events-auto z-40">
                            {/* Left: Final Standings text */}
                            <div className="flex items-center">
                                <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded-[14px] border-[2px] border-gray-100 shadow-sm">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs md:text-sm font-black text-gray-700 tracking-tight">Final Standings</span>
                                </div>
                            </div>

                            {/* Center: Title */}
                            <div className="flex-1 text-center px-3 flex flex-col items-center justify-center">
                                <h1 className="text-base lg:text-xl font-black text-black leading-tight drop-shadow-sm max-w-[320px] break-words">
                                    {quiz?.title || 'Quiz Session'}
                                </h1>
                            </div>

                            {/* Right: Exit Button */}
                            <div className="flex items-center">
                                <button
                                    onClick={handleEndGame}
                                    className="px-5 md:px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm md:text-base border-[3px] border-black shadow-[0_4px_0_rgba(153,27,27,1)] hover:translate-y-[1px] hover:shadow-[0_2px_0_rgba(153,27,27,1)] active:translate-y-[4px] active:shadow-none whitespace-nowrap"
                                >
                                    Exit Game
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col items-center border-b-[6px] md:border-b-[8px] border-black/5 shrink relative z-40 min-h-0 flex-1 max-h-[85vh]">

                        {/* Title Area */}
                        <div className="w-full flex-none flex flex-col items-center justify-center relative pt-4 md:pt-6 mb-4 md:mb-6">
                            {/* Confetti Background */}
                            {confettiPieces.map((confetti, i) => (
                                <div
                                    key={i}
                                    className={`absolute rounded-sm ${confetti.color} ${confetti.rotate} animate-pulse ${confetti.delay} ${confetti.size || 'w-2 md:w-3 max-w-[12px] h-4 md:h-6 max-h-[24px]'}`}
                                    style={{ top: confetti.top, left: confetti.left }}
                                />
                            ))}

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-normal w-full text-center relative z-10 flex items-center justify-center gap-2 md:gap-4 select-none drop-shadow-sm"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                <span className="text-3xl md:text-4xl lg:text-5xl animate-bounce">🎉</span>
                                Quiz Complete!
                                <span className="text-3xl md:text-4xl lg:text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
                            </h2>
                        </div>

                        {/* Podium Container - 3D CSS Blocks */}
                        <div className="flex items-end justify-center w-full max-w-3xl relative z-10 mx-auto mt-auto px-4 md:px-8">

                            {/* 2nd Place (Silver) */}
                            <div className="flex flex-col items-center z-20 w-[110px] sm:w-[130px] md:w-[180px] relative">
                                <div className="text-center w-full z-40 absolute bottom-full pb-[35px] md:pb-[45px]">
                                    <div className="text-sm md:text-xl font-black text-black leading-tight truncate w-full px-1">
                                        {second?.nickname || '---'}
                                    </div>
                                    <div className="text-xs md:text-lg font-bold text-gray-700 mt-1">
                                        {second ? `${(second.score || 0).toLocaleString()}` : '0'} 🔥
                                    </div>
                                </div>
                                <div className="relative w-full">
                                    <div className="absolute bottom-full left-0 w-full h-[30px] md:h-[40px] border-[3px] md:border-[4px] border-black border-b-0 bg-[#cbd5e1] origin-bottom-left -skew-x-[45deg]" />
                                    <div className="absolute top-0 right-0 translate-x-full w-[30px] md:w-[40px] h-full border-[3px] md:border-[4px] border-black border-l-0 bg-[#64748b] origin-top-left -skew-y-[45deg]" />
                                    <div className="relative z-10 w-full h-[120px] md:h-[180px] border-[3px] md:border-[4px] border-black bg-[#94a3b8] flex items-center justify-center">
                                        <span className="text-4xl md:text-7xl text-[#cbd5e1] drop-shadow-sm" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '2px black' }}>2</span>
                                    </div>
                                </div>
                            </div>

                            {/* 1st Place (Gold) */}
                            <div className="flex flex-col items-center z-30 w-[130px] sm:w-[160px] md:w-[220px] relative -mx-2 md:-mx-4">
                                <div className="text-center w-full z-40 absolute bottom-full pb-[35px] md:pb-[45px]">
                                    <div className="text-base md:text-3xl font-black text-black leading-tight truncate w-full px-1">
                                        {first?.nickname || '---'}
                                    </div>
                                    <div className="text-sm md:text-xl font-bold text-gray-700 mt-1">
                                        {first ? `${(first.score || 0).toLocaleString()}` : '0'} 🔥
                                    </div>
                                </div>
                                <div className="relative w-full">
                                    <div className="absolute bottom-full left-0 w-full h-[30px] md:h-[40px] border-[3px] md:border-[4px] border-black border-b-0 bg-[#fde047] origin-bottom-left -skew-x-[45deg]" />
                                    <div className="absolute top-0 right-0 translate-x-full w-[30px] md:w-[40px] h-full border-[3px] md:border-[4px] border-black border-l-0 bg-[#ca8a04] origin-top-left -skew-y-[45deg]" />
                                    <div className="relative z-10 w-full h-[180px] md:h-[260px] border-[3px] md:border-[4px] border-black bg-[#eab308] flex items-center justify-center">
                                        <span className="text-6xl md:text-9xl text-[#fde047] drop-shadow-sm" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '3px black' }}>1</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3rd Place (Bronze) */}
                            <div className="flex flex-col items-center z-10 w-[110px] sm:w-[130px] md:w-[180px] relative -ml-1 md:-ml-2">
                                <div className="text-center w-full z-40 absolute bottom-full pb-[35px] md:pb-[45px]">
                                    <div className="text-sm md:text-xl font-black text-black leading-tight truncate w-full px-1">
                                        {third?.nickname || '---'}
                                    </div>
                                    <div className="text-xs md:text-lg font-bold text-gray-700 mt-1">
                                        {third ? `${(third.score || 0).toLocaleString()}` : '0'} 🔥
                                    </div>
                                </div>
                                <div className="relative w-full">
                                    <div className="absolute bottom-full left-0 w-full h-[30px] md:h-[40px] border-[3px] md:border-[4px] border-black border-b-0 bg-[#fdba74] origin-bottom-left -skew-x-[45deg]" />
                                    <div className="absolute top-0 right-0 translate-x-full w-[30px] md:w-[40px] h-full border-[3px] md:border-[4px] border-black border-l-0 bg-[#c2410c] origin-top-left -skew-y-[45deg]" />
                                    <div className="relative z-10 w-full h-[90px] md:h-[130px] border-[3px] md:border-[4px] border-black bg-[#ea580c] flex items-center justify-center">
                                        <span className="text-4xl md:text-7xl text-[#fdba74] drop-shadow-sm" style={{ fontFamily: "'Titan One', sans-serif", WebkitTextStroke: '2px black' }}>3</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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