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
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components';
import ReconnectOverlay from '@/components/ui/ReconnectOverlay';
import Lobby from '@/components/quiz/participant/game/Lobby';
import Countdown from '@/components/quiz/shared/Countdown';
import Incoming from '@/components/quiz/shared/Incoming';
import Waiting from '@/components/quiz/participant/game/Waiting';
import QuestionPersonal from '@/components/quiz/participant/game/QuestionPersonal';
import QuestionStage from '@/components/quiz/participant/game/QuestionStage';
import Result from '@/components/quiz/participant/game/Result';
import LeaderboardPersonal from '@/components/quiz/participant/game/LeaderboardPersonal';
import LeaderboardStage from '@/components/quiz/participant/game/LeaderboardStage';
import Finished from '@/components/quiz/participant/game/Finished';

const ParticipantGamePage = () => {
    const { state, actions } = useParticipantGameController();

    // Key mapping: countdown shares key with lobby, answered/incoming share key with question
    const animationKey = ['answered', 'incoming'].includes(state.phase) ? 'question' : state.phase === 'countdown' ? 'lobby' : state.phase;

    return (
        <>
            <SEO title="Quiz in Progress" description="Playing a live Quiz Strike session." noIndex />
            <ReconnectOverlay onNavigateToJoin={actions.handleNavigateToJoin} />

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
                            nickname={state.nickname}
                            pin={state.pin}
                            dots={state.dots}
                        />
                    )}

                    {/* ====== Countdown ====== */}
                    {state.phase === 'countdown' && (
                        <Countdown countdown={state.countdown} />
                    )}

                    {/* ====== Waiting ====== */}
                    {state.phase === 'waiting' && (
                        <Waiting nickname={state.nickname} />
                    )}

                    {/* ====== Incoming (next question transition) ====== */}
                    {state.phase === 'incoming' && (
                        <Incoming />
                    )}

                    {/* ====== Question / Answered — PERSONAL ====== */}
                    {(state.phase === 'question' || state.phase === 'answered') && state.gameMode === 'PERSONAL' && (
                        <QuestionPersonal
                            phase={state.phase}
                            questionType={state.questionType}
                            questionIndex={state.questionIndex}
                            questionText={state.questionText}
                            questionMedia={state.questionMedia}
                            options={state.options}
                            rangeMin={state.rangeMin}
                            rangeMax={state.rangeMax}
                            timeLeft={state.timeLeft}
                            selectedAnswer={state.selectedAnswer}
                            selectedAnswerIndices={state.selectedAnswerIndices}
                            orderedIndices={state.orderedIndices}
                            rangeValue={state.rangeValue}
                            handleSelectAnswer={actions.handleSelectAnswer}
                            handleToggleMultiSelect={actions.handleToggleMultiSelect}
                            handleSubmitMultiSelect={actions.handleSubmitMultiSelect}
                            handleChangeOrdering={actions.handleChangeOrdering}
                            handleSubmitOrdering={actions.handleSubmitOrdering}
                            handleChangeRange={actions.handleChangeRange}
                            handleSubmitRange={actions.handleSubmitRange}
                        />
                    )}

                    {/* ====== Question / Answered — STAGE ====== */}
                    {(state.phase === 'question' || state.phase === 'answered') && state.gameMode === 'STAGE' && (
                        <QuestionStage
                            phase={state.phase}
                            questionType={state.questionType}
                            optionsCount={state.options?.length}
                            rangeMin={state.rangeMin}
                            rangeMax={state.rangeMax}
                            timeLeft={state.timeLeft}
                            selectedAnswer={state.selectedAnswer}
                            selectedAnswerIndices={state.selectedAnswerIndices}
                            orderedIndices={state.orderedIndices}
                            rangeValue={state.rangeValue}
                            handleSelectAnswer={actions.handleSelectAnswer}
                            handleToggleMultiSelect={actions.handleToggleMultiSelect}
                            handleSubmitMultiSelect={actions.handleSubmitMultiSelect}
                            handleChangeOrdering={actions.handleChangeOrdering}
                            handleSubmitOrdering={actions.handleSubmitOrdering}
                            handleChangeRange={actions.handleChangeRange}
                            handleSubmitRange={actions.handleSubmitRange}
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

                    {/* ====== Finished ====== */}
                    {state.phase === 'finished' && (
                        <Finished
                            nickname={state.nickname}
                            stats={state.stats}
                            gameMode={state.gameMode}
                            podium={state.top5}
                            handleNavigateToJoin={actions.handleNavigateToJoin}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
            </div>
        </>
    );
};

export default ParticipantGamePage;