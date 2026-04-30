/**
 * HSD Arena - Question Editor Component
 * 
 * Create/Edit question with text, options, timeLimit, points
 */

import { useState } from 'react';
import type { Question, CreateQuestionData, UpdateQuestionData, QuestionOption, QuestionType } from '@/types';
import ImagePlaceholder from '@/components/quiz/shared/ImagePlaceholder';
import { Button } from '@/components/ui';
import { MEDIA_UPLOAD_CONSTRAINTS } from '@/lib/constants';

interface QuestionEditorProps {
    question?: Question;
    totalQuestions?: number;
    onCreate?: (data: CreateQuestionData) => Promise<void>;
    onUpdate?: (data: UpdateQuestionData) => Promise<void>;
    onCancel: () => void;
}

const OPTION_COLORS = ['bg-role-success', 'bg-[#FF4F81]', 'bg-[#9C4BFF]', 'bg-[#FF8A00]', 'bg-blue-500', 'bg-pink-500'];
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const FRONTEND_MEDIA_TYPE_ERROR = 'Sadece jpeg, png, webp veya gif görseller yüklenebilir.';
const FRONTEND_MEDIA_SIZE_ERROR = 'Görsel boyutu en fazla 3 MB olabilir.';
const BACKEND_MEDIA_ERRORS = [
    'Image must be a valid base64 data URL',
    'Image size must be 3MB or less',
    'Only jpeg, png, webp or gif images are allowed',
] as const;

