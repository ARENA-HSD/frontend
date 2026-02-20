/**
 * HSD Arena - Quiz Service
 * 
 * Real API implementation for quiz CRUD operations
 */

import { get, post, patch, del } from '@/lib/axios';
import { API_ROUTES } from '@/lib/constants';
import type {
    Quiz,
    CreateQuizData,
    UpdateQuizData,
    ApiResponse
} from '@/types';

// ============================================================================
// Quiz API Calls
// ============================================================================

/**
 * Get all quizzes for an organization
 */
export const getQuizzes = async (orgDomain: string): Promise<ApiResponse<Quiz[]>> => {
    return await get<ApiResponse<Quiz[]>>(API_ROUTES.QUIZZES(orgDomain) + '/');
};

/**
 * Get single quiz by ID
 */
export const getQuiz = async (orgDomain: string, quizId: string): Promise<ApiResponse<Quiz>> => {
    return await get<ApiResponse<Quiz>>(API_ROUTES.QUIZ_BY_ID(orgDomain, quizId));
};

/**
 * Create new quiz
 */
export const createQuiz = async (
    orgDomain: string,
    data: CreateQuizData
): Promise<ApiResponse<Quiz>> => {
    return await post<ApiResponse<Quiz>>(API_ROUTES.QUIZZES(orgDomain) + '/', data);
};

/**
 * Update quiz
 */
export const updateQuiz = async (
    orgDomain: string,
    quizId: string,
    data: UpdateQuizData
): Promise<ApiResponse<Quiz>> => {
    return await patch<ApiResponse<Quiz>>(API_ROUTES.QUIZ_BY_ID(orgDomain, quizId), data);
};

/**
 * Delete quiz
 */
export const deleteQuiz = async (orgDomain: string, quizId: string): Promise<ApiResponse<void>> => {
    return await del<ApiResponse<void>>(API_ROUTES.QUIZ_BY_ID(orgDomain, quizId));
};
