/**
 * HSD Arena - Quiz Card Component
 * 
 * Card component for displaying quiz in manager dashboard
 */

import { Trash2, Settings } from 'lucide-react';
import type { Quiz } from '@/types';
import { Button } from '@/components';

interface QuizCardProps {
    quiz: Quiz;
    onStart?: (e: React.MouseEvent) => void;
    onEdit?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
}

const QuizCard = ({ quiz, onStart, onEdit, onDelete }: QuizCardProps) => {

    return (
        <div className="bg-card rounded-[2rem] shadow-lg border border-light hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between h-full p-6">
            <div>
                <h3 className="font-extrabold text-2xl text-primary mb-2">{quiz.title}</h3>
                <div className="flex items-start justify-between mb-8">
                    <div className="text-sm font-medium text-secondary max-w-[60%] leading-relaxed">
                        {quiz.questionCount || 0} questions • {quiz.defaultMode} mode
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className="p-2 text-tertiary hover:text-primary hover:bg-page rounded-lg transition-colors"
                            onClick={onEdit}
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            className="p-2 text-tertiary hover:text-role-danger hover:bg-role-danger-light rounded-lg transition-colors"
                            onClick={onDelete}
                            title="Delete"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <Button
                variant="primary"
                onClick={onStart}
                className="w-full rounded-full font-bold py-3 text-lg hover:-translate-y-0.5 transition-transform whitespace-nowrap shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_70%)]"
            >
                Start Quiz
            </Button>
        </div>
    );
};

export default QuizCard;
