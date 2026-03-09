/**
 * HSD Arena - Edit Question Page
 * 
 * Edit existing question
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { questionService } from '@/services';
import type { Question, UpdateQuestionData } from '@/types';
import QuestionEditor from '@/components/quiz/manager/QuestionEditor';
import { SubdomainLayout } from '@/components';

const EditQuestionPage = () => {
    const navigate = useManagerNavigate();
    const { id: quizId, questionId } = useParams<{ id: string; questionId: string }>();
    const subdomain = useSubdomain();
    const [question, setQuestion] = useState<Question | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (questionId && quizId && subdomain) {
            loadQuestion();
        }
    }, [questionId, quizId, subdomain]);

    const loadQuestion = async () => {
        if (!questionId || !quizId || !subdomain) return;

        try {
            setIsLoading(true);
            const response = await questionService.getQuestion(
                subdomain,
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
        if (!questionId || !quizId || !subdomain) return;

        await questionService.updateQuestion(
            subdomain,
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
                <div className="text-tertiary">Loading question...</div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-role-danger">Question not found</div>
            </div>
        );
    }

    return (
        <SubdomainLayout>
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="bg-card p-6 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 text-secondary hover:text-primary"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Quiz
                        </button>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-xl font-bold text-primary">Edit Question</div>
                            <div className="text-sm text-tertiary">Question {question.orderIndex + 1}</div>
                        </div>
                        <button className="text-tertiary hover:text-secondary">
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
        </SubdomainLayout>
    );
};

export default EditQuestionPage;
