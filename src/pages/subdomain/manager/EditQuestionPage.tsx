/**
 * HSD Arena - Edit Question Page
 * 
 * Edit existing question
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { useAuth, useManagerNavigate } from '@/hooks';
import { questionService } from '@/services';
import type { Question, UpdateQuestionData } from '@/types';
import QuestionEditor from '@/components/quiz/manager/QuestionEditor';

const EditQuestionPage = () => {
    const navigate = useManagerNavigate();
    const { id: quizId, questionId } = useParams<{ id: string; questionId: string }>();
    const { currentOrganization } = useAuth();
    const [question, setQuestion] = useState<Question | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (questionId && quizId && currentOrganization) {
            loadQuestion();
        }
    }, [questionId, quizId, currentOrganization]);

    const loadQuestion = async () => {
        if (!questionId || !quizId || !currentOrganization) return;

        try {
            setIsLoading(true);
            const response = await questionService.getQuestion(
                currentOrganization.subdomain,
                quizId,
                questionId
            );
            setQuestion(response.data!.question);
        } catch (error) {
            console.error('Failed to load question:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (data: UpdateQuestionData) => {
        if (!questionId || !quizId || !currentOrganization) return;

        await questionService.updateQuestion(
            currentOrganization.subdomain,
            quizId,
            questionId,
            data
        );
        navigate(`/manager/quizzes/${quizId}`);
    };

    const handleCancel = () => {
        navigate(`/manager/quizzes/${quizId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading question...</div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">Question not found</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Question {question.orderIndex + 1}</div>
                    <div className="text-xl font-bold text-gray-900">Edit Question</div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Editor */}
            <QuestionEditor
                question={question}
                onUpdate={handleSave}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default EditQuestionPage;
