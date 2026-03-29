/**
 * HSD Arena - Quiz Live Page (Host) — Orchestrator
 *
 * Pure rendering orchestrator that delegates all state management
 * to useGameController and renders the appropriate phase component.
 *
 * Phases: lobby → question → results → leaderboard → finished
 */

import { useGameController } from '@/hooks/useGameController';
import { SEO } from '@/components';
import Lobby from '@/components/quiz/manager/game/Lobby';
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

    // ========================================
    // Phase Rendering
    // ========================================
    switch (state.phase) {
        case 'lobby':
            return (
                <Lobby
                    quiz={state.quiz}
                    gamePin={state.gamePin}
                    participantCount={state.participantCount}
                    recentPlayers={state.recentPlayers}
                    isStarting={state.isStarting}
                    lobbyPhase={state.lobbyPhase}
                    countdown={state.countdown}
                    copied={state.copied}
                    winHeight={state.winHeight}
                    joinUrl={state.joinUrl}
                    handleStartGame={actions.handleStartGame}
                    handleKickPlayer={actions.handleKickPlayer}
                    copyToClipboard={actions.copyToClipboard}
                />
            );

        case 'question':
            return (
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
            );

        case 'results':
            return (
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
            );

        case 'leaderboard':
            return (
                <Leaderboard
                    quiz={state.quiz}
                    leaderboard={state.leaderboard}
                    highStreaks={state.highStreaks}
                    questionIndex={state.questionIndex}
                    questions={state.questions}
                    connectionToasts={state.connectionToasts}
                    handleNextQuestion={actions.handleNextQuestion}
                />
            );

        case 'finished':
            return (
                <Finished
                    quiz={state.quiz}
                    leaderboard={state.leaderboard}
                    connectionToasts={state.connectionToasts}
                    handleEndGame={actions.handleEndGame}
                />
            );

        default:
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-tertiary">Loading game...</div>
                </div>
            );
    }
};

export default QuizLivePage;