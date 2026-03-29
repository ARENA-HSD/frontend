/**
 * HSD Arena - Participant Game Page (Orchestrator)
 *
 * Single page managing all game states for the participant.
 * Uses useParticipantGameController hook for state + WS logic.
 * Renders the appropriate phase component based on current game status.
 *
 * Phase flow:
 *   lobby → waiting → question ↔ answered → result → leaderboard → loop → game over (→ /play/results)
 */

import { useParticipantGameController } from '@/hooks/useParticipantGameController';
import { SEO } from '@/components';
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import Lobby from '@/components/quiz/participant/game/Lobby';
import Waiting from '@/components/quiz/participant/game/Waiting';
import QuestionPersonal from '@/components/quiz/participant/game/QuestionPersonal';
import QuestionStage from '@/components/quiz/participant/game/QuestionStage';
import Result from '@/components/quiz/participant/game/Result';
import LeaderboardPersonal from '@/components/quiz/participant/game/LeaderboardPersonal';
import LeaderboardStage from '@/components/quiz/participant/game/LeaderboardStage';

const ParticipantGamePage = () => {
    const { state, actions } = useParticipantGameController();

    return (
        <>
            <SEO title="Quiz in Progress" description="Playing a live Quiz Strike session." noIndex />
            <ReconnectOverlay onNavigateToJoin={actions.handleNavigateToJoin} />

            {/* ====== Lobby ====== */}
            {state.phase === 'lobby' && (
                <Lobby
                    nickname={state.nickname}
                    pin={state.pin}
                    lobbyPhase={state.lobbyPhase}
                    countdown={state.countdown}
                    dots={state.dots}
                />
            )}

            {/* ====== Waiting ====== */}
            {state.phase === 'waiting' && (
                <Waiting nickname={state.nickname} />
            )}

            {/* ====== Question / Answered — PERSONAL ====== */}
            {(state.phase === 'question' || state.phase === 'answered') && state.gameMode === 'PERSONAL' && (
                <QuestionPersonal
                    phase={state.phase}
                    questionIndex={state.questionIndex}
                    questionText={state.questionText}
                    questionMedia={state.questionMedia}
                    options={state.options}
                    timeLeft={state.timeLeft}
                    selectedAnswer={state.selectedAnswer}
                    handleSelectAnswer={actions.handleSelectAnswer}
                />
            )}

            {/* ====== Question / Answered — STAGE ====== */}
            {(state.phase === 'question' || state.phase === 'answered') && state.gameMode === 'STAGE' && (
                <QuestionStage
                    phase={state.phase}
                    timeLeft={state.timeLeft}
                    selectedAnswer={state.selectedAnswer}
                    handleSelectAnswer={actions.handleSelectAnswer}
                />
            )}

            {/* ====== Result ====== */}
            {state.phase === 'result' && (
                <Result
                    isCorrect={state.isCorrect}
                    pointsEarned={state.pointsEarned}
                    streak={state.streak}
                />
            )}

            {/* ====== Leaderboard — PERSONAL ====== */}
            {state.phase === 'leaderboard' && state.gameMode === 'PERSONAL' && (
                <LeaderboardPersonal
                    nickname={state.nickname}
                    top5={state.top5}
                    stats={state.stats}
                />
            )}

            {/* ====== Leaderboard — STAGE ====== */}
            {state.phase === 'leaderboard' && state.gameMode === 'STAGE' && (
                <LeaderboardStage stats={state.stats} />
            )}

            {/* ====== Fallback (finished → auto-navigates) ====== */}
            {state.phase === 'finished' && (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
                    <div className="text-white text-xl animate-pulse">Loading results...</div>
                </div>
            )}
        </>
    );
};

export default ParticipantGamePage;