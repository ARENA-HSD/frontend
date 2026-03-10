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
                            <div className="text-xl font-bold text-primary">Create Question</div>
                            <div className="text-sm text-tertiary">New Question</div>
                        </div>
                        <button className="text-tertiary hover:text-secondary">
                            <MoreVertical className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <QuestionEditor
                    onCreate={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </SubdomainLayout>
    );
};

export default CreateQuestionPage;
