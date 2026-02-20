/**
 * HSD Arena - WebSocket Service
 * 
 * Real-time game engine client using native WebSocket.
 * Handles connection, reconnection, and event dispatching.
 */

import { WS_BASE_URL } from '@/lib/constants';

// ============================================================================
// Types
// ============================================================================

export type WSEventHandler = (payload: any) => void;

export interface WSMessage {
    type: string;
    data: any;
}

// ============================================================================
// WebSocket Event Constants (matching backend)
// ============================================================================

export const WS_EVENTS = {
    // Client → Server
    JOIN_ROOM: 'JOIN_ROOM',
    KICK_PLAYER: 'KICK_PLAYER',
    START_GAME: 'START_GAME',
    SUBMIT_ANSWER: 'SUBMIT_ANSWER',
    SHOW_LEADERBOARD: 'SHOW_LEADERBOARD',
    NEXT_QUESTION: 'NEXT_QUESTION',

    // Server → Client (matches games.service.ts)
    ROOM_JOINED: 'ROOM_JOINED',           // → joiner on join
    PLAYER_JOINED: 'PLAYER_JOINED',       // → broadcast on join
    PLAYER_KICKED: 'PLAYER_KICKED',       // → broadcast on kick
    LOBBY_UPDATE: 'LOBBY_UPDATE',         // → broadcast on disconnect (controller)
    FORCE_DISCONNECT: 'FORCE_DISCONNECT', // defensive (not actively sent)
    QUESTION_START: 'QUESTION_START',
    ANSWER_RESULT: 'ANSWER_RESULT',       // → answerer personal result
    QUESTION_END: 'QUESTION_END',         // → host stats
    LEADERBOARD_RESULT: 'LEADERBOARD_RESULT',
    GAME_OVER: 'GAME_OVER',
    ERROR: 'ERROR',
} as const;

// ============================================================================
// GameWebSocket Class
// ============================================================================

class GameWebSocket {
    private ws: WebSocket | null = null;
    private listeners: Map<string, Set<WSEventHandler>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private shouldReconnect = false;
    private url: string = '';
    private _isConnected = false;

    get isConnected(): boolean {
        return this._isConnected;
    }

    /**
     * Connect to the WebSocket server
     */
    connect(path?: string): Promise<void> {
        const wsPath = path || import.meta.env.VITE_WS_PATH || '/ws';
        return new Promise((resolve, reject) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            this.url = `${WS_BASE_URL}${wsPath}`;
            this.shouldReconnect = true;

            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log('🔌 WebSocket connected:', this.url);
                    this._isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: WSMessage = JSON.parse(event.data);
                        console.log('📩 WS received:', message.type, message.data);
                        this.dispatch(message.type, message.data);
                    } catch (err) {
                        console.error('Failed to parse WS message:', event.data);
                    }
                };

                this.ws.onclose = (event) => {
                    console.log('🔌 WebSocket closed:', event.code, event.reason);
                    this._isConnected = false;

                    if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.attemptReconnect();
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('🔌 WebSocket error:', error);
                    this._isConnected = false;
                    if (this.reconnectAttempts === 0) {
                        reject(error);
                    }
                };
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void {
        this.shouldReconnect = false;
        this._isConnected = false;
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        this.listeners.clear();
        this.reconnectAttempts = 0;
    }

    /**
     * Send a message to the server
     */
    emit(event: string, payload: any = {}): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ WebSocket not connected, cannot send:', event);
            return;
        }

        const message: WSMessage = { type: event, data: payload };
        console.log('📤 WS sending:', event, payload);
        this.ws.send(JSON.stringify(message));
    }

    /**
     * Register an event listener
     */
    on(event: string, handler: WSEventHandler): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler);

        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(handler);
        };
    }

    /**
     * Remove an event listener
     */
    off(event: string, handler: WSEventHandler): void {
        this.listeners.get(event)?.delete(handler);
    }

    // ============================
    // Convenience Methods
    // ============================

    /** Participant joins a game room */
    joinRoom(pin: string, nickname: string): void {
        this.emit(WS_EVENTS.JOIN_ROOM, { pin, nickname });
    }

    /** Host starts the game */
    startGame(gameId: string): void {
        this.emit(WS_EVENTS.START_GAME, { gameId });
    }

    /** Participant submits an answer */
    submitAnswer(questionId: string, answerIndex: number): void {
        this.emit(WS_EVENTS.SUBMIT_ANSWER, { questionId, answerIndex });
    }

    /** Host requests leaderboard */
    showLeaderboard(gameId: string): void {
        this.emit(WS_EVENTS.SHOW_LEADERBOARD, { gameId });
    }

    /** Host moves to next question */
    nextQuestion(gameId: string): void {
        this.emit(WS_EVENTS.NEXT_QUESTION, { gameId });
    }

    /** Host kicks a player */
    kickPlayer(socketId: string, ban: boolean = false): void {
        this.emit(WS_EVENTS.KICK_PLAYER, { socketId, ban });
    }

    // ============================
    // Private Methods
    // ============================

    private dispatch(event: string, payload: any): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(payload);
                } catch (err) {
                    console.error(`Error in handler for ${event}:`, err);
                }
            });
        }
    }

    private attemptReconnect(): void {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            if (this.shouldReconnect) {
                this.connect().catch(() => {
                    console.warn('Reconnect attempt failed');
                });
            }
        }, delay);
    }
}

// ============================================================================
// Singleton Export
// ============================================================================

/** Shared WebSocket instance for the entire app */
export const gameSocket = new GameWebSocket();

export default GameWebSocket;
