/**
 * HSD Arena - Quiz Detail Page
 * 
 * View and manage questions in a quiz with drag-and-drop reordering
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowBigLeft, Settings, GripVertical } from 'lucide-react';
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
import type { Quiz, Question } from '@/types';
import { Button, SubdomainLayout } from '@/components';

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
    };

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
            await loadQuizData();
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
            <div className="max-w-5xl mx-auto p-6">
                {/* Header */}
                <div className="bg-card p-6 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <button
                                    onClick={backToQuizzes}
                                    className="text-tertiary hover:text-secondary"
                                >
                                    <ArrowBigLeft className="w-6 h-6 mr-2" />
                                </button>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-primary mb-2">{quiz.title}</h1>
                                <div className="text-secondary">
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
                            >
                                Start
                            </Button>
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => handleSettingsQuiz(quiz.id)}
                                    className="p-1 text-tertiary hover:text-role-primary hover:bg-role-primary-light rounded"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                    className="p-1 text-tertiary hover:text-role-danger hover:bg-role-danger-light rounded"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question List — Drag & Drop */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={questions.map(q => q.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3 mb-20">
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
                    <div className="bg-card p-12 rounded-lg text-center">
                        <div className="text-tertiary text-lg mb-4">No questions yet</div>
                        <Button
                            onClick={handleAddQuestion}
                            variant="primary"
                            className="px-8 py-3.5 rounded-lg font-semibold shadow-lg flex items-center gap-2"
                        >
                            Add First Question
                        </Button>
                    </div>
                )}

                {/* Floating Add Button */}
                {questions.length > 0 && (
                    <div className="absolute bottom-20 left-[32%] flex justify-center">
                        <Button
                            onClick={handleAddQuestion}
                            variant="primary"
                            className="px-8 py-3.5 flex items-center gap-2"
                        >
                            <Plus className="w-8 h-8" />
                            Add Question
                        </Button>
                    </div>
                )}
            </div>
        </SubdomainLayout>
    );
};

export default QuizDetailPage;
