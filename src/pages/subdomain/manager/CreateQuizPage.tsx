/**
 * HSD Arena - Create Quiz Page
 * 
 * Create new quiz with title and mode selection
 */

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth, useManagerNavigate } from '@/hooks';
import { quizService } from '@/services';
import type { CreateQuizData, QuizMode } from '@/types';

const CreateQuizPage = () => {
    const navigate = useManagerNavigate();
    const { currentOrganization } = useAuth();
    const [formData, setFormData] = useState<CreateQuizData>({
        title: '',
        defaultMode: 'STAGE'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Please enter a quiz title');
            return;
        }

        if (!currentOrganization) return;

        try {
            setIsLoading(true);
            const response = await quizService.createQuiz(
                currentOrganization.subdomain,
                formData
            );

            // Redirect to quiz detail to add questions
            const r = response as any;
            const quizId = r?.data?.quiz?.id || r?.data?.id || r?.id;
            if (quizId) {
                navigate(`/manager/quizzes/${quizId}`);
            } else {
                navigate('/manager/quizzes');
            }
        } catch (error) {
            console.error('Failed to create quiz:', error);
            alert('Failed to create quiz');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/manager/quizzes');
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Quizzes
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm">
                <div className="space-y-6">
                    {/* Quiz Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quiz Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter quiz title..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Quiz Mode */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quiz Mode
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, defaultMode: 'STAGE' })}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${formData.defaultMode === 'STAGE'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-semibold text-gray-900">🎤 Stage Mode</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Questions on big screen, answers on phones
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, defaultMode: 'PERSONAL' })}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${formData.defaultMode === 'PERSONAL'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-semibold text-gray-900">📱 Personal Mode</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Questions and answers on participant's phone
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Creating...' : 'Create Quiz'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuizPage;
