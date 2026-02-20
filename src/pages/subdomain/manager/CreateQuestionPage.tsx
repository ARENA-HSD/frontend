/**
 * HSD Arena - Create Question Page
 * 
 * Create new question for a quiz
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { useAuth, useManagerNavigate } from '@/hooks';
import { questionService } from '@/services';
import type { CreateQuestionData } from '@/types';
import QuestionEditor from '@/components/quiz/manager/QuestionEditor';

const CreateQuestionPage = () => {
    const navigate = useManagerNavigate();
    const { id: quizId } = useParams<{ id: string }>();
    const { currentOrganization } = useAuth();

    const handleSave = async (data: CreateQuestionData) => {
        if (!quizId || !currentOrganization) return;

        await questionService.createQuestion(
            currentOrganization.subdomain,
            quizId,
            data
        );
        navigate(`/manager/quizzes/${quizId}`);
    };

    const handleCancel = () => {
        navigate(`/manager/quizzes/${quizId}`);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">New Question</div>
                    <div className="text-xl font-bold text-gray-900">Create Question</div>
                    <button className="text-gray-400 hover:text-gray-600">
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
    );
};

export default CreateQuestionPage;
