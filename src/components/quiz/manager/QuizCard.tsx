/**
 * HSD Arena - Quiz Card Component
 * 
 * Card component for displaying quiz in manager dashboard
 */

import { Trash2, Settings } from 'lucide-react';
import type { Quiz } from '@/types';

interface QuizCardProps {
    quiz: Quiz;
    onStart?: (e: React.MouseEvent) => void;
    onEdit?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
}

const QuizCard = ({ quiz, onStart, onEdit, onDelete }: QuizCardProps) => {

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden h-full">
            <div className="p-6 flex flex-col justify-between h-full">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{quiz.title}</h3>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                        {quiz.questionCount || 0} questions • {quiz.defaultMode} mode
                    </div>
                    <div className="flex flex-col items-center">
                        <button
                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            onClick={onEdit}
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            onClick={onDelete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
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
