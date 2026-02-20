/**
 * HSD Arena - Question Service
 * 
 * Real API implementation for question CRUD operations
 */

import { get, post, patch, del } from '@/lib/axios';
import { API_ROUTES } from '@/lib/constants';
import type {
    Question,
    CreateQuestionData,
    UpdateQuestionData,
    ApiResponse
} from '@/types';

// ============================================================================
// Question API Calls
// ============================================================================

/**
 * Get all questions for a quiz
 */
export const getQuestions = async (
    orgDomain: string,
    quizId: string
): Promise<ApiResponse<Question[]>> => {
    return await get<ApiResponse<Question[]>>(API_ROUTES.QUESTIONS(orgDomain, quizId) + '/');
};

/**
 * Get single question
 */
export const getQuestion = async (
    orgDomain: string,
    quizId: string,
    questionId: string
): Promise<ApiResponse<Question>> => {
    return await get<ApiResponse<Question>>(
        API_ROUTES.QUESTION_BY_ID(orgDomain, quizId, questionId)
    );
};

/**
 * Create new question
 */
export const createQuestion = async (
    orgDomain: string,
    quizId: string,
    data: CreateQuestionData
): Promise<ApiResponse<Question>> => {
    return await post<ApiResponse<Question>>(
        API_ROUTES.QUESTIONS(orgDomain, quizId) + '/',
        data
    );
};

/**
 * Update question
 */
export const updateQuestion = async (
    orgDomain: string,
    quizId: string,
    questionId: string,
    data: UpdateQuestionData
): Promise<ApiResponse<Question>> => {
    return await patch<ApiResponse<Question>>(
        API_ROUTES.QUESTION_BY_ID(orgDomain, quizId, questionId),
        data
    );
};

/**
 * Delete question
 */
export const deleteQuestion = async (
    orgDomain: string,
    quizId: string,
    questionId: string
): Promise<ApiResponse<void>> => {
    return await del<ApiResponse<void>>(
        API_ROUTES.QUESTION_BY_ID(orgDomain, quizId, questionId)
    );
};

/**
 * Reorder questions
 */
export const reorderQuestions = async (
    orgDomain: string,
    quizId: string,
    questionIds: string[]
): Promise<ApiResponse<void>> => {
    return await post<ApiResponse<void>>(
        API_ROUTES.QUESTIONS_REORDER(orgDomain, quizId),
        { questionIds }
    );
};
