/**
 * HSD Arena - Quiz Card Component
 * 
 * Card component for displaying quiz in manager dashboard
 */

import { MoreVertical } from 'lucide-react';
import type { Quiz } from '@/types';

interface QuizCardProps {
    quiz: Quiz;
    onStart?: (e: React.MouseEvent) => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

const QuizCard = ({ quiz, onStart, onEdit, onDelete }: QuizCardProps) => {
    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden h-full">
            <div className="p-6 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">{quiz.title}</h3>
                    <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Show menu
                        }}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-sm text-gray-500 mb-6">
                    {quiz.questionCount || 0} questions • {quiz.defaultMode} mode
                </div>
                <button
                    onClick={onStart}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Start Quiz
                </button>
            </div>
        </div>
    );
};

export default QuizCard;
