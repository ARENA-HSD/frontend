/**
 * HSD Arena - Game Service
 * 
 * Real API implementation for game session operations
 */

import { get, post, del } from '@/lib/axios';
import { API_ROUTES } from '@/lib/constants';
import type { GameSession, GameSummary } from '@/types';

// ============================================================================
// Game API Calls
// ============================================================================

/**
 * Create a new game session
 */
export const createGame = async (quizId: string): Promise<GameSession> => {
    return await post<GameSession>(API_ROUTES.GAMES + '/', { quizId });
};

/**
 * Get game summary
 */
export const getGameSummary = async (gameId: string): Promise<GameSummary> => {
    return await get<GameSummary>(API_ROUTES.GAME_BY_ID(gameId));
};

/**
 * Delete game and cleanup
 */
export const deleteGame = async (gameId: string): Promise<{ success: boolean }> => {
    return await del<{ success: boolean }>(API_ROUTES.GAME_BY_ID(gameId));
};
