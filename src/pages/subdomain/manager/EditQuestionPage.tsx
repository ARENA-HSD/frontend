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
import { SubdomainLayout, SEO } from '@/components';

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
            const r = response as any;
            setQuestion(r?.data?.question || r?.question || r);
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
            <SEO
                title="Edit Question"
                description="Edit an existing quiz question."
                noIndex
            />
            <div className="w-full flex flex-col h-full overflow-y-auto overflow-x-hidden p-2 lg:p-8 scrollbar-hide">
                <div className="max-w-4xl mx-auto w-full">
                    {/* Header */}
                    <div className="flex items-center mb-8 gap-4">
                        <button
                            onClick={handleCancel}
                            className="p-2 -ml-2 text-primary hover:bg-page rounded-full transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                            title="Back to Quiz"
                        >
                            <ArrowLeft className="w-8 h-8 stroke-[3]" />
                        </button>
                        <h1 className="text-4xl font-black text-primary">Edit Question</h1>
                    </div>

                    {/* Editor */}
                    <QuestionEditor
                        question={question}
                        onUpdate={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </SubdomainLayout>
    );
};

export default EditQuestionPage;
