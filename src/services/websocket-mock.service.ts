/**
 * HSD Arena - Mock WebSocket Service
 * 
 * This is a mock implementation for development.
 * Replace with real WebSocket connection when backend is ready.
 */

import type {
    WebSocketEvent,
    WebSocketEventType,
    ParticipantJoinedEvent,
    QuizStartedEvent,
    QuestionStartedEvent,
    AnswerSubmittedEvent,
    QuestionEndedEvent,
    QuizEndedEvent
} from '@/types';

type EventCallback = (event: WebSocketEvent) => void;

class MockWebSocketService {
    private listeners: Map<WebSocketEventType, EventCallback[]> = new Map();
    private connected: boolean = false;
    private sessionId: string | null = null;

    /**
     * Connect to a quiz session
     */
    connect(sessionId: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.sessionId = sessionId;
                this.connected = true;
                console.log(`[MockWS] Connected to session: ${sessionId}`);
                resolve();
            }, 500);
        });
    }

    /**
     * Disconnect from current session
     */
    disconnect(): void {
        this.connected = false;
        this.sessionId = null;
        this.listeners.clear();
        console.log('[MockWS] Disconnected');
    }

    /**
     * Subscribe to event type
     */
    on(eventType: WebSocketEventType, callback: EventCallback): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)!.push(callback);
    }

    /**
     * Unsubscribe from event type
     */
    off(eventType: WebSocketEventType, callback: EventCallback): void {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event (for testing purposes)
     */
    emit<T = any>(type: WebSocketEventType, payload: T): void {
        const event: WebSocketEvent<T> = { type, payload };
        const callbacks = this.listeners.get(type);

        if (callbacks) {
            callbacks.forEach(callback => callback(event));
        }
    }

    /**
     * Send message to server (mock)
     */
    send(type: string, payload: any): void {
        if (!this.connected) {
            console.warn('[MockWS] Cannot send - not connected');
            return;
        }

        console.log(`[MockWS] Sending:`, { type, payload });

        // Simulate responses based on message type
        switch (type) {
            case 'start_quiz':
                this.simulateQuizStart();
                break;
            case 'next_question':
                this.simulateNextQuestion();
                break;
            case 'submit_answer':
                this.simulateAnswerSubmit(payload);
                break;
            case 'end_quiz':
                this.simulateQuizEnd();
                break;
        }
    }

    // ============================================
    // SIMULATION METHODS
    // ============================================

    private simulateQuizStart(): void {
        setTimeout(() => {
            this.emit<QuizStartedEvent>('quiz_started', {
                sessionId: this.sessionId!,
                firstQuestionIndex: 0
            });
        }, 1000);
    }

    private simulateNextQuestion(): void {
        setTimeout(() => {
            // This would come from actual quiz data
            this.emit<QuestionStartedEvent>('question_started', {
                questionIndex: 0,
                question: {
                    id: 'q1',
                    quizId: 'quiz1',
                    text: 'Sample question?',
                    answers: [
                        { id: 'a1', text: 'Answer 1', isCorrect: true },
                        { id: 'a2', text: 'Answer 2', isCorrect: false },
                        { id: 'a3', text: 'Answer 3', isCorrect: false },
                        { id: 'a4', text: 'Answer 4', isCorrect: false }
                    ],
                    order: 0
                },
                timeLimit: 20
            });
        }, 500);
    }

    private simulateAnswerSubmit(payload: any): void {
        // Echo back answer submission
        setTimeout(() => {
            this.emit<AnswerSubmittedEvent>('answer_submitted', {
                nickname: payload.nickname,
                answerId: payload.answerId,
                answerTime: payload.answerTime
            });
        }, 100);
    }

    private simulateQuizEnd(): void {
        setTimeout(() => {
            this.emit<QuizEndedEvent>('quiz_ended', {
                finalLeaderboard: [
                    { rank: 1, nickname: 'Player1', points: 1000, correctAnswers: 5, streak: 3 },
                    { rank: 2, nickname: 'Player2', points: 800, correctAnswers: 4, streak: 0 },
                    { rank: 3, nickname: 'Player3', points: 600, correctAnswers: 3, streak: 2 }
                ]
            });
        }, 1000);
    }

    /**
     * Check connection status
     */
    isConnected(): boolean {
        return this.connected;
    }

    /**
     * Get current session ID
     */
    getSessionId(): string | null {
        return this.sessionId;
    }
}

// Export singleton instance
export const mockWebSocket = new MockWebSocketService();
