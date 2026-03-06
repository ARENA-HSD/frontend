/**
 * HSD Arena - Live Question Component
 * 
 * Display question for Stage Mode (large screen)
 */

import type { Question } from '@/types';
import ImagePlaceholder from '../shared/ImagePlaceholder';

interface LiveQuestionProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
}

const LiveQuestion = ({ question, questionNumber, totalQuestions }: LiveQuestionProps) => {
    const answerLabels = ['A', 'B', 'C', 'D'];

    return (
        <div className="bg-card rounded-2xl p-8 shadow-2xl">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-semibold text-tertiary">
                    Question {questionNumber} of {totalQuestions}
                </div>
            </div>

            {/* Image */}
            {question.imageAlt && (
                <ImagePlaceholder
                    alt={question.imageAlt}
                    className="w-full h-64 rounded-lg mb-6"
                />
            )}

            {/* Question Text */}
            <h2 className="text-4xl font-bold text-primary mb-8 text-center">
                {question.text}
            </h2>

            {/* Answers Grid */}
            <div className="grid grid-cols-2 gap-4">
                {question.answers.map((answer, idx) => (
                    <div
                        key={answer.id}
                        className="bg-role-primary text-inverse p-6 rounded-xl flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl font-bold">
                            {answerLabels[idx]}
                        </div>
                        <div className="text-xl font-semibold">
                            {answer.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveQuestion;
