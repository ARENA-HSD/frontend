/**
 * HSD Arena - useQuizImportExport Hook
 *
 * Handles quiz import (JSON file upload) and export (JSON download).
 */

import { useState, useCallback } from 'react';
import { quizService } from '@/services';
import { useAuth } from './useAuth';
import { useSubdomain } from './useSubdomain';
import type { ImportQuestionsRequest } from '@/types';

interface UseQuizImportExportReturn {
    /** Import questions from a JSON file into a quiz */
    importQuestions: (orgDomain: string, quizId: string, file: File) => Promise<boolean>;
    /** Export quiz questions as a downloadable JSON file */
    exportQuestions: (orgDomain: string, quizId: string, quizTitle?: string) => Promise<boolean>;
    /** Whether an import operation is in progress */
    isImporting: boolean;
    /** Whether an export operation is in progress */
    isExporting: boolean;
    /** Last error message, if any */
    error: string | null;
    /** Clear the error state */
    clearError: () => void;
}

/**
 * Decode HTML entities (&#39; → ', &amp; → &, etc.) in all string values recursively.
 */
const decodeHtmlEntities = (value: unknown): unknown => {
    if (typeof value === 'string') {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = value;
        return textarea.value;
    }
    if (Array.isArray(value)) {
        return value.map(decodeHtmlEntities);
    }
    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            result[k] = decodeHtmlEntities(v);
        }
        return result;
    }
    return value;
};

export const useQuizImportExport = (): UseQuizImportExportReturn => {
    const { user } = useAuth();
    const subdomain = useSubdomain();
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    /**
     * Read a JSON file and import its questions into the given quiz.
     */
    const importQuestions = useCallback(
        async (orgDomain: string, quizId: string, file: File): Promise<boolean> => {
            if (!subdomain || !user?.id) {
                setError('Kullanıcı veya organizasyon bilgisi bulunamadı.');
                return false;
            }

            setIsImporting(true);
            setError(null);

            try {
                // Read file as ArrayBuffer and decode as UTF-8 (handles any encoding)
                const buffer = await file.arrayBuffer();
                const decoder = new TextDecoder('utf-8');
                let text = decoder.decode(buffer);
                // Strip UTF-8 BOM if present
                if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
                let parsed: ImportQuestionsRequest;

                try {
                    const raw = JSON.parse(text);
                    // Decode HTML entities (&#39; → ' etc.) in all string values
                    const json = decodeHtmlEntities(raw) as any;
                    // Accept both { questions: [...] } and bare array [...]
                    if (Array.isArray(json)) {
                        parsed = { questions: json };
                    } else if (json.questions && Array.isArray(json.questions)) {
                        parsed = json as ImportQuestionsRequest;
                    } else {
                        throw new Error('invalid');
                    }
                } catch {
                    setError('Geçersiz JSON formatı. Dosya { "questions": [...] } yapısında olmalıdır.');
                    return false;
                }

                if (parsed.questions.length === 0) {
                    setError('Dosyada soru bulunamadı.');
                    return false;
                }

                await quizService.importQuiz(subdomain, quizId, parsed);

                return true;
            } catch (err: any) {
                const message = err?.response?.data?.message || err?.message || 'İçe aktarma sırasında bir hata oluştu.';
                setError(message);
                return false;
            } finally {
                setIsImporting(false);
            }
        },
        [subdomain, user]
    );

    /**
     * Export quiz questions and trigger a JSON file download.
     */
    const exportQuestions = useCallback(
        async (orgDomain: string, quizId: string, quizTitle?: string): Promise<boolean> => {
            setIsExporting(true);
            setError(null);

            try {
                const response = await quizService.exportQuiz(orgDomain, quizId);
                const rawData = (response as any)?.data ?? response;

                // Decode HTML entities (&#39; → ' etc.) before writing
                const data = decodeHtmlEntities(rawData);

                // Create downloadable JSON blob with UTF-8 BOM for universal compatibility
                const jsonStr = JSON.stringify(data, null, 2);
                const blob = new Blob(['\uFEFF' + jsonStr], {
                    type: 'application/json;charset=utf-8',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${(quizTitle || 'quiz').replace(/\s+/g, '_')}_export.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                return true;
            } catch (err: any) {
                const message = err?.response?.data?.message || err?.message || 'Dışa aktarma sırasında bir hata oluştu.';
                setError(message);
                return false;
            } finally {
                setIsExporting(false);
            }
        },
        []
    );

    return {
        importQuestions,
        exportQuestions,
        isImporting,
        isExporting,
        error,
        clearError,
    };
};