const QuestionEditor = ({ question, totalQuestions = 0, onCreate, onUpdate, onCancel }: QuestionEditorProps) => {
    const [questionType, setQuestionType] = useState<QuestionType>(question?.questionType || 'MULTIPLE_CHOICE');
    const [questionText, setQuestionText] = useState(question?.text || '');
    const [mediaPreview, setMediaPreview] = useState(question?.mediaUrl || '');
    const [mediaBase64, setMediaBase64] = useState<string | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [isPreparingMedia, setIsPreparingMedia] = useState(false);
    const [timeLimit, setTimeLimit] = useState(question?.timeLimit || 30);
    const [points, setPoints] = useState(question?.points || 1000);
    const [options, setOptions] = useState<QuestionOption[]>(
        question?.options?.length ? question.options : [{ text: '', color: 'red' }, { text: '', color: 'blue' }, { text: '', color: 'green' }, { text: '', color: 'yellow' }]
    );
    const [correctAnswer, setCorrectAnswer] = useState<number[]>(question?.correctAnswer || [0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index] = { text, color: options[index].color };
        setOptions(newOptions);
        options.forEach((option, idx) => {
            console.log(idx + ' ' + option.text);
        });
    };

    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                    return;
                }
                reject(new Error('Invalid file content'));
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleMediaFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setMediaError(null);

        if (!MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type as (typeof MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES)[number])) {
            setMediaError(FRONTEND_MEDIA_TYPE_ERROR);
            event.target.value = '';
            return;
        }

        if (file.size > MEDIA_UPLOAD_CONSTRAINTS.MAX_IMAGE_SIZE_BYTES) {
            setMediaError(FRONTEND_MEDIA_SIZE_ERROR);
            event.target.value = '';
            return;
        }

        setIsPreparingMedia(true);

        try {
            const dataURL = await readFileAsDataURL(file);
            setMediaPreview(dataURL);
            setMediaBase64(dataURL);
        } catch (error) {
            console.error('Failed to prepare image:', error);
            setMediaError('Görsel dosyası okunamadı. Lütfen tekrar deneyin.');
        } finally {
            setIsPreparingMedia(false);
            event.target.value = '';
        }
    };

    const handleRemoveMedia = () => {
        setMediaPreview('');
        setMediaBase64('');
        setMediaError(null);
    };

    const getSaveErrorMessage = (error: unknown): string => {
        const requestError = error as {
            response?: { status?: number; data?: { message?: string } };
            message?: string;
        };
        const status = requestError.response?.status;
        const message = requestError.response?.data?.message;

        if (status === 400 && typeof message === 'string') {
            if (BACKEND_MEDIA_ERRORS.includes(message as (typeof BACKEND_MEDIA_ERRORS)[number])) {
                return message;
            }

            return message;
        }

        if (status && status >= 500) {
            return 'Görsel yükleme sırasında bir hata oluştu.';
        }

        return message || requestError.message || 'Failed to save question';
    };

    const handleSave = async () => {
        if (!questionText.trim()) {
            alert('Lütfen bir soru metni girin');
            return;
        }

        if (questionType !== 'RANGE' && options.some(o => !o.text.trim())) {
            alert('Lütfen tüm seçenekleri doldurun');
            return;
        }

        if (questionType === 'MULTI_SELECT' && correctAnswer.length === 0) {
            alert('Lütfen en az bir doğru cevap seçin');
            return;
        }

        if (questionType === 'RANGE' && (correctAnswer.length !== 2 || correctAnswer[0] > correctAnswer[1])) {
            alert('Lütfen geçerli bir min ve max aralığı girin');
            return;
        }

        if (mediaError) {
            alert(mediaError);
            return;
        }

        try {
            setIsSaving(true);

            if (question && onUpdate) {
                const payload: UpdateQuestionData = {
                    text: questionText,
                    timeLimit,
                    points,
                    options: questionType === 'RANGE' ? [] : options,
                    questionType,
                    correctAnswer: questionType === 'ORDERING' ? options.map((_, i) => i) : correctAnswer,
                };

                if (mediaBase64 !== null) {
                    payload.mediaBase64 = mediaBase64;
                }

                await onUpdate(payload);
                setMediaBase64(null);
            } else if (onCreate) {
                const payload: CreateQuestionData = {
                    text: questionText,
                    timeLimit,
                    points,
                    options: questionType === 'RANGE' ? [] : options,
                    questionType,
                    correctAnswer: questionType === 'ORDERING' ? options.map((_, i) => i) : correctAnswer,
                    orderIndex: question?.orderIndex ?? totalQuestions,
                };

                if (mediaBase64) {
                    payload.mediaBase64 = mediaBase64;
                }

                await onCreate(payload);
                setMediaBase64(null);
            }
        } catch (error) {
            console.error('Failed to save question:', error);
            alert(getSaveErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full">
            {/* Top Row: Image & Text */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Image Section */}
                <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                    <div className="w-48 h-48 rounded-3xl overflow-hidden bg-card border-4 border-light shadow-sm flex items-center justify-center relative">
                        {mediaPreview ? (
                            <img
                                src={mediaPreview}
                                alt="Question Image"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <ImagePlaceholder
                                alt="Question Image"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>

                {/* Media URL Input & Question Text */}
                <div className="flex-1 flex flex-col pt-2">
                    <div className="mb-6">
                        <label className="text-lg font-bold text-primary block mb-3">
                            Question Image
                        </label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <input
                                type="file"
                                accept={MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.join(',')}
                                onChange={(event) => {
                                    void handleMediaFileChange(event);
                                }}
                                disabled={isPreparingMedia || isSaving}
                                className="w-full px-4 py-3 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-2xl outline-none transition-colors text-primary font-medium"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRemoveMedia}
                                disabled={isPreparingMedia || isSaving || (!mediaPreview && mediaBase64 === null)}
                                className="whitespace-nowrap"
                            >
                                Remove image
                            </Button>
                        </div>
                        <p className="text-sm text-tertiary mt-2">
                            Maksimum {MEDIA_UPLOAD_CONSTRAINTS.MAX_IMAGE_SIZE_MB} MB. Desteklenen formatlar: jpeg, png, webp, gif.
                        </p>
                        {isPreparingMedia && (
                            <p className="text-sm text-secondary mt-1">Görsel hazırlanıyor...</p>
                        )}
                        {mediaError && (
                            <p className="text-sm text-role-danger mt-1">{mediaError}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-lg font-bold text-primary block mb-3">
                            Question Text <span className="text-role-danger">*</span>
                        </label>
                        <textarea
                            className="w-full h-32 px-6 py-4 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-3xl outline-none transition-colors text-primary font-medium text-lg placeholder:text-tertiary shadow-sm resize-none"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Enter your question here..."
                        />
                    </div>
                </div>
            </div>

            {/* Settings Row */}
            <div className="flex flex-col md:flex-row gap-8 mb-10 items-end">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-lg font-bold text-primary">
                            Time Limit (seconds)
                        </label>
                        <span className="text-xl font-bold text-primary">
                            {timeLimit}s
                        </span>
                    </div>
                    <div className="h-16 flex items-center">
                        <input
                            type="range"
                            min="10"
                            max="120"
                            step="5"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                            className="w-full h-2 bg-transparent cursor-pointer accent-[var(--btn-primary-bg)] transition-colors"
                        />
                    </div>
                </div>
                <div className="w-full md:w-64 shrink-0">
                    <label className="text-lg font-bold text-primary block mb-3">
                        Points
                    </label>
                    <input
                        type="number"
                        min="100"
                        step="100"
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value) || 100)}
                        className="w-full px-6 py-4 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-2xl outline-none transition-colors text-primary font-bold text-xl shadow-sm"
                    />
                </div>
            </div>

            {/* Question Type Selection */}
            <div className="mb-6">
                <label className="text-lg font-bold text-primary block mb-3">Soru Tipi</label>
                <div className="flex flex-wrap gap-3">
                    {[
                        { type: 'MULTIPLE_CHOICE', label: 'Çoktan Seçmeli' },
                        { type: 'TRUE_FALSE', label: 'Doğru / Yanlış' },
                        { type: 'MULTI_SELECT', label: 'Çoklu Seçim' },
                        { type: 'ORDERING', label: 'Sıralama' },
                        { type: 'RANGE', label: 'Aralık Tahmini' },
                    ].map(t => (
                        <button
                            key={t.type}
                            type="button"
                            onClick={() => {
                                setQuestionType(t.type as QuestionType);
                                if (t.type === 'TRUE_FALSE') {
                                    setOptions([{ text: 'Doğru', color: 'green' }, { text: 'Yanlış', color: 'red' }]);
                                    setCorrectAnswer([0]);
                                } else if (t.type === 'RANGE') {
                                    setOptions([]);
                                    setCorrectAnswer([0, 100]);
                                } else {
                                    setOptions([{ text: '', color: 'red' }, { text: '', color: 'blue' }, { text: '', color: 'green' }, { text: '', color: 'yellow' }]);
                                    setCorrectAnswer([0]);
                                }
                            }}
                            className={`px-4 py-2 rounded-xl border-2 font-bold transition-colors ${questionType === t.type ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)] text-white' : 'border-light text-secondary hover:border-[var(--btn-primary-bg)]'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Options */}
            <div className="mb-10">
                <label className="text-lg font-bold text-primary block mb-4">
                    {questionType === 'ORDERING' ? 'Seçenekleri doğru sırayla girin' : 
                     questionType === 'RANGE' ? 'Doğru aralığı (Min - Max) girin' : 
                     'Seçenekler (Doğru olanı işaretleyin)'}
                </label>
                
                {questionType === 'RANGE' ? (
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-bold text-secondary mb-1 block">Minimum Değer</label>
                            <input
                                type="number"
                                value={correctAnswer[0] || 0}
                                onChange={(e) => setCorrectAnswer([parseInt(e.target.value) || 0, correctAnswer[1]])}
                                className="w-full px-4 py-3 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-2xl outline-none text-primary font-bold text-xl"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-bold text-secondary mb-1 block">Maksimum Değer</label>
                            <input
                                type="number"
                                value={correctAnswer[1] || 100}
                                onChange={(e) => setCorrectAnswer([correctAnswer[0], parseInt(e.target.value) || 0])}
                                className="w-full px-4 py-3 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-2xl outline-none text-primary font-bold text-xl"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {options.map((option, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    if (questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE') {
                                        setCorrectAnswer([idx]);
                                    } else if (questionType === 'MULTI_SELECT') {
                                        setCorrectAnswer(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
                                    }
                                }}
                                className={`relative flex items-center p-4 rounded-3xl transition-all shadow-md group border-[3px]
                                    ${questionType !== 'ORDERING' ? 'cursor-pointer' : ''}
                                    ${(questionType !== 'ORDERING' && correctAnswer.includes(idx)) ? 'border-transparent scale-[1.02]' : 'border-transparent hover:scale-[1.02] hover:shadow-lg opacity-80'}
                                    ${OPTION_COLORS[idx % OPTION_COLORS.length]}
                                `}
                            >
                                <span className="text-white font-black text-3xl shrink-0 drop-shadow-sm ml-2 mr-4">
                                    {questionType === 'ORDERING' ? (idx + 1) : OPTION_LABELS[idx % OPTION_LABELS.length]}
                                </span>
                                <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder={questionType === 'ORDERING' ? `${idx + 1}. Sıradaki Öğe` : `Option ${OPTION_LABELS[idx % OPTION_LABELS.length]}`}
                                    className="flex-1 text-xl font-bold text-white border-none focus:outline-none bg-transparent placeholder:text-white/60 min-w-0"
                                    readOnly={questionType === 'TRUE_FALSE'}
                                />
                                {questionType !== 'ORDERING' && correctAnswer.includes(idx) && (
                                    <div className="absolute -top-3 -right-3 bg-white text-role-success rounded-full p-1 shadow-lg border-2 border-role-success transform rotate-12">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-12 pb-8">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="primary"
                    className="rounded-full px-12 py-4 text-xl font-bold hover:-translate-y-1 transition-transform whitespace-nowrap shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_50%)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                    onClick={onCancel}
                    disabled={isSaving}
                    variant="outline"
                    className="rounded-full px-8 py-4 text-xl font-bold bg-page text-secondary shadow-sm hover:text-primary transition-colors"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default QuestionEditor;
