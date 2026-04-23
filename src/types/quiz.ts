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
    mediaBase64?: string;
    timeLimit: number;
    points: number;
    options: QuestionOption[];       // exactly 4 options
    correctIndex: number;    // 0-3
    orderIndex: number;
}

export interface UpdateQuestionData {
    text?: string;
    mediaBase64?: string;
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
    score: number;
    correctAnswers?: number;
    streak?: number;
}

// ============================================
// WEBSOCKET EVENT PAYLOADS
// (Aligned with games.service.ts + games.controller.ts)
// ============================================

/** Generic WebSocket event wrapper */
export type WebSocketEventType =
    | 'JOIN_ROOM'
    | 'JOIN_SUCCESS'
    | 'NEED_NICKNAME'
    | 'SET_NICKNAME'
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
    | 'RECONNECT'
    | 'RECONNECT_SUCCESS'
    | 'PLAYER_DISCONNECTED'
    | 'PLAYER_RECONNECTED'
    | 'ERROR';

// Client -> Server Events
export interface JoinRoomPlayload {
    pin: string;
    nickname: string;
}

export interface SetNicknamePlayload {
    pin: string;
    nickname: string;
}

export interface KickPlayerPlayload {
    nickname: string;
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
    sessionToken?: string;
}

// PDF SPEC: recentPlayers (last 28 only)
export interface LobbyUpdatePlayload {
    count: number;
    recentPlayers: string[]; // Last players
}

export interface PlayerKickedPlayload {
    nickname: string;
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
    mode: 'PERSONAL' | 'STAGE';
    text?: string;         // Included in PERSONAL mode
    mediaUrl?: string;     // Included in PERSONAL mode
    options?: QuestionOption[]; // Filtered by mode
}

// PDF SPEC: DIFFERENTIATED - To Host
export interface QuestionEndHostPlayload {
    correctIndex: number;
    answerStats: Record<string, number>; // { "0": 15, "1": 5, "2": 40, "3": 0 }
    streakLeaders?: Array<{ nick: string; streak: number }>;
}

// PDF SPEC: DIFFERENTIATED - To Player
export interface QuestionEndPlayerPlayload {
    qIndex: number;
    correct: boolean;
    correctIndex: number;
    points: number;
    streak?: number;
    streakLeaders?: Array<{ nick: string; streak: number }>;
}

// PDF SPEC: DIFFERENTIATED - To Host
export interface LeaderboardResultHostPlayload {
    top5: Array<{ nickname: string; nick?: string; score: number }>;
    recentPlayers?: Array<{ nickname: string; nick?: string; streak: number }>;
    highStreaks?: Array<{ nickname: string; nick?: string; streak: number }>;
}

// PDF SPEC: DIFFERENTIATED - To Player
export interface LeaderboardResultPlayerPlayload {
    top5: Array<{ nickname: string; score: number }>;
    myRank?: number;
    myTotalScore?: number;
}

export interface GameOverPlayload {
    winner: string;
    finalScores: LeaderboardEntry[];
    myRank?: number;
    myTotalScore?: number;
}

export interface ErrorPlayload {
    message: string;
}

// Reconnect Payloads
export interface ReconnectPlayload {
    pin: string;
    sessionToken: string;
}

export interface ReconnectSuccessPlayerPlayload {
    isHost?: false;
    gameStatus: 'LOBBY' | 'ACTIVE' | 'FINISHED';
    score: number;
    streak: number;
    hasAnswered: boolean;
    currentQuestionIndex: number;
    remainingTime: number;
    mode: 'PERSONAL' | 'STAGE';
    text?: string;
    mediaUrl?: string;
    options?: QuestionOption[];
}

export interface ReconnectSuccessHostPlayload {
    isHost: true;
    gameStatus: 'LOBBY' | 'ACTIVE' | 'FINISHED';
    currentQuestionIndex: number;
    count?: number;
    recentPlayers?: string[];
    pin?: string;
    gameId?: string;
    // Phase restoration fields
    phase?: 'question' | 'results' | 'leaderboard';
    remainingTime?: number;
    text?: string;
    mediaUrl?: string;
    options?: QuestionOption[];
    answerStats?: Record<string, number>;
    correctIndex?: number;
    leaderboard?: Array<{ nickname: string; score: number }>;
    highStreaks?: Array<{ nickname: string; streak: number }>;
}

export type ReconnectSuccessPlayload = ReconnectSuccessPlayerPlayload | ReconnectSuccessHostPlayload;

export interface PlayerDisconnectedPlayload {
    nickname: string;
}

export interface PlayerReconnectedPlayload {
    nickname: string;
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
    | PlayerKickedPlayload
    | ForceDisconnectPlayload
    | GameStartingPlayload
    | QuestionStartPlayload
    | QuestionEndHostPlayload
    | QuestionEndPlayerPlayload
    | LeaderboardResultHostPlayload
    | LeaderboardResultPlayerPlayload
    | GameOverPlayload
    | ErrorPlayload
    | ReconnectPlayload
    | ReconnectSuccessPlayerPlayload
    | ReconnectSuccessHostPlayload
    | PlayerDisconnectedPlayload
    | PlayerReconnectedPlayload;


export interface WebSocketEvent {
    type: WebSocketEventType;
    data: WebsocketPlayload;
}



