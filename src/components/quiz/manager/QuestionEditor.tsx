/**
 * HSD Arena - Question Editor Component
 * 
 * Create/Edit question with text, options, timeLimit, points
 */

import { useState } from 'react';
import type { Question, CreateQuestionData, UpdateQuestionData } from '@/types';
import ImagePlaceholder from '@/components/quiz/shared/ImagePlaceholder';

interface QuestionEditorProps {
    question?: Question;
    totalQuestions?: number;
    onCreate?: (data: CreateQuestionData) => Promise<void>;
    onUpdate?: (data: UpdateQuestionData) => Promise<void>;
    onCancel: () => void;
}

const OPTION_COLORS = ['bg-teal-500', 'bg-pink-500', 'bg-purple-500', 'bg-orange-500'];

const QuestionEditor = ({ question, totalQuestions = 0, onCreate, onUpdate, onCancel }: QuestionEditorProps) => {
    const [questionText, setQuestionText] = useState(question?.text || '');
    const [mediaUrl, setMediaUrl] = useState(question?.mediaUrl || '');
    const [timeLimit, setTimeLimit] = useState(question?.timeLimit || 30);
    const [points, setPoints] = useState(question?.points || 1000);
    const [options, setOptions] = useState<string[]>(
        question?.options || ['', '', '', '']
    );
    const [correctIndex, setCorrectIndex] = useState(question?.correctIndex ?? 0);
    const [isSaving, setIsSaving] = useState(false);

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const handleSave = async () => {
        if (!questionText.trim()) {
            alert('Please enter a question');
            return;
        }

        if (options.some(o => !o.trim())) {
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
        <div className="bg-white p-8 rounded-lg shadow-sm">
            {/* Image Placeholder */}
            <div className="mb-6">
                <div className="relative mb-3">
                    <ImagePlaceholder
                        alt={mediaUrl || 'Question Image'}
                        className="w-full h-64 rounded-lg"
                    />
                    <div className="absolute top-3 right-3">
                        <input
                            type="text"
                            placeholder="Media URL (optional)"
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                            className="px-3 py-1.5 bg-white rounded shadow-sm text-sm font-medium border border-gray-300"
                        />
                    </div>
                </div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Text *
                </label>
                <textarea
                    className="w-full border border-gray-300 rounded-lg p-4 text-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter your question here..."
                />
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time Limit (seconds)
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="10"
                            max="120"
                            step="5"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-xl font-bold text-indigo-600 w-16 text-center">
                            {timeLimit}s
                        </span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Points
                    </label>
                    <input
                        type="number"
                        min="100"
                        step="100"
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value) || 100)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Options */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Options (select the correct one)
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {options.map((option, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCorrectIndex(idx)}
                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${correctIndex === idx
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full ${OPTION_COLORS[idx]} flex items-center justify-center text-white font-bold text-sm`}>
                                {String.fromCharCode(65 + idx)}
                            </div>
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                className="flex-1 text-lg border-none focus:outline-none bg-transparent"
                            />
                            {correctIndex === idx && (
                                <span className="text-green-600 font-semibold text-sm">✓ Correct</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8">
                <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
};

export default QuestionEditor;
