/**
 * HSD Arena - Quiz List Page
 * 
 * Manager dashboard for viewing and creating quizzes
 */

import { useState, useEffect } from 'react';
import { Plus, PlayCircle } from 'lucide-react';
import { useAuth, useManagerNavigate, useSubdomain } from '@/hooks';
import { quizService } from '@/services';
import type { Quiz } from '@/types';
import QuizCard from '@/components/quiz/manager/QuizCard';
import { Button, SubdomainLayout, SEO } from '@/components';

const QuizListPage = () => {
    const navigate = useManagerNavigate();
    const { user } = useAuth();
    const subdomain = useSubdomain();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (subdomain) {
            loadQuizzes();
        } else {
            console.warn('No subdomain detected, cannot load quizzes');
            setIsLoading(false);
        }
    }, [subdomain]);

    const loadQuizzes = async () => {
        if (!subdomain) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await quizService.getQuizzes(subdomain);
            const r = response as any;
            const quizzesList = r?.data?.quizzes || (Array.isArray(r?.data) ? r.data : []);
            setQuizzes(Array.isArray(quizzesList) ? quizzesList : []);
        } catch (error) {
            console.error('Failed to load quizzes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateQuiz = () => {
        navigate('/manager/quizzes/new');
    };

    const handleStartQuiz = (quizId: string) => {
        navigate(`/manager/quizzes/${quizId}/lobby`);
    };

    const handleViewQuiz = (quizId: string) => {
        navigate(`/manager/quizzes/${quizId}`);
    };

    const handleSettingsQuiz = (quizId: string) => {
        navigate(`/manager/quizzes/${quizId}/settings`);
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (confirm('Are you sure you want to delete this quiz?')) {
            await quizService.deleteQuiz(subdomain!, quizId);
            loadQuizzes();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500 font-medium">Loading quizzes...</div>
            </div>
        );
    }

    return (
        <SubdomainLayout>
            <SEO
                title="Quiz Dashboard"
                description="Manage and launch quizzes for your organization."
                noIndex
            />
            <div className="w-full flex flex-col h-full overflow-hidden p-2 lg:p-8">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-primary mb-1">{subdomain}</h1>
                        <p className="text-lg font-medium text-secondary">Quiz Management Dashboard</p>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleCreateQuiz}
                        className="rounded-full font-bold px-8 py-3 text-lg hover:-translate-y-0.5 transition-transform whitespace-nowrap shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_70%)] flex items-center gap-2"
                    >
                        <span>+ Create New</span>
                        <PlayCircle className="w-6 h-6 fill-current" />
                    </Button>
                </div>

                {/* Quizzes Content Area */}
                <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
                    {quizzes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">

                            {/* Create Quiz Large Square Card */}
                            <button
                                onClick={handleCreateQuiz}
                                className="aspect-square bg-gradient-to-br from-[var(--btn-primary-bg)] to-[color-mix(in_srgb,var(--btn-primary-bg),black_30%)] hover:to-[color-mix(in_srgb,var(--btn-primary-bg),black_40%)] text-primary-oposite rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-focus shadow-[0_8px_20px_-4px_color-mix(in_srgb,var(--btn-primary-bg),transparent_50%)]"
                            >
                                <Plus className="w-16 h-16 mb-4 stroke-[2.5]" />
                                <span className="text-2xl font-bold">Create Quiz</span>
                            </button>

                            {/* Existing Quiz Cards */}
                            {quizzes.map(quiz => (
                                <div key={quiz.id} className="h-full" onClick={() => handleViewQuiz(quiz.id)}>
                                    <QuizCard
                                        quiz={quiz}
                                        onStart={(e) => {
                                            e?.stopPropagation();
                                            handleStartQuiz(quiz.id);
                                        }}
                                        onEdit={(e) => {
                                            e?.stopPropagation();
                                            handleSettingsQuiz(quiz.id);
                                        }}
                                        onDelete={(e) => {
                                            e?.stopPropagation();
                                            handleDeleteQuiz(quiz.id);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="text-tertiary text-xl font-medium mb-6">No quizzes yet</div>
                                <Button
                                    variant="primary"
                                    onClick={handleCreateQuiz}
                                    className="rounded-full font-bold px-8 py-3 text-lg hover:-translate-y-0.5 transition-transform whitespace-nowrap shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_70%)]"
                                >
                                    Create Your First Quiz
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SubdomainLayout>
    );
};

export default QuizListPage;
