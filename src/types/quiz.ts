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

export type color = "red" | "blue" | "green" | "yellow" | "orange" | "purple" | "pink" | "brown" | "black" | "white" | "gray";

export interface QuestionOption {
    text: string;
    color: color;
}

export interface Question {
    id: string;
    quizId: string;
    text: string;
    mediaUrl?: string;
    timeLimit: number;       // 10-120 seconds
    points: number;          // min 100
    options: QuestionOption[];       // exactly 4 options
    correctIndex: number;    // 0-3
    orderIndex: number;
}

export interface CreateQuestionData {
    text: string;
    mediaUrl?: string;
    timeLimit: number;
    points: number;
    options: QuestionOption[];       // exactly 4 options
    correctIndex: number;    // 0-3
    orderIndex: number;
}

export interface UpdateQuestionData {
    text?: string;
    mediaUrl?: string;
    timeLimit?: number;
    points?: number;
    options?: QuestionOption[];
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

/** Generic WebSocket event wrapper */
export type WebSocketEventType =
    | 'JOIN_ROOM'
    | 'JOIN_SUCCESS'
    | 'LOBBY_UPDATE'
    | 'KICK_PLAYER'
    | 'PLAYER_JOINED'
    | 'PLAYER_KICKED'
    | 'FORCE_DISCONNECT'
    | 'START_GAME'
    | 'GAME_STARTING'
    | 'QUESTION_START'
    | 'SUBMIT_ANSWER'
    | 'QUESTION_END'
    | 'SHOW_LEADERBOARD'
    | 'LEADERBOARD_RESULT'
    | 'NEXT_QUESTION'
    | 'GAME_OVER'
    | 'ERROR';

// Client -> Server Events
export interface JoinRoomPlayload {
    pin: string;
    nickname: string;
}

export interface KickPlayerPlayload {
    socketId: string;
    ban: boolean;
}

export interface StartGamePlayload {
    gameId: string;
}

export interface SubmitAnswerPlayload {
    questionId: string;
    answerIndex: number;
}

// PDF SPEC: NEW - Manual leaderboard trigger
export interface ShowLeaderboardPlayload {
    gameId: string;
}

export interface NextQuestionPlayload {
    gameId: string;
}

// Server -> Client Playloads
export interface JoinSuccessPlayload {
    status: 'WAITING';
    myNick: string;
}

// PDF SPEC: recentPlayers (last 28 only)
export interface LobbyUpdatePlayload {
    count: number;
    recentPlayers: string[]; // Last players
}

export interface ForceDisconnectPlayload {
    reason: string;
}

// PDF SPEC: Added serverTime
export interface GameStartingPlayload {
    countDown: number;
    serverTime: number;
}

// PDF SPEC: Added serverTime, mode-based filtering
export interface QuestionStartPlayload {
    qIndex: number;
    time: number;
    serverTime: number;
    text?: string;         // Included in PERSONAL mode
    mediaUrl?: string;     // Included in PERSONAL mode
    options?: QuestionOption[]; // Filtered by mode
}

// PDF SPEC: DIFFERENTIATED - To Host
export interface QuestionEndHostPlayload {
    qIndex: number;
    answerStats: Record<string, number>; // { "0": 15, "1": 5, "2": 40, "3": 0 }
}

// PDF SPEC: DIFFERENTIATED - To Player
export interface QuestionEndPlayerPlayload {
    correct: boolean;
    scoreEarned: number;
    streak: number;
    correctOptionIndex: number;
}

// PDF SPEC: DIFFERENTIATED - To Host
export interface LeaderboardResultHostPlayload {
    top5: Array<{ nick: string; score: number }>;
    highStreaks: Array<{ nick: string; streak: number }>;
}

// PDF SPEC: DIFFERENTIATED - To Player
export interface LeaderboardResultPlayerPlayload {
    top5: Array<{ nick: string; score: number }>;
    myRank: number;
    myTotalScore: number;
}

export interface GameOverPlayload {
    finalScores: LeaderboardEntry[];
}

export interface ErrorPlayload {
    message: string;
}

export type WebsocketPlayload =
    | JoinRoomPlayload
    | KickPlayerPlayload
    | StartGamePlayload
    | SubmitAnswerPlayload
    | ShowLeaderboardPlayload
    | NextQuestionPlayload
    | JoinSuccessPlayload
    | LobbyUpdatePlayload
    | ForceDisconnectPlayload
    | GameStartingPlayload
    | QuestionStartPlayload
    | QuestionEndHostPlayload
    | QuestionEndPlayerPlayload
    | LeaderboardResultHostPlayload
    | LeaderboardResultPlayerPlayload
    | GameOverPlayload
    | ErrorPlayload;


export interface WebSocketEvent {
    type: WebSocketEventType;
    data: WebsocketPlayload;
}



