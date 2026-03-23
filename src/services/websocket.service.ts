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
    SET_NICKNAME: 'SET_NICKNAME',
    SUBMIT_ANSWER: 'SUBMIT_ANSWER',
    RECONNECT: 'RECONNECT',

    // Server → Client (matches games.service.ts)
    JOIN_SUCCESS: 'JOIN_SUCCESS',
    NEED_NICKNAME: 'NEED_NICKNAME',
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
// Session Storage Helpers (role-aware: host vs player)
// ============================================================================

export type SessionRole = 'host' | 'player';

const HOST_SESSION_PREFIX = 'arena_host_session_';
const PLAYER_SESSION_PREFIX = 'arena_player_session_';
const PIN_KEY = 'arena_pin';
const ROLE_KEY = 'arena_role';

function getPrefix(role: SessionRole): string {
    return role === 'host' ? HOST_SESSION_PREFIX : PLAYER_SESSION_PREFIX;
}

function saveSession(pin: string, sessionToken: string, role: SessionRole): void {
    localStorage.setItem(`${getPrefix(role)}${pin}`, sessionToken);
    localStorage.setItem(PIN_KEY, pin);
    localStorage.setItem(ROLE_KEY, role);
}

function getSession(role?: SessionRole): { pin: string; sessionToken: string; role: SessionRole } | null {
    const pin = localStorage.getItem(PIN_KEY);
    const storedRole = (role || localStorage.getItem(ROLE_KEY) || 'player') as SessionRole;
    if (!pin) return null;
    const token = localStorage.getItem(`${getPrefix(storedRole)}${pin}`);
    if (!token) return null;
    return { pin, sessionToken: token, role: storedRole };
}

function clearSession(role?: SessionRole): void {
    const pin = localStorage.getItem(PIN_KEY);
    if (pin) {
        if (role) {
            localStorage.removeItem(`${getPrefix(role)}${pin}`);
        } else {
            // Clear both if role not specified
            localStorage.removeItem(`${HOST_SESSION_PREFIX}${pin}`);
            localStorage.removeItem(`${PLAYER_SESSION_PREFIX}${pin}`);
        }
    }
    localStorage.removeItem(PIN_KEY);
    localStorage.removeItem(ROLE_KEY);
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
    private _currentRole: SessionRole = 'player';

    get isConnected(): boolean {
        return this._isConnected;
    }

    get isReconnecting(): boolean {
        return this._isReconnecting;
    }

    /**
     * Connect to the WebSocket server.
     * Retries internally up to 3 times before rejecting — handles
     * Cloudflare edge / first-attempt failures transparently.
     */
    connect(path?: string): Promise<void> {
        const wsPath = path || import.meta.env.VITE_WS_PATH || '/ws';

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        this.url = `${WS_BASE_URL}${wsPath}`;
        this.shouldReconnect = true;

        return new Promise((resolve, reject) => {
            let settled = false;
            let attempt = 0;
            const maxInitialAttempts = 3;

            const tryConnect = () => {
                attempt++;

                try {
                    // Clean up previous broken socket before retrying
                    if (this.ws) {
                        this.ws.onopen = null;
                        this.ws.onclose = null;
                        this.ws.onerror = null;
                        this.ws.onmessage = null;
                    }

                    this.ws = new WebSocket(this.url);

                    this.ws.onopen = () => {
                        console.log('🔌 WebSocket connected:', this.url);
                        this._isConnected = true;
                        this.reconnectAttempts = 0;
                        if (!settled) {
                            settled = true;
                            resolve();
                        }
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

                        // Still in initial connect phase — retry before rejecting
                        if (!settled) {
                            if (attempt < maxInitialAttempts) {
                                const delay = 1000 * attempt;
                                console.log(`🔄 Connect attempt ${attempt}/${maxInitialAttempts} failed, retrying in ${delay}ms...`);
                                setTimeout(tryConnect, delay);
                                return;
                            }
                            // All initial attempts exhausted
                            settled = true;
                            reject(new Error('WebSocket connection failed after retries'));
                            return;
                        }

                        // Connection was established and now dropped — normal reconnection
                        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                            this.attemptReconnect();
                        }
                    };

                    this.ws.onerror = (error) => {
                        console.error('🔌 WebSocket error:', error);
                        this._isConnected = false;
                        // Don't reject here — onclose will handle retry/rejection
                    };
                } catch (err) {
                    if (!settled) {
                        if (attempt < maxInitialAttempts) {
                            setTimeout(tryConnect, 1000 * attempt);
                        } else {
                            settled = true;
                            reject(err);
                        }
                    }
                }
            };

            tryConnect();
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

                // If we have a session, rejoin with stored token (new protocol)
                if (session) {
                    this._currentPin = session.pin;
                    this._currentRole = session.role;
                    this.emit(WS_EVENTS.JOIN_ROOM, {
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
                    saveSession(this._currentPin, message.data.sessionToken, this._currentRole);
                }
                break;

            case WS_EVENTS.RECONNECT_SUCCESS:
                this._isReconnecting = false;
                this.reconnectAttempts = 0;
                break;

            case WS_EVENTS.GAME_OVER:
            case WS_EVENTS.FORCE_DISCONNECT:
                clearSession(this._currentRole);
                break;

            case WS_EVENTS.ERROR:
                // If we get ERROR during reconnect, treat as failed
                if (this._isReconnecting) {
                    this._isReconnecting = false;
                    clearSession(this._currentRole);
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
            // CRITICAL: Null out handlers BEFORE close() to prevent
            // the old socket's onclose from triggering attemptReconnect()
            // when connect() is called immediately after disconnect().
            this.ws.onopen = null;
            this.ws.onclose = null;
            this.ws.onerror = null;
            this.ws.onmessage = null;
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

    /** Join a game room as host or player */
    joinRoom(pin: string, sessionToken?: string, role: SessionRole = 'player'): void {
        // Clear any stale session from a previous game to prevent token conflicts
        const oldPin = localStorage.getItem(PIN_KEY);
        if (oldPin && oldPin !== pin) {
            clearSession(); // wipe old game's tokens completely
        }

        this._currentPin = pin;
        this._currentRole = role;
        localStorage.setItem(PIN_KEY, pin);
        localStorage.setItem(ROLE_KEY, role);
        this.emit(WS_EVENTS.JOIN_ROOM, { pin, sessionToken });
    }

    /** Participant set nickname */
    setNickname(pin: string, nickname: string): void {
        this.emit(WS_EVENTS.SET_NICKNAME, { pin, nickname });
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
        this._currentRole = session.role;
        this.dispatch(WS_EVENTS.RECONNECTING, { attempt: 1, maxAttempts: this.maxReconnectAttempts });

        try {
            await this.connect();
            // Use JOIN_ROOM with sessionToken (new protocol)
            this.emit(WS_EVENTS.JOIN_ROOM, {
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
