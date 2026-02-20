/**
 * HSD Arena - Quiz Type Definitions (Based on API Documentation)
 */

// ============================================
// QUIZ
// ============================================

export type QuizMode = 'PERSONAL' | 'STAGE';

export interface Quiz {
    id: string;
    organizationId: string;
    title: string;
    defaultMode: QuizMode;
    questionCount?: number;
    createdBy: string;
    createdAt: string;
    updatedAt?: string;
    isDeleted?: boolean;
    questions?: Question[];
}

export interface CreateQuizData {
    title: string;
    defaultMode: QuizMode;
}

export interface UpdateQuizData {
    title?: string;
    defaultMode?: QuizMode;
}

// ============================================
// QUESTION
// ============================================

export interface Question {
    id: string;
    quizId: string;
    text: string;
    mediaUrl?: string;
    timeLimit: number;       // 10-120 seconds
    points: number;          // min 100
    options: string[];       // exactly 4 options
    correctIndex: number;    // 0-3
    orderIndex: number;
}

export interface CreateQuestionData {
    text: string;
    mediaUrl?: string;
    timeLimit: number;
    points: number;
    options: string[];       // exactly 4
    correctIndex: number;    // 0-3
    orderIndex: number;
}

export interface UpdateQuestionData {
    text?: string;
    mediaUrl?: string;
    timeLimit?: number;
    points?: number;
    options?: string[];
    correctIndex?: number;
    orderIndex?: number;
}

// ============================================
// GAME SESSION
// ============================================

export interface CreateGameData {
    quizId: string;
}

export interface GameSession {
    success: boolean;
    gameId: string;
    pin: string;
    mode: string;
}

export interface GameSummary {
    success: boolean;
    status: string;
    totalPlayers: number;
    winner?: string;
    finalScores?: any;
}

// ============================================
// PARTICIPANT (WebSocket State)
// ============================================

export interface Participant {
    nickname: string;
    sessionId?: string;
    joinedAt?: string;
}

// ============================================
// LEADERBOARD
// ============================================

export interface LeaderboardEntry {
    rank: number;
    nickname: string;
    points: number;
    correctAnswers?: number;
    streak: number;
}

// ============================================
// WEBSOCKET EVENT PAYLOADS
// (Aligned with games.service.ts + games.controller.ts)
// ============================================

/** JOIN_ROOM: Client → Server */
export interface WSJoinRoomPayload {
    pin: string;
    nickname: string;
}

/** ROOM_JOINED: Server → joiner (handleJoinRoom) */
export interface WSRoomJoinedPayload {
    pin: string;
    nickname: string;
    playerCount: number;
}

/** PLAYER_JOINED: Server → broadcast (handleJoinRoom) */
export interface WSPlayerJoinedPayload {
    nickname: string;
    playerCount: number;
}

/** LOBBY_UPDATE: Server → broadcast on disconnect (controller close) */
export interface WSLobbyUpdatePayload {
    players: Array<{ socketId: string; nickname: string }>;
    recentPlayers: string[];
    totalPlayers: number;
}

/** KICK_PLAYER: Host → Server */
export interface WSKickPlayerPayload {
    socketId: string;
    ban: boolean;
}

/** PLAYER_KICKED: Server → broadcast (handleKickPlayer) */
export interface WSPlayerKickedPayload {
    nickname: string;
}

/** FORCE_DISCONNECT: Server → Client (defensive, not actively sent) */
export interface WSForceDisconnectPayload {
    reason: string;
}

/** QUESTION_START: Server → All (sendQuestionStart, filterQuestionByMode) */
export interface WSQuestionStartPayload {
    qIndex: number;
    time: number;
    serverTime: number;
    mode: 'PERSONAL' | 'STAGE';
    // PERSONAL mode includes these:
    text?: string;
    mediaUrl?: string;
    // Both modes include options (STAGE mode has text='')
    options?: Array<{ text: string; color: string }>;
}

/** SUBMIT_ANSWER: Client → Server */
export interface WSSubmitAnswerPayload {
    questionId: string;
    answerIndex: number;
}

/** ANSWER_RESULT: Server → answerer (handleSubmitAnswer) */
export interface WSAnswerResultPayload {
    correct: boolean;
    points: number;
    newScore: number;
    rank: number;
    rankChange: number; // positive = rank up
    streak: number;
}

/** QUESTION_END: Server → Host (showQuestionEnd) */
export interface WSQuestionEndHostPayload {
    qIndex: number;
    answerStats: Record<string, number>; // { "0": 15, "1": 5, "2": 40, "3": 0 }
    streakLeaders: Array<{ nick: string; streak: number }>;
}

/** QUESTION_END: Server → Players (showQuestionEnd) */
export interface WSQuestionEndPlayerPayload {
    qIndex: number;
    streakLeaders: Array<{ nick: string; streak: number }>;
}

/** LEADERBOARD_RESULT: Server → Host (showLeaderboard) */
export interface WSLeaderboardHostPayload {
    top5: Array<{ nick: string; score: number }>;
    recentPlayers: string[];
}

/** LEADERBOARD_RESULT: Server → Player (showLeaderboard) */
export interface WSLeaderboardPlayerPayload {
    top5: Array<{ nick: string; score: number }>;
}

/** GAME_OVER: Server → All (handleNextQuestion) */
export interface WSGameOverPayload {
    finalScores: Array<{ nickname: string; score: number }>;
}

/** Generic WebSocket event wrapper */
export type WebSocketEventType =
    | 'JOIN_ROOM'
    | 'KICK_PLAYER'
    | 'START_GAME'
    | 'SUBMIT_ANSWER'
    | 'SHOW_LEADERBOARD'
    | 'NEXT_QUESTION'
    | 'ROOM_JOINED'
    | 'PLAYER_JOINED'
    | 'PLAYER_KICKED'
    | 'LOBBY_UPDATE'
    | 'FORCE_DISCONNECT'
    | 'QUESTION_START'
    | 'ANSWER_RESULT'
    | 'QUESTION_END'
    | 'LEADERBOARD_RESULT'
    | 'GAME_OVER'
    | 'ERROR';

export interface WebSocketEvent<T = any> {
    type: WebSocketEventType;
    data: T;
}

