/**
 * HSD Arena - Quiz Detail Page
 * 
 * View and manage questions in a quiz
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, MoreVertical, Edit2, Trash2, ArrowBigLeft, Settings } from 'lucide-react';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { quizService, questionService } from '@/services';
import type { Quiz, Question } from '@/types';

const QuizDetailPage = () => {
    const navigate = useManagerNavigate();
    const { id: quizId } = useParams<{ id: string }>();
    const subdomain = useSubdomain();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const backToQuizzes = () => {
        navigate('/manager/quizzes');
    };

    useEffect(() => {
        if (quizId && subdomain) {
            loadQuizData();
        }
    }, [quizId, subdomain]);

    const loadQuizData = async () => {
        if (!quizId || !subdomain) return;
        const orgDomain = subdomain;

        try {
            setIsLoading(true);
            const [quizResponse, questionsResponse] = await Promise.all([
                quizService.getQuiz(orgDomain, quizId),
                questionService.getQuestions(orgDomain, quizId)
            ]);

            // Handle wrapped API responses: { success, data: { ... } }
            const qr = quizResponse as any;
            const questionsr = questionsResponse as any;

            const quizData = qr?.data?.quiz || qr?.data || qr;
            const questionsData =
                questionsr?.data?.questions ||
                (Array.isArray(questionsr?.data) ? questionsr.data : []);

            setQuiz(quizData);
            setQuestions(Array.isArray(questionsData) ? questionsData : []);
        } catch (error) {
            console.error('Failed to load quiz:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartQuiz = () => {
        navigate(`/manager/quizzes/${quizId}/lobby`);
    };

    const handleSettingsQuiz = (quizId: string) => {
        navigate(`/manager/quizzes/${quizId}/settings`);
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (confirm('Are you sure you want to delete this quiz?')) {
            await quizService.deleteQuiz(subdomain!, quizId);
            navigate('/manager/quizzes');
        }
    };

    const handleAddQuestion = () => {
        navigate(`/manager/quizzes/${quizId}/questions/new`);
    };

    const handleEditQuestion = (questionId: string) => {
        navigate(`/manager/quizzes/${quizId}/questions/${questionId}/edit`);
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        if (!subdomain || !quizId) return;

        try {
            await questionService.deleteQuestion(subdomain, quizId, questionId);
            await loadQuizData();
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading quiz...</div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">Quiz not found</div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <button
                                onClick={backToQuizzes}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <ArrowBigLeft className="w-6 h-6 mr-2" />
                            </button>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                            <div className="text-gray-600">
                                {questions.length} questions • {quiz.defaultMode} mode
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleStartQuiz}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                        >
                            Start
                        </button>
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => handleSettingsQuiz(quiz.id)}
                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDeleteQuiz(quiz.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question List */}
            <div className="space-y-3 mb-20">
                {questions.map((question, idx) => (
                    <div
                        key={question.id}
                        className="bg-white p-5 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                {idx + 1}
                            </div>
                            <div>
                                <div className="text-gray-900 font-medium">{question.text}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {question.timeLimit}s • {question.points} pts • {question.options.length} options
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleEditQuestion(question.id)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {questions.length === 0 && (
                <div className="bg-white p-12 rounded-lg text-center">
                    <div className="text-gray-400 text-lg mb-4">No questions yet</div>
                    <button
                        onClick={handleAddQuestion}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                        Add First Question
                    </button>
                </div>
            )}

            {/* Floating Add Button */}
            {questions.length > 0 && (
                <div className="fixed bottom-6 left-0 right-0 flex justify-center">
                    <button
                        onClick={handleAddQuestion}
                        className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Question
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizDetailPage;
