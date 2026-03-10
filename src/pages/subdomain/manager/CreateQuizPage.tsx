/**
 * HSD Arena - Create Quiz Page
 * 
 * Create new quiz with title and mode selection
 */

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { quizService } from '@/services';
import type { CreateQuizData, QuizMode } from '@/types';
import { Button, SubdomainLayout, SEO } from '@/components';

const CreateQuizPage = () => {
    const navigate = useManagerNavigate();
    const subdomain = useSubdomain();
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

        if (!subdomain) return;

        try {
            setIsLoading(true);
            const response = await quizService.createQuiz(
                subdomain,
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
        <SubdomainLayout>
            <SEO
                title="Create Quiz"
                description="Create a new interactive quiz for your organization."
                noIndex
            />
            <div className="w-full flex flex-col h-full overflow-y-auto overflow-x-hidden p-2 lg:p-8 scrollbar-hide">
                {/* Header Section */}
                <div className="flex items-center mb-8 gap-4">
                    <button
                        onClick={handleCancel}
                        className="p-2 -ml-2 text-primary hover:bg-page rounded-full transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                    >
                        <ArrowLeft className="w-8 h-8 stroke-[3]" />
                    </button>
                    <h1 className="text-4xl font-black text-primary">Create New Quiz</h1>
                </div>

                <div className="max-w-4xl">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Quiz Title */}
                        <div>
                            <label className="text-lg font-bold text-primary block mb-3">
                                Quiz Title <span className="text-role-danger">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter quiz title..."
                                className="w-full px-6 py-4 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-full outline-none transition-colors text-primary font-medium text-lg placeholder:text-tertiary shadow-sm"
                                required
                            />
                        </div>

                        {/* Quiz Mode */}
                        <div>
                            <label className="text-lg font-bold text-primary block mb-3">
                                Quiz Mode
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, defaultMode: 'STAGE' })}
                                    className={`p-6 rounded-2xl border-[3px] text-left transition-all ${formData.defaultMode === 'STAGE'
                                            ? 'border-[var(--btn-primary-bg)] bg-gradient-to-br from-[color-mix(in_srgb,var(--btn-primary-bg),transparent_90%)] to-transparent shadow-[0_0_20px_color-mix(in_srgb,var(--btn-primary-bg),transparent_40%)]'
                                            : 'border-light bg-transparent hover:border-medium shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 font-bold text-xl text-primary">
                                        <span className="text-2xl">🎤</span> Stage Mode
                                    </div>
                                    <div className="text-base text-secondary font-medium mt-2 leading-snug">
                                        Questions on big screen, answers on phones
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, defaultMode: 'PERSONAL' })}
                                    className={`p-6 rounded-2xl border-[3px] text-left transition-all ${formData.defaultMode === 'PERSONAL'
                                            ? 'border-[var(--btn-primary-bg)] bg-gradient-to-br from-[color-mix(in_srgb,var(--btn-primary-bg),transparent_90%)] to-transparent shadow-[0_0_20px_color-mix(in_srgb,var(--btn-primary-bg),transparent_40%)]'
                                            : 'border-light bg-transparent hover:border-medium shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 font-bold text-xl text-primary">
                                        <span className="text-2xl">📱</span> Personal Mode
                                    </div>
                                    <div className="text-base text-secondary font-medium mt-2 leading-snug">
                                        Questions and answers on participant's phone
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Button
                                type="button"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="rounded-full px-8 py-4 text-lg font-bold bg-page text-secondary hover:bg-light transition-colors hover:text-primary"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                variant="primary"
                                className="rounded-full px-8 py-4 text-lg font-bold hover:-translate-y-0.5 transition-transform whitespace-nowrap shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_70%)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0"
                            >
                                {isLoading ? 'Creating...' : 'Create Quiz'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </SubdomainLayout>
    );
};

export default CreateQuizPage;
