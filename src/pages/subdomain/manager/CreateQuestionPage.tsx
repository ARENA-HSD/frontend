/**
 * HSD Arena - Create Question Page
 * 
 * Create new question for a quiz
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { questionService } from '@/services';
import type { CreateQuestionData } from '@/types';
import QuestionEditor from '@/components/quiz/manager/QuestionEditor';
import { SubdomainLayout, SEO } from '@/components';

const CreateQuestionPage = () => {
    const navigate = useManagerNavigate();
    const { id: quizId } = useParams<{ id: string }>();
    const subdomain = useSubdomain();

    const handleSave = async (data: CreateQuestionData) => {
        if (!quizId || !subdomain) return;

        await questionService.createQuestion(
            subdomain,
            quizId,
            data
        );
        navigate(`/manager/quizzes/${quizId}`);
    };

    const handleCancel = () => {
        navigate(`/manager/quizzes/${quizId}`);
    };

    return (
        <SubdomainLayout>
            <SEO
                title="Add Question"
                description="Add a new question to your quiz."
                noIndex
            />
            <div className="w-full flex flex-col h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
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
                        <h1 className="text-4xl font-black text-primary">Create Question</h1>
                    </div>

                    {/* Editor */}
                    <QuestionEditor
                        onCreate={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </SubdomainLayout>
    );
};

export default CreateQuestionPage;
