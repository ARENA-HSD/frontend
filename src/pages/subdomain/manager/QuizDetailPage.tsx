/**
 * HSD Arena - Quiz Detail Page
 * 
 * View and manage questions in a quiz with drag-and-drop reordering
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowLeft, Settings, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useManagerNavigate, useSubdomain } from '@/hooks';
import { quizService, questionService } from '@/services';
import { dedupeRequest, invalidateDedupedRequest } from '@/lib/requestDedup';
import type { Quiz, Question } from '@/types';
import { Button, SubdomainLayout, SEO } from '@/components';

// ============================================================================
// Sortable Question Card Component
// ============================================================================

interface SortableQuestionCardProps {
    question: Question;
    index: number;
    onEdit: (questionId: string) => void;
    onDelete: (questionId: string) => void;
}

const SortableQuestionCard = ({ question, index, onEdit, onDelete }: SortableQuestionCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-card p-5 rounded-lg shadow-sm flex items-center justify-between transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-focus' : 'hover:shadow-md'
                }`}
        >
            <div className="flex items-center gap-4 flex-1">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 text-tertiary hover:text-secondary cursor-grab active:cursor-grabbing touch-none"
                    title="Sırayı değiştirmek için sürükle"
                >
                    <GripVertical className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-role-primary-light rounded-full flex items-center justify-center text-role-primary font-bold">
                    {index + 1}
                </div>
                <div>
                    <div className="text-primary font-medium">{question.text}</div>
                    <div className="text-sm text-tertiary mt-1">
                        {question.timeLimit}s • {question.points} pts • {question.options.length} options
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(question.id)}
                    className="p-2 text-tertiary hover:text-role-primary hover:bg-role-primary-light rounded"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(question.id)}
                    className="p-2 text-tertiary hover:text-role-danger hover:bg-role-danger-light rounded"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// Quiz Detail Page
// ============================================================================

const QuizDetailPage = () => {
    const navigate = useManagerNavigate();
    const { id: quizId } = useParams<{ id: string }>();
    const subdomain = useSubdomain();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    // DnD sensors — pointer (mouse/touch) + keyboard
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }, // 8px movement before drag starts
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const backToQuizzes = () => {
        navigate('/manager/quizzes');
    };

    const loadQuizData = useCallback(async (force = false) => {
        if (!quizId || !subdomain) return;
        const orgDomain = subdomain;
        const requestKey = `quiz-detail:${orgDomain}:${quizId}`;

        try {
            setIsLoading(true);
            const [quizResponse, questionsResponse] = await dedupeRequest(
                requestKey,
                async () => {
                    return Promise.all([
                        quizService.getQuiz(orgDomain, quizId),
                        questionService.getQuestions(orgDomain, quizId),
                    ]);
                },
                { cacheMs: 3000, force }
            );

            // Handle wrapped API responses: { success, data: { ... } }
            const qr = quizResponse as any;
            const questionsr = questionsResponse as any;

            const quizData = qr?.data?.quiz || qr?.data || qr;
            const questionsData =
                questionsr?.data?.questions ||
                (Array.isArray(questionsr?.data) ? questionsr.data : []);

            setQuiz(quizData);

            // Sort by orderIndex on load
            const sortedQuestions = Array.isArray(questionsData)
                ? [...questionsData].sort((a: Question, b: Question) => a.orderIndex - b.orderIndex)
                : [];
            setQuestions(sortedQuestions);
        } catch (error) {
            console.error('Failed to load quiz:', error);
        } finally {
            setIsLoading(false);
        }
    }, [quizId, subdomain]);

    useEffect(() => {
        if (quizId && subdomain) {
            void loadQuizData();
        }
    }, [quizId, subdomain, loadQuizData]);

    // ── Drag & Drop Handler ──────────────────────────────────────────────

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        if (!subdomain || !quizId) return;

        const oldIndex = questions.findIndex(q => q.id === active.id);
        const newIndex = questions.findIndex(q => q.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        // Optimistic update — UI'ı hemen güncelle
        const reordered = arrayMove(questions, oldIndex, newIndex);
        setQuestions(reordered);

        // Backend'e kaydet
        try {
            setIsSavingOrder(true);
            await questionService.reorderQuestions(
                subdomain,
                quizId,
                reordered.map(q => q.id)
            );
        } catch (error) {
            console.error('Failed to reorder questions:', error);
            // Hata durumunda eski sıralamaya geri dön
            setQuestions(questions);
        } finally {
            setIsSavingOrder(false);
        }
    };

    // ── Other Handlers ───────────────────────────────────────────────────

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
            invalidateDedupedRequest(`quiz-detail:${subdomain}:${quizId}`);
            await loadQuizData(true);
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-tertiary">Loading quiz...</div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-role-danger">Quiz not found</div>
            </div>
        );
    }

    return (
        <SubdomainLayout>
            <SEO
                title="Quiz Details"
                description="View and manage quiz questions with drag-and-drop reordering."
                noIndex
            />
            <div className="w-full flex flex-col h-full overflow-hidden">
                <div className="max-w-4xl mx-auto w-full flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 border-b border-light pb-6 w-full justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={backToQuizzes}
                                    className="p-2 -ml-2 text-primary hover:bg-page rounded-full transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                                >
                                    <ArrowLeft className="w-8 h-8 stroke-[3]" />
                                </button>
                                <div>
                                    <h1 className="text-4xl font-black text-primary leading-none mb-1">{quiz.title}</h1>
                                    <div className="text-secondary font-medium">
                                        {questions.length} questions • {quiz.defaultMode} mode
                                        {isSavingOrder && (
                                            <span className="ml-2 text-role-primary text-sm animate-pulse">
                                                Sıralama kaydediliyor...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleStartQuiz}
                                    variant="primary"
                                    className="rounded-full px-8 py-3 text-lg font-bold hover:-translate-y-0.5 transition-transform whitespace-nowrap shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_70%)] disabled:opacity-50"
                                >
                                    Start Quiz
                                </Button>
                                <div className="flex items-center gap-2 ml-2">
                                    <button
                                        onClick={() => handleSettingsQuiz(quiz.id)}
                                        className="p-3 text-secondary hover:text-role-primary hover:bg-role-primary-light rounded-full transition-colors bg-card shadow-sm border border-light"
                                        title="Settings"
                                    >
                                        <Settings className="w-5 h-5 stroke-[2.5]" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuiz(quiz.id)}
                                        className="p-3 text-secondary hover:text-role-danger hover:bg-role-danger-light rounded-full transition-colors bg-card shadow-sm border border-light"
                                        title="Delete Quiz"
                                    >
                                        <Trash2 className="w-5 h-5 stroke-[2.5]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question List — Drag & Drop */}
                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={questions.map(q => q.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {questions.map((question, idx) => (
                                        <SortableQuestionCard
                                            key={question.id}
                                            question={question}
                                            index={idx}
                                            onEdit={handleEditQuestion}
                                            onDelete={handleDeleteQuestion}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {/* Empty State */}
                        {questions.length === 0 && (
                            <div className="w-full flex items-center justify-center p-12">
                                <div className="text-center">
                                    <div className="text-tertiary text-xl font-medium mb-6">No questions yet</div>
                                    <Button
                                        onClick={handleAddQuestion}
                                        variant="primary"
                                        className="rounded-full px-8 py-4 text-lg font-bold transition-transform hover:-translate-y-0.5 whitespace-nowrap shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_70%)]"
                                    >
                                        Add First Question
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Add Button at End of List */}
                        {questions.length > 0 && (
                            <div className="flex justify-end mt-4 mb-16 pr-2">
                                <Button
                                    onClick={handleAddQuestion}
                                    variant="primary"
                                    className="rounded-full px-8 py-4 flex items-center gap-2 shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_50%)] hover:-translate-y-1 transition-all"
                                >
                                    <Plus className="w-6 h-6 stroke-[3]" />
                                    <span className="text-lg font-bold">Add Question</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SubdomainLayout >
    );
};

export default QuizDetailPage;
