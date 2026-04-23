/**
 * HSD Arena - Quiz Live Page (Host) — Orchestrator
 *
 * Pure rendering orchestrator that delegates all state management
 * to useGameController and renders the appropriate phase component.
 *
 * Phases: lobby → countdown → question → results → leaderboard → finished
 */

import { useGameController } from '@/hooks/useGameController';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components';
import Lobby from '@/components/quiz/manager/game/Lobby';
import Countdown from '@/components/quiz/shared/Countdown';
import Incoming from '@/components/quiz/shared/Incoming';
import Question from '@/components/quiz/manager/game/Question';
import Results from '@/components/quiz/manager/game/Results';
import Leaderboard from '@/components/quiz/manager/game/Leaderboard';
import Finished from '@/components/quiz/manager/game/Finished';

const QuizLivePage = () => {
    const { state, actions } = useGameController();

    // ========================================
    // Loading & Error
    // ========================================
    if (state.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
                <SEO title="Live Quiz" description="Hosting a live Quiz Strike session." noIndex />
                <div className="text-inverse text-2xl font-bold animate-pulse">Loading quiz...</div>
            </div>
        );
    }

    if (!state.quiz && !state.isLoading && state.phase !== 'lobby') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-role-danger text-xl">Quiz not found or has no questions</div>
            </div>
        );
    }

    // Key mapping: countdown shares key with lobby, incoming shares key with question
    const animationKey = state.phase === 'countdown' ? 'lobby' : state.phase === 'incoming' ? 'question' : state.phase;

    // ========================================
    // Phase Rendering
    // ========================================
    return (
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
            <AnimatePresence initial={false}>
                <motion.div
                    key={animationKey}
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    style={{ position: 'absolute', inset: 0, width: '100%', minHeight: '100vh' }}>

                    {/* ====== Lobby ====== */}
                    {state.phase === 'lobby' && (
                        <Lobby
                            quiz={state.quiz}
                            gamePin={state.gamePin}
                            participantCount={state.participantCount}
                            recentPlayers={state.recentPlayers}
                            isStarting={state.isStarting}
                            copied={state.copied}
                            winHeight={state.winHeight}
                            joinUrl={state.joinUrl}
                            handleStartGame={actions.handleStartGame}
                            handleKickPlayer={actions.handleKickPlayer}
                            copyToClipboard={actions.copyToClipboard}
                        />
                    )}

                    {/* ====== Countdown ====== */}
                    {state.phase === 'countdown' && (
                        <Countdown countdown={state.countdown} />
                    )}

                    {/* ====== Incoming (next question transition) ====== */}
                    {state.phase === 'incoming' && (
                        <Incoming />
                    )}

                    {/* ====== Question ====== */}
                    {state.phase === 'question' && (
                        <Question
                            quiz={state.quiz}
                            questionIndex={state.questionIndex}
                            questionText={state.questionText}
                            questionMedia={state.questionMedia}
                            options={state.options}
                            answeredCount={state.answeredCount}
                            totalPlayers={state.totalPlayers}
                            time={state.time}
                            timeLeft={state.timeLeft}
                            questions={state.questions}
                            connectionToasts={state.connectionToasts}
                        />
                    )}

                    {/* ====== Results ====== */}
                    {state.phase === 'results' && (
                        <Results
                            quiz={state.quiz}
                            questionText={state.questionText}
                            options={state.options}
                            correctOptionIndex={state.correctOptionIndex}
                            answerStats={state.answerStats}
                            totalPlayers={state.totalPlayers}
                            connectionToasts={state.connectionToasts}
                            handleShowLeaderboard={actions.handleShowLeaderboard}
                        />
                    )}

                    {/* ====== Leaderboard ====== */}
                    {state.phase === 'leaderboard' && (
                        <Leaderboard
                            quiz={state.quiz}
                            leaderboard={state.leaderboard}
                            highStreaks={state.highStreaks}
                            questionIndex={state.questionIndex}
                            questions={state.questions}
                            connectionToasts={state.connectionToasts}
                            handleNextQuestion={actions.handleNextQuestion}
                        />
                    )}

                    {/* ====== Finished ====== */}
                    {state.phase === 'finished' && (
                        <Finished
                            quiz={state.quiz}
                            leaderboard={state.leaderboard}
                            connectionToasts={state.connectionToasts}
                            handleEndGame={actions.handleEndGame}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default QuizLivePage;