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
        <div className="bg-card rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden h-full">
            <div className="p-6 flex flex-col justify-between h-full">
                <h3 className="font-bold text-lg text-primary mb-2">{quiz.title}</h3>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-tertiary">
                        {quiz.questionCount || 0} questions • {quiz.defaultMode} mode
                    </div>
                    <div className="flex flex-col items-center">
                        <button
                            className="p-1 text-tertiary hover:text-role-primary hover:bg-role-primary-light rounded"
                            onClick={onEdit}
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            className="p-1 text-tertiary hover:text-role-danger hover:bg-role-danger-light rounded"
                            onClick={onDelete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <button
                    onClick={onStart}
                    className="w-full btn-primary py-2.5 rounded-lg font-semibold transition-colors"
                >
                    Start Quiz
                </button>
            </div>
        </div>
    );
};

export default QuizCard;
