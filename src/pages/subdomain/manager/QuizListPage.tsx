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

const QuizListPage = () => {
    const navigate = useManagerNavigate();
    const { user } = useAuth();
    const subdomain = useSubdomain();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading quizzes...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{user?.username}</div>
                        <div className="text-sm text-gray-500">Manager</div>
                    </div>
                </div>
                <div className="text-lg font-semibold text-gray-700">
                    {subdomain}
                </div>
            </div>
            <div className="flex flex-1">
                <Sidebar isOpen={isOpen} onClose={toggleSidebar} />

                {/* Quiz Grid */}
                {quizzes.length > 0 ? (
                    <div className="grid grid-cols-4 gap-6 content-start overflow-y-auto pl-4 pb-4">
                        {/* Create Quiz Card */}
                        <div
                            onClick={handleCreateQuiz}
                            className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-8 flex items-center justify-center cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg h-content"
                        >
                            <div className="text-center text-white">
                                <Plus className="w-12 h-12 mx-auto mb-3" />
                                <div className="text-xl font-bold">Create Quiz</div>
                            </div>
                        </div>

                        {/* Quiz Cards */}
                        {quizzes.map(quiz => (
                            <div key={quiz.id} onClick={() => handleViewQuiz(quiz.id)}>
                                <QuizCard
                                    quiz={quiz}
                                    onStart={(e) => {
                                        e?.stopPropagation();
                                        handleStartQuiz(quiz.id);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full flex items-center justify-center">
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg mb-4">No quizzes yet</div>
                            <button
                                onClick={handleCreateQuiz}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                            >
                                Create Your First Quiz
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizListPage;