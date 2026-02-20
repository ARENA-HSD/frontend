/**
 * HSD Arena - WebSocket Configuration
 * 
 * WebSocket client wrapper with event management and mock simulation.
 * Supports both real WebSocket connections and mock mode for development.
 */

import {
    WS_BASE_URL,
    USE_MOCK_WEBSOCKET,
    WSEventType,
    ANIMATION_DURATIONS,
} from './constants';

// ============================================================================
// Types
// ============================================================================

export type WSEventHandler = (data: any) => void;

export interface WebSocketMessage {
    type: WSEventType;
    data: any;
}

// ============================================================================
// Mock WebSocket Class
// ============================================================================

/**
 * Mock WebSocket implementation for development/testing
 * Simulates WebSocket behavior with local event handling
 */
class MockWebSocket {
    private url: string;
    private handlers: Map<WSEventType, Set<WSEventHandler>> = new Map();
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    // Public properties to match native WebSocket API
    public onopen: ((event: Event) => void) | null = null;
    public onclose: ((event: CloseEvent) => void) | null = null;
    public onerror: ((event: Event) => void) | null = null;
    public onmessage: ((event: MessageEvent) => void) | null = null;

    constructor(url: string) {
        this.url = url;
        this.simulateConnection();
    }

    /**
     * Simulate connection with delay
     */
    private simulateConnection(): void {
        console.log('🔌 Mock WebSocket: Connecting to', this.url);

        setTimeout(() => {
            this.isConnected = true;
            console.log('✅ Mock WebSocket: Connected');

            if (this.onopen) {
                this.onopen(new Event('open'));
            }
        }, 500);
    }

    /**
     * Send message through WebSocket
     */
    public send(data: string): void {
        if (!this.isConnected) {
            console.warn('⚠️ Mock WebSocket: Not connected, message queued');
            return;
        }

        try {
            const message: WebSocketMessage = JSON.parse(data);
            console.log('📤 Mock WS Send:', message);

            // Simulate server response based on event type
            this.simulateServerResponse(message);
        } catch (error) {
            console.error('❌ Mock WS: Invalid message format', error);
        }
    }

    /**
     * Close WebSocket connection
     */
    public close(): void {
        console.log('🔌 Mock WebSocket: Closing connection');
        this.isConnected = false;

        if (this.onclose) {
            this.onclose(new CloseEvent('close', { code: 1000, reason: 'Normal closure' }));
        }
    }

    /**
     * Simulate server responses based on client messages
     */
    private simulateServerResponse(message: WebSocketMessage): void {
        switch (message.type) {
            case WSEventType.JOIN_ROOM:
                this.simulateJoinRoom(message.data);
                break;

            case WSEventType.START_GAME:
                this.simulateStartGame(message.data);
                break;

            case WSEventType.SUBMIT_ANSWER:
                this.simulateSubmitAnswer(message.data);
                break;

            case WSEventType.NEXT_QUESTION:
                this.simulateNextQuestion(message.data);
                break;

            case WSEventType.KICK_PLAYER:
                this.simulateKickPlayer(message.data);
                break;
        }
    }

    /**
     * Simulate JOIN_ROOM response
     */
    private simulateJoinRoom(data: { pin: string; nickname: string }): void {
        setTimeout(() => {
            this.emitMessage({
                type: WSEventType.JOIN_SUCCESS,
                data: {
                    status: 'WAITING',
                    myNick: data.nickname + (Math.random() > 0.5 ? '' : '#1'),
                },
            });

            // Simulate lobby update to host
            setTimeout(() => {
                this.emitMessage({
                    type: WSEventType.LOBBY_UPDATE,
                    data: {
                        count: Math.floor(Math.random() * 50) + 1,
                    },
                });
            }, 500);
        }, 300);
    }

    /**
     * Simulate START_GAME response
     */
    private simulateStartGame(data: { gameId: string }): void {
        setTimeout(() => {
            this.emitMessage({
                type: WSEventType.QUESTION_START,
                data: {
                    questionIndex: 0,
                    text: 'Türkiye\'nin başkenti neresidir?',
                    mediaUrl: null,
                    options: [
                        { text: 'Ankara', color: 'teal' },
                        { text: 'İstanbul', color: 'pink' },
                        { text: 'İzmir', color: 'purple' },
                        { text: 'Bursa', color: 'orange' },
                    ],
                    timeLimit: 30,
                },
            });
        }, 300);
    }

    /**
     * Simulate SUBMIT_ANSWER response
     */
    private simulateSubmitAnswer(data: { questionId: string; answerIndex: number }): void {
        const isCorrect = data.answerIndex === 0; // Mock: first option is always correct
        const streak = isCorrect ? Math.floor(Math.random() * 8) : 0;

        setTimeout(() => {
            this.emitMessage({
                type: WSEventType.ANSWER_RESULT,
                data: {
                    correct: isCorrect,
                    earnedPoints: isCorrect ? 1250 : 0,
                    currentScore: Math.floor(Math.random() * 10000),
                    streak,
                },
            });
        }, 200);
    }

    /**
     * Simulate NEXT_QUESTION with scoreboard first
     */
    private simulateNextQuestion(data: { gameId: string }): void {
        // First show scoreboard
        setTimeout(() => {
            this.emitMessage({
                type: WSEventType.SHOW_SCOREBOARD,
                data: {
                    topPlayers: [
                        { nickname: 'Oyuncu1', score: 15000 },
                        { nickname: 'Oyuncu2', score: 14500 },
                        { nickname: 'Oyuncu3', score: 13200 },
                        { nickname: 'Oyuncu4', score: 12800 },
                        { nickname: 'Oyuncu5', score: 11500 },
                    ],
                },
            });

            // Then show next question or game over
            setTimeout(() => {
                const hasMoreQuestions = Math.random() > 0.3; // 70% chance of more questions

                if (hasMoreQuestions) {
                    this.emitMessage({
                        type: WSEventType.QUESTION_START,
                        data: {
                            questionIndex: Math.floor(Math.random() * 10) + 1,
                            text: 'Hangi gezegen Güneş Sistemi\'nin en büyüğüdür?',
                            mediaUrl: null,
                            options: [
                                { text: 'Jüpiter', color: 'teal' },
                                { text: 'Satürn', color: 'pink' },
                                { text: 'Mars', color: 'purple' },
                                { text: 'Neptün', color: 'orange' },
                            ],
                            timeLimit: 30,
                        },
                    });
                } else {
                    this.emitMessage({
                        type: WSEventType.GAME_OVER,
                        data: {
                            winner: 'Oyuncu1',
                            finalScores: [
                                { nickname: 'Oyuncu1', score: 15000 },
                                { nickname: 'Oyuncu2', score: 14500 },
                                { nickname: 'Oyuncu3', score: 13200 },
                            ],
                        },
                    });
                }
            }, 2000);
        }, 300);
    }

    /**
     * Simulate KICK_PLAYER
     */
    private simulateKickPlayer(data: { socketId: string; ban: boolean }): void {
        setTimeout(() => {
            // Send force disconnect to the kicked player
            this.emitMessage({
                type: WSEventType.FORCE_DISCONNECT,
                data: {
                    reason: 'Yönetici tarafından oyundan uzaklaştırıldınız',
                },
            });
        }, 100);
    }

    /**
     * Emit message to all handlers
     */
    private emitMessage(message: WebSocketMessage): void {
        console.log('📥 Mock WS Receive:', message);

        if (this.onmessage) {
            const event = new MessageEvent('message', {
                data: JSON.stringify(message),
            });
            this.onmessage(event);
        }
    }
}

// ============================================================================
// WebSocket Manager Class
// ============================================================================

export class WebSocketManager {
    private ws: WebSocket | MockWebSocket | null = null;
    private url: string;
    private handlers: Map<WSEventType, Set<WSEventHandler>> = new Map();
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 2000;

    constructor(endpoint: string) {
        this.url = `${WS_BASE_URL}${endpoint}`;
    }

    /**
     * Connect to WebSocket server
     */
    public connect(): void {
        try {
            console.log(`🔌 Connecting to WebSocket: ${this.url}`);

            // Use MockWebSocket in development or when USE_MOCK_WEBSOCKET is true
            if (USE_MOCK_WEBSOCKET || import.meta.env.DEV) {
                this.ws = new MockWebSocket(this.url);
            } else {
                this.ws = new WebSocket(this.url);
            }

            this.setupEventHandlers();
        } catch (error) {
            console.error('❌ WebSocket connection error:', error);
            this.handleReconnect();
        }
    }

    /**
     * Set up WebSocket event handlers
     */
    private setupEventHandlers(): void {
        if (!this.ws) return;

        this.ws.onopen = () => {
            console.log('✅ WebSocket connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onclose = (event) => {
            console.log('🔌 WebSocket disconnected', event.code, event.reason);
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
        };

        this.ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('❌ Failed to parse WebSocket message:', error);
            }
        };
    }

    /**
     * Handle incoming WebSocket message
     */
    private handleMessage(message: WebSocketMessage): void {
        const handlers = this.handlers.get(message.type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(message.data);
                } catch (error) {
                    console.error(`❌ Error in handler for ${message.type}:`, error);
                }
            });
        }
    }

    /**
     * Send message through WebSocket
     */
    public send(type: WSEventType, data: any): void {
        if (!this.ws) {
            console.warn('⚠️ WebSocket not connected');
            return;
        }

        const message: WebSocketMessage = { type, data };
        this.ws.send(JSON.stringify(message));
    }

    /**
     * Subscribe to WebSocket events
     */
    public on(type: WSEventType, handler: WSEventHandler): void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type)!.add(handler);
    }

    /**
     * Unsubscribe from WebSocket events
     */
    public off(type: WSEventType, handler: WSEventHandler): void {
        const handlers = this.handlers.get(type);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    /**
     * Handle reconnection logic
     */
    private handleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`🔄 Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
    }

    /**
     * Close WebSocket connection
     */
    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.handlers.clear();
    }

    /**
     * Check if WebSocket is connected
     */
    public isConnected(): boolean {
        if (this.ws instanceof MockWebSocket) {
            return (this.ws as any).isConnected;
        }
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

/**
 * Create WebSocket manager instance
 */
export const createWebSocketManager = (endpoint: string): WebSocketManager => {
    return new WebSocketManager(endpoint);
};

export default WebSocketManager;
