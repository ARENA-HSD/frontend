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
import TitleHeader from '@/components/layout/TitleHeader';

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
            <div className="w-full flex flex-col h-full overflow-hidden">
                <TitleHeader title={subdomain ?? ''} description='Quiz Management Dashboard' isButton buttonText='Create New' buttonIcon='+' onClick={handleCreateQuiz} />

                {/* Quizzes Content Area */}
                <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
                    {quizzes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">

                            {/* Create Quiz Large Square Card */}
                            <button
                                onClick={handleCreateQuiz}
                                className="inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:cursor-not-allowed text-primary-oposite btn-primary shadow-[0_6px_12px_-2px_var(--btn-primary-bg)] bg-gradient-to-b from-[var(--btn-primary-bg)] to-[color-mix(in_srgb,var(--btn-primary-bg),black_40%)] px-4 py-2 text-base rounded-2xl"
                            >
                                <div className='flex flex-col items-center'>
                                    <Plus className="w-16 h-16 stroke-[2]" />
                                    <span className="text-2xl">Create Quiz</span>
                                </div>
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
