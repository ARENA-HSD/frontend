/**
 * HSD Arena - Quiz List Page
 * 
 * Manager dashboard for viewing and creating quizzes
 */

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
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
                <div className="text-tertiary">Loading quizzes...</div>
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

            {/* Quiz Grid */}
            {quizzes.length > 0 ? (
                <div className="grid grid-cols-4 gap-6 content-start overflow-y-auto p-4">
                    {/* Create Quiz Card */}
                    <Button
                        onClick={handleCreateQuiz}
                        variant="primary"
                        className="rounded-xl"
                    >
                        <div className="text-center text-inverse">
                            <Plus className="w-12 h-12 mx-auto mb-3" />
                            <div className="text-xl font-bold">Create Quiz</div>
                        </div>
                    </Button>

                    {/* Quiz Cards */}
                    {quizzes.map(quiz => (
                        <div className="h-full" key={quiz.id} onClick={() => handleViewQuiz(quiz.id)}>
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
                <div className="w-full flex items-center justify-center">
                    <div className="text-center py-12">
                        <div className="text-tertiary text-lg mb-4">No quizzes yet</div>
                        <Button
                            onClick={handleCreateQuiz}
                            variant="primary"
                        >
                            Create Your First Quiz
                        </Button>
                    </div>
                </div>
            )}
        </SubdomainLayout>
    );
};

export default QuizListPage;