import { useState } from 'react';
import { OPTION_COLORS, OPTION_LABELS } from './participantConstants';
import type { GameStatus } from '@/hooks/useParticipantGameController';

interface QuestionPersonalProps {
    phase: GameStatus;
    questionType: string;
    questionIndex: number;
    questionText: string;
    questionMedia: string;
    options: Array<{ text: string; color: string }>;
    rangeMin?: number;
    rangeMax?: number;
    timeLeft: number;
    selectedAnswer: number;
    selectedAnswerIndices: number[];
    orderedIndices: number[];
    rangeValue?: number;
    handleSelectAnswer: (idx: number) => void;
    handleToggleMultiSelect: (idx: number) => void;
    handleSubmitMultiSelect: () => void;
    handleChangeOrdering: (newOrder: number[]) => void;
    handleSubmitOrdering: () => void;
    handleChangeRange: (val: number) => void;
    handleSubmitRange: () => void;
}

const QuestionPersonal = ({
    phase,
    questionType,
    questionIndex,
    questionText,
    questionMedia,
    options,
    rangeMin = 0,
    rangeMax = 100,
    timeLeft,
    selectedAnswer,
    selectedAnswerIndices,
    orderedIndices,
    rangeValue,
    handleSelectAnswer,
    handleToggleMultiSelect,
    handleSubmitMultiSelect,
    handleChangeOrdering,
    handleSubmitOrdering,
    handleChangeRange,
    handleSubmitRange,
}: QuestionPersonalProps) => {
    // Helper to move item up/down for ORDERING
    const moveOrdering = (idx: number, direction: 'up' | 'down') => {
        if (phase === 'answered') return;
        const newOrder = [...orderedIndices];
        const pos = newOrder.indexOf(idx);
        if (pos === -1) return;
        if (direction === 'up' && pos > 0) {
            [newOrder[pos], newOrder[pos - 1]] = [newOrder[pos - 1], newOrder[pos]];
            handleChangeOrdering(newOrder);
        } else if (direction === 'down' && pos < newOrder.length - 1) {
            [newOrder[pos], newOrder[pos + 1]] = [newOrder[pos + 1], newOrder[pos]];
            handleChangeOrdering(newOrder);
        }
    };

    return (
        <div className={'min-h-screen flex flex-col items-center p-4 bg-cover bg-center bg-[url(../assets/images/leaderboard.png)]'}
            style={{ fontFamily: '"Fredoka", sans-serif' }}>
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

            {/* Options Area */}
            <div className="flex-1 w-full max-w-md flex flex-col gap-3">
                {(questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE') && (
                    <div className="grid grid-cols-1 gap-3">
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
                                    {questionType === 'MULTIPLE_CHOICE' && <span className="mr-2">{OPTION_LABELS[idx]}.</span>}
                                    {option.text}
                                </button>
                            );
                        })}
                    </div>
                )}

                {questionType === 'MULTI_SELECT' && (
                    <div className="flex flex-col gap-3 h-full pb-20">
                        <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto">
                            {options.map((option, idx) => {
                                const color = OPTION_COLORS[idx] || OPTION_COLORS[0];
                                const isSelected = selectedAnswerIndices.includes(idx);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleToggleMultiSelect(idx)}
                                        disabled={phase === 'answered'}
                                        className={`relative w-full p-4 rounded-xl font-bold text-white text-lg transition-all border-b-[6px] border-black/15 shadow-lg disabled:opacity-100 ${color.bg} ${phase === 'answered'
                                            ? isSelected ? 'ring-4 ring-white scale-[1.03]' : 'grayscale-[40%] brightness-75'
                                            : `${color.hover} active:scale-95 active:border-b-[2px] ${isSelected ? 'ring-4 ring-white' : ''}`
                                            }`}
                                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div><span className="mr-2">{OPTION_LABELS[idx]}.</span>{option.text}</div>
                                            {isSelected && (
                                                <div className="bg-white text-black rounded-full p-1">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {phase !== 'answered' && (
                            <button
                                onClick={handleSubmitMultiSelect}
                                disabled={selectedAnswerIndices.length === 0}
                                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white text-purple-700 py-4 rounded-full font-black text-xl shadow-xl border-4 border-purple-200 disabled:opacity-50"
                            >
                                ONAYLA
                            </button>
                        )}
                    </div>
                )}

                {questionType === 'ORDERING' && (
                    <div className="flex flex-col gap-3 h-full pb-20">
                        <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto">
                            {orderedIndices.map((idx, currentPos) => {
                                const option = options[idx];
                                if (!option) return null;
                                const color = OPTION_COLORS[idx] || OPTION_COLORS[0];
                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between w-full p-4 rounded-xl font-bold text-white text-lg transition-all border-b-[6px] border-black/15 shadow-lg ${color.bg} ${phase === 'answered' ? 'grayscale-[20%]' : ''}`}
                                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3 bg-black/30 rounded-full w-8 h-8 flex items-center justify-center">{currentPos + 1}</span>
                                            {option.text}
                                        </div>
                                        {phase !== 'answered' && (
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => moveOrdering(idx, 'up')} disabled={currentPos === 0} className="bg-white/20 hover:bg-white/40 disabled:opacity-30 rounded p-1">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                                                </button>
                                                <button onClick={() => moveOrdering(idx, 'down')} disabled={currentPos === orderedIndices.length - 1} className="bg-white/20 hover:bg-white/40 disabled:opacity-30 rounded p-1">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {phase !== 'answered' && (
                            <button
                                onClick={handleSubmitOrdering}
                                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white text-purple-700 py-4 rounded-full font-black text-xl shadow-xl border-4 border-purple-200"
                            >
                                SIRALAMAYI ONAYLA
                            </button>
                        )}
                    </div>
                )}

                {questionType === 'RANGE' && (
                    <div className="flex flex-col items-center justify-center gap-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                        <div className="text-white text-lg font-bold text-center">Değeri seçin ({rangeMin} - {rangeMax})</div>
                        <input
                            type="range"
                            min={rangeMin}
                            max={rangeMax}
                            value={rangeValue !== undefined ? rangeValue : Math.floor((rangeMin + rangeMax) / 2)}
                            onChange={(e) => handleChangeRange(parseInt(e.target.value))}
                            disabled={phase === 'answered'}
                            className="w-full h-4 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <div className="text-white text-5xl font-black drop-shadow-lg">
                            {rangeValue !== undefined ? rangeValue : Math.floor((rangeMin + rangeMax) / 2)}
                        </div>
                        {phase !== 'answered' && (
                            <button
                                onClick={() => {
                                    if (rangeValue === undefined) handleChangeRange(Math.floor((rangeMin + rangeMax) / 2));
                                    handleSubmitRange();
                                }}
                                className="mt-4 w-full bg-white text-purple-700 py-4 rounded-full font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-transform"
                            >
                                GÖNDER
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Answered feedback */}
            {phase === 'answered' && (
                <div className="mt-4 text-center text-white/50 text-sm animate-pulse">
                    Cevabınız iletildi! Sonuçlar bekleniyor...
                </div>
            )}
        </div>
    );
};

export default QuestionPersonal;
