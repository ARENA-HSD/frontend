/**
 * HSD Arena - Quiz Live Page (Host)
 * 
 * Full game loop using WebSocket events:
 * GAME_STARTING → QUESTION_START → QUESTION_END → LEADERBOARD_RESULT → NEXT_QUESTION → loop
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Users, Check, TrendingUp, Crown } from 'lucide-react';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { gameSocket, WS_EVENTS } from '@/services/websocket.service';
import { quizService, questionService } from '@/services';
import type {
    Quiz, Question,
    GameStartingPlayload,
    QuestionEndHostPlayload,
    QuestionStartPlayload,
    LeaderboardResultHostPlayload,
    GameOverPlayload,
    LeaderboardEntry,
    QuestionOption
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

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ========================================
    // Boot: start timer for initial question forwarded from lobby
    // ========================================
    useEffect(() => {
        if (initialQuestion) {
            startTimer(initialQuestion.time, initialQuestion.serverTime);
        }
    }, []); // run once on mount

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
                navigate(`/manager/quizzes/${quizId}/results`, {
                    state: {
                        quiz: quiz,
                        podium: payload.finalScores,
                    }
                });
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
        gameSocket.disconnect();
        navigate(`/manager/quizzes/${quizId}`);
    };

    // ========================================
    // Loading & Error
    // ========================================
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
                <div className="text-white text-2xl font-bold animate-pulse">Loading quiz...</div>
            </div>
        );
    }

    if ((!quiz || questions.length === 0) && !isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 text-xl">Quiz not found or has no questions</div>
            </div>
        );
    }

    // ========================================
    // PHASE: Live Question
    // ========================================
    if (phase === 'question') {
        return (
            <div className="h-screen flex flex-col">
                {/* Top Bar */}
                <div className="bg-white px-6 py-3 flex items-center justify-between shadow-sm">
                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200">
                        Manage Participants
                    </button>
                    <div className="font-semibold text-gray-900">{quiz?.title}</div>
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-600 flex items-center justify-center font-bold text-indigo-600">
                        {timeLeft}
                    </div>
                </div>

                {/* Question Content */}
                <div className="flex-1 flex items-center justify-center p-12">
                    <div className="max-w-5xl w-full">
                        <div className="mb-12">
                            {questionMedia && (
                                <div className="w-full h-96 bg-gray-200 rounded-2xl shadow-xl mb-8 flex items-center justify-center overflow-hidden">
                                    <img src={questionMedia} alt="Question" className="max-h-full max-w-full object-contain" />
                                </div>
                            )}
                            <div className="text-5xl font-bold text-gray-900 text-center">
                                {questionText}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {(options || []).map((option, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border-4 border-gray-200 hover:border-indigo-400 transition-colors">
                                    <div className="text-3xl font-bold text-gray-900 text-center">{option.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
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
            <div className="h-screen flex flex-col">
                {/* Top Bar */}
                <div className="bg-white px-6 py-3 flex items-center justify-between shadow-sm">
                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded font-medium">
                        Manage Participants
                    </button>
                    <div className="font-semibold text-gray-900">{quiz?.title}</div>
                    <button
                        onClick={handleShowLeaderboard}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                        Leaderboard
                    </button>
                </div>

                <div className="flex-1 p-12">
                    <div className="max-w-5xl mx-auto">
                        {/* Bar Chart */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
                            <div className="h-64 flex items-end justify-around gap-4">
                                {options.map((option, idx: number) => {
                                    const count = Number(answerStats[String(idx)] || 0);
                                    const isCorrect = idx === correctOptionIndex;
                                    const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center">
                                            <div
                                                className={`w-full rounded-t-lg transition-all duration-500 ${isCorrect ? 'bg-green-500' : 'bg-gray-300'}`}
                                                style={{ height: `${Math.max(heightPercent, 8)}%` }}
                                            >
                                                <div className="text-white font-bold text-2xl pt-2 text-center">{count}</div>
                                            </div>
                                            <div className="mt-2 text-gray-700 font-medium">{idx}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Question text */}
                        <div className="text-2xl font-bold text-gray-900 text-center mb-6">
                            {questionText}
                        </div>

                        {/* Answer grid with correct highlighted */}
                        <div className="grid grid-cols-2 gap-6">
                            {options.map((option, idx: number) => {
                                const isCorrect = idx === correctOptionIndex;
                                return (
                                    <div
                                        key={idx}
                                        className={`p-8 rounded-2xl shadow-lg border-4 ${isCorrect
                                            ? 'bg-green-50 border-green-500 shadow-green-200'
                                            : 'bg-gray-100 border-gray-300 opacity-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-bold text-gray-900">{option.text}</div>
                                            {isCorrect && <Check className="w-8 h-8 text-green-600" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
            <div className="h-screen flex flex-col">
                {/* Top Bar */}
                <div className="bg-white px-6 py-3 flex items-center justify-between shadow-sm">
                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded font-medium">
                        Manage Participants
                    </button>
                    <div className="font-semibold text-gray-900">{quiz?.title}</div>
                    <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                        {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                    </button>
                </div>

                <div className="flex-1 p-12 overflow-auto">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">Leaderboard</h2>

                        <div className="space-y-4 mb-8">
                            {leaderboard.map((player, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-4 p-6 rounded-xl shadow-lg ${idx === 0
                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                        : idx === 1
                                            ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                                            : idx === 2
                                                ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                                                : 'bg-white'
                                        }`}
                                >
                                    <div className={`text-3xl font-black ${idx < 3 ? 'text-white' : 'text-gray-900'} w-12`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-xl font-bold ${idx < 3 ? 'text-white' : 'text-gray-900'}`}>
                                            {player.nickname}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`text-2xl font-bold ${idx < 3 ? 'text-white' : 'text-gray-900'}`}>
                                            {player.score.toLocaleString()}
                                        </div>
                                        {highStreaks.find(s => s.nickname === player.nickname && s.streak >= 3) && (
                                            <div className="text-2xl">
                                                🔥
                                                {(highStreaks.find(s => s.nickname === player.nickname)?.streak || 0) >= 7 && (
                                                    <span className="text-3xl">🔥</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {leaderboard.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    No leaderboard data available
                                </div>
                            )}
                        </div>

                        {highStreaks.length > 0 && (
                            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-6">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-indigo-900 mb-1">Top Streaks</div>
                                        <div className="text-lg font-bold text-indigo-700">
                                            {highStreaks.slice(0, 3).map(s => `${s.nickname} (🔥${s.streak})`).join(', ')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
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
            <div className="h-screen flex flex-col bg-gradient-to-br from-purple-100 to-indigo-100">
                <div className="bg-white px-6 py-3 flex items-center justify-center shadow-sm relative">
                    <div className="font-semibold text-gray-900 text-xl">{quiz?.title} - Quiz Complete</div>
                    <button
                        onClick={handleEndGame}
                        className="absolute right-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                    >
                        Exit
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-12">
                    <div className="text-center">
                        <div className="text-5xl font-black text-gray-900 mb-12">🎉 Quiz Complete! 🎉</div>

                        <div className="flex items-end justify-center gap-8 mb-12">
                            {/* 2nd Place */}
                            <div className="text-center">
                                <div className="w-32 h-40 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-2xl flex items-center justify-center shadow-xl mb-3">
                                    <div className="text-white">
                                        <div className="text-4xl font-black mb-1">2</div>
                                        <div className="text-sm font-semibold">Silver</div>
                                    </div>
                                </div>
                                <div className="text-xl font-bold text-gray-900">{second?.nickname || '-'}</div>
                                <div className="text-lg text-gray-600">{second ? `${second.score.toLocaleString()} pts` : ''}</div>
                            </div>

                            {/* 1st Place */}
                            <div className="text-center">
                                <div className="w-40 h-56 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-t-2xl flex items-center justify-center shadow-2xl mb-3">
                                    <div className="text-white">
                                        <Crown className="w-12 h-12 mx-auto mb-2" />
                                        <div className="text-5xl font-black mb-1">1</div>
                                        <div className="text-sm font-semibold">Gold</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-gray-900">{first?.nickname || '-'}</div>
                                <div className="text-xl text-gray-600">{first ? `${first.score.toLocaleString()} pts` : ''}</div>
                            </div>

                            {/* 3rd Place */}
                            <div className="text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-500 rounded-t-2xl flex items-center justify-center shadow-xl mb-3">
                                    <div className="text-white">
                                        <div className="text-4xl font-black mb-1">3</div>
                                        <div className="text-sm font-semibold">Bronze</div>
                                    </div>
                                </div>
                                <div className="text-xl font-bold text-gray-900">{third?.nickname || '-'}</div>
                                <div className="text-lg text-gray-600">{third ? `${third.score.toLocaleString()} pts` : ''}</div>
                            </div>
                        </div>

                        <div className="text-2xl font-semibold text-gray-700">
                            Thank you for participating! 🎓
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-gray-500">Loading game...</div>
        </div>
    );
};

export default QuizLivePage;