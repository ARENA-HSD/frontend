/**
 * HSD Arena - WebSocket Service
 * 
 * Real-time game engine client using native WebSocket.
 * Handles connection, reconnection with session tokens, and event dispatching.
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
    SUBMIT_ANSWER: 'SUBMIT_ANSWER',
    RECONNECT: 'RECONNECT',

    // Server → Client (matches games.service.ts)
    JOIN_SUCCESS: 'JOIN_SUCCESS',
    FORCE_DISCONNECT: 'FORCE_DISCONNECT',

    // Host → Server
    KICK_PLAYER: 'KICK_PLAYER',
    START_GAME: 'START_GAME',
    SHOW_LEADERBOARD: 'SHOW_LEADERBOARD',
    NEXT_QUESTION: 'NEXT_QUESTION',

    // Server → Host
    LOBBY_UPDATE: 'LOBBY_UPDATE',

    // Server → All
    PLAYER_JOINED: 'PLAYER_JOINED',
    PLAYER_KICKED: 'PLAYER_KICKED',
    GAME_STARTING: 'GAME_STARTING',
    QUESTION_START: 'QUESTION_START',
    QUESTION_END: 'QUESTION_END',
    LEADERBOARD_RESULT: 'LEADERBOARD_RESULT',
    GAME_OVER: 'GAME_OVER',
    ERROR: 'ERROR',

    // Reconnect events
    RECONNECT_SUCCESS: 'RECONNECT_SUCCESS',
    PLAYER_DISCONNECTED: 'PLAYER_DISCONNECTED',
    PLAYER_RECONNECTED: 'PLAYER_RECONNECTED',

    // Internal events (client-only, for UI state)
    RECONNECTING: 'RECONNECTING',
    RECONNECT_FAILED: 'RECONNECT_FAILED',
} as const;

// ============================================================================
// Session Storage Helpers
// ============================================================================

const SESSION_KEY_PREFIX = 'arena_session_';
const PIN_KEY = 'arena_pin';

function saveSession(pin: string, sessionToken: string): void {
    localStorage.setItem(`${SESSION_KEY_PREFIX}${pin}`, sessionToken);
    localStorage.setItem(PIN_KEY, pin);
}

function getSession(): { pin: string; sessionToken: string } | null {
    const pin = localStorage.getItem(PIN_KEY);
    if (!pin) return null;
    const token = localStorage.getItem(`${SESSION_KEY_PREFIX}${pin}`);
    if (!token) return null;
    return { pin, sessionToken: token };
}

function clearSession(): void {
    const pin = localStorage.getItem(PIN_KEY);
    if (pin) localStorage.removeItem(`${SESSION_KEY_PREFIX}${pin}`);
    localStorage.removeItem(PIN_KEY);
}

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
    private _isReconnecting = false;
    private _currentPin: string = '';

    get isConnected(): boolean {
        return this._isConnected;
    }

    get isReconnecting(): boolean {
        return this._isReconnecting;
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
                        this.handleInternalEvents(message);
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
     * Attempt to reconnect with exponential backoff.
     * If a session token exists, sends RECONNECT event after connecting.
     */
    private attemptReconnect(): void {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 10000);

        const session = getSession();

        if (session) {
            this._isReconnecting = true;
            this.dispatch(WS_EVENTS.RECONNECTING, {
                attempt: this.reconnectAttempts,
                maxAttempts: this.maxReconnectAttempts,
            });
        }

        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(async () => {
            if (!this.shouldReconnect) return;

            try {
                // Temporarily prevent recursive reconnect from inner onclose
                this.shouldReconnect = false;
                await this.connectInternal();
                this.shouldReconnect = true;

                // If we have a session, send RECONNECT event
                if (session) {
                    this.emit(WS_EVENTS.RECONNECT, {
                        pin: session.pin,
                        sessionToken: session.sessionToken,
                    });
                }
            } catch {
                this.shouldReconnect = true;
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                } else {
                    this._isReconnecting = false;
                    this.dispatch(WS_EVENTS.RECONNECT_FAILED, {
                        reason: 'Maksimum yeniden bağlanma denemesine ulaşıldı',
                    });
                    clearSession();
                }
            }
        }, delay);
    }

    /**
     * Internal connect - opens WebSocket without modifying shouldReconnect.
     */
    private connectInternal(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log('🔌 WebSocket reconnected:', this.url);
                    this._isConnected = true;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: WSMessage = JSON.parse(event.data);
                        console.log('📩 WS received:', message.type, message.data);
                        this.handleInternalEvents(message);
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

                this.ws.onerror = () => {
                    this._isConnected = false;
                    reject(new Error('WebSocket connection failed'));
                };
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Handle internal events: auto-save session, auto-clear on game over, etc.
     */
    private handleInternalEvents(message: WSMessage): void {
        switch (message.type) {
            case WS_EVENTS.JOIN_SUCCESS:
                if (message.data?.sessionToken && this._currentPin) {
                    saveSession(this._currentPin, message.data.sessionToken);
                }
                break;

            case WS_EVENTS.RECONNECT_SUCCESS:
                this._isReconnecting = false;
                this.reconnectAttempts = 0;
                break;

            case WS_EVENTS.GAME_OVER:
                clearSession();
                break;

            case WS_EVENTS.ERROR:
                // If we get ERROR during reconnect, treat as failed
                if (this._isReconnecting) {
                    this._isReconnecting = false;
                    clearSession();
                    this.dispatch(WS_EVENTS.RECONNECT_FAILED, {
                        reason: message.data?.message || 'Oturum süresi doldu',
                    });
                }
                break;
        }
    }

    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void {
        this.shouldReconnect = false;
        this._isConnected = false;
        this._isReconnecting = false;
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        this.listeners.clear();
        this.reconnectAttempts = 0;
    }

    /**
     * Disconnect and clear session data
     */
    disconnectAndClear(): void {
        clearSession();
        this.disconnect();
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
        this._currentPin = pin;
        localStorage.setItem(PIN_KEY, pin);
        this.emit(WS_EVENTS.JOIN_ROOM, { pin, nickname });
    }

    /** Host starts the game */
    startGame(gameId: string): void {
        this.emit(WS_EVENTS.START_GAME, { gameId });
    }

    /** Participant submits an answer */
    submitAnswer(answerIndex: number): void {
        this.emit(WS_EVENTS.SUBMIT_ANSWER, { answerIndex });
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
    kickPlayer(nickname: string, ban: boolean = false): void {
        this.emit(WS_EVENTS.KICK_PLAYER, { nickname, ban });
    }

    /**
     * Manually trigger reconnect using stored session.
     * Useful for page-refresh scenarios.
     */
    async reconnectWithSession(): Promise<boolean> {
        const session = getSession();
        if (!session) return false;

        this._isReconnecting = true;
        this._currentPin = session.pin;
        this.dispatch(WS_EVENTS.RECONNECTING, { attempt: 1, maxAttempts: this.maxReconnectAttempts });

        try {
            await this.connect();
            this.emit(WS_EVENTS.RECONNECT, {
                pin: session.pin,
                sessionToken: session.sessionToken,
            });
            return true;
        } catch {
            this._isReconnecting = false;
            this.dispatch(WS_EVENTS.RECONNECT_FAILED, { reason: 'Sunucuya bağlanılamadı' });
            return false;
        }
    }

    /** Check if there is a stored session available for reconnect */
    hasSession(): boolean {
        return getSession() !== null;
    }

    /** Get stored session info */
    getSessionInfo() {
        return getSession();
    }

    /** Clear stored session */
    clearStoredSession(): void {
        clearSession();
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
}

// ============================================================================
// Singleton Export
// ============================================================================

/** Shared WebSocket instance for the entire app */
export const gameSocket = new GameWebSocket();

export default GameWebSocket;
