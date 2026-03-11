/**
 * HSD Arena - Question Editor Component
 * 
 * Create/Edit question with text, options, timeLimit, points
 */

import { useState } from 'react';
import type { Question, CreateQuestionData, UpdateQuestionData, QuestionOption } from '@/types';
import ImagePlaceholder from '@/components/quiz/shared/ImagePlaceholder';
import { Button } from '@/components/ui';

interface QuestionEditorProps {
    question?: Question;
    totalQuestions?: number;
    onCreate?: (data: CreateQuestionData) => Promise<void>;
    onUpdate?: (data: UpdateQuestionData) => Promise<void>;
    onCancel: () => void;
}

const OPTION_COLORS = ['bg-role-success', 'bg-[#FF4F81]', 'bg-[#9C4BFF]', 'bg-[#FF8A00]'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const QuestionEditor = ({ question, totalQuestions = 0, onCreate, onUpdate, onCancel }: QuestionEditorProps) => {
    const [questionText, setQuestionText] = useState(question?.text || '');
    const [mediaUrl, setMediaUrl] = useState(question?.mediaUrl || '');
    const [timeLimit, setTimeLimit] = useState(question?.timeLimit || 30);
    const [points, setPoints] = useState(question?.points || 1000);
    const [options, setOptions] = useState<QuestionOption[]>(
        question?.options || [{ text: '', color: 'red' }, { text: '', color: 'blue' }, { text: '', color: 'green' }, { text: '', color: 'yellow' }]
    );
    const [correctIndex, setCorrectIndex] = useState(question?.correctIndex ?? 0);
    const [isSaving, setIsSaving] = useState(false);

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index] = { text, color: options[index].color };
        setOptions(newOptions);
        options.forEach((option, idx) => {
            console.log(idx + ' ' + option.text);
        });
    };

    const handleSave = async () => {
        if (!questionText.trim()) {
            alert('Please enter a question');
            return;
        }

        if (options.some(o => !o.text.trim())) {
            alert('Please fill all options');
            return;
        }

        try {
            setIsSaving(true);

            if (question && onUpdate) {
                await onUpdate({
                    text: questionText,
                    mediaUrl: mediaUrl || undefined,
                    timeLimit,
                    points,
                    options,
                    correctIndex,
                });
            } else if (onCreate) {
                await onCreate({
                    text: questionText,
                    mediaUrl: mediaUrl || undefined,
                    timeLimit,
                    points,
                    options,
                    correctIndex,
                    orderIndex: question?.orderIndex ?? totalQuestions,
                });
            }
        } catch (error) {
            console.error('Failed to save question:', error);
            alert('Failed to save question');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full">
            {/* Top Row: Image & Text */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Image Section */}
                <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                    <div className="w-48 h-48 rounded-3xl overflow-hidden bg-card border-4 border-light shadow-sm flex items-center justify-center relative">
                        <ImagePlaceholder
                            alt={mediaUrl || 'Question Image'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Media URL Input & Question Text */}
                <div className="flex-1 flex flex-col pt-2">
                    <div className="mb-6">
                        <label className="text-lg font-bold text-primary block mb-3">
                            Question Image
                        </label>
                        <input
                            type="text"
                            placeholder="Media URL (optional)"
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                            className="w-full px-6 py-4 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-3xl outline-none transition-colors text-primary font-medium text-lg placeholder:text-tertiary shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="text-lg font-bold text-primary block mb-3">
                            Question Text <span className="text-role-danger">*</span>
                        </label>
                        <textarea
                            className="w-full h-32 px-6 py-4 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-3xl outline-none transition-colors text-primary font-medium text-lg placeholder:text-tertiary shadow-sm resize-none"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Enter your question here..."
                        />
                    </div>
                </div>
            </div>

            {/* Settings Row */}
            <div className="flex flex-col md:flex-row gap-8 mb-10 items-end">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-lg font-bold text-primary">
                            Time Limit (seconds)
                        </label>
                        <span className="text-xl font-bold text-primary">
                            {timeLimit}s
                        </span>
                    </div>
                    <div className="h-16 flex items-center">
                        <input
                            type="range"
                            min="10"
                            max="120"
                            step="5"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                            className="w-full h-2 bg-transparent cursor-pointer accent-[var(--btn-primary-bg)] transition-colors"
                        />
                    </div>
                </div>
                <div className="w-full md:w-64 shrink-0">
                    <label className="text-lg font-bold text-primary block mb-3">
                        Points
                    </label>
                    <input
                        type="number"
                        min="100"
                        step="100"
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value) || 100)}
                        className="w-full px-6 py-4 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-2xl outline-none transition-colors text-primary font-bold text-xl shadow-sm"
                    />
                </div>
            </div>

            {/* Options */}
            <div className="mb-10">
                <label className="text-lg font-bold text-primary block mb-4">
                    Options (select the correct one)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {options.map((option, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCorrectIndex(idx)}
                            className={`relative flex items-center p-4 rounded-3xl cursor-pointer transition-all shadow-md group border-[3px]
                                ${correctIndex === idx ? 'border-transparent scale-[1.02]' : 'border-transparent hover:scale-[1.02] hover:shadow-lg opacity-80'}
                                ${OPTION_COLORS[idx]}
                            `}
                        >
                            <span className="text-white font-black text-3xl shrink-0 drop-shadow-sm ml-2 mr-4">
                                {OPTION_LABELS[idx]}
                            </span>
                            <input
                                type="text"
                                value={option.text}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder={`Option ${OPTION_LABELS[idx]}`}
                                className="flex-1 text-xl font-bold text-white border-none focus:outline-none bg-transparent placeholder:text-white/60 min-w-0"
                            />
                            {correctIndex === idx && (
                                <div className="absolute -top-3 -right-3 bg-white text-role-success rounded-full p-1 shadow-lg border-2 border-role-success transform rotate-12">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-12 pb-8">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="primary"
                    className="rounded-full px-12 py-4 text-xl font-bold hover:-translate-y-1 transition-transform whitespace-nowrap shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_50%)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                    onClick={onCancel}
                    disabled={isSaving}
                    variant="outline"
                    className="rounded-full px-8 py-4 text-xl font-bold bg-page text-secondary shadow-sm hover:text-primary transition-colors"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default QuestionEditor;
