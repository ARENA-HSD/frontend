/**
 * HSD Arena - Application Constants
 * 
 * Contains all application-wide constants including API URLs,
 * game configurations, roles, and feature flags.
 */

// ============================================================================
// Environment Configuration
// ============================================================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;

// ============================================================================
// Mock Configuration
// ============================================================================

/**
 * Enable mock mode when API is unavailable
 * Set to false when real backend is ready
 */
export const USE_MOCK_API = false;
export const USE_MOCK_WEBSOCKET = false;

/**
 * Network delay simulation for mock API (milliseconds)
 */
export const MOCK_API_DELAY = {
    MIN: 300,
    MAX: 800,
} as const;

// ============================================================================
// Authentication & Storage
// ============================================================================

export const AUTH_TOKEN_KEY = 'hsd_arena_auth_token';
export const USER_DATA_KEY = 'hsd_arena_user_data';

/**
 * JWT token expiration time (7 days in milliseconds)
 */
export const TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// ============================================================================
// User Roles (Organization-Scoped)
// ============================================================================

export const Role = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_LABELS: Record<Role, string> = {
    [Role.SUPER_ADMIN]: 'Süper Admin',
    [Role.ADMIN]: 'Admin',
    [Role.MANAGER]: 'Yönetici',
};

export const ROLE_PERMISSIONS = {
    [Role.SUPER_ADMIN]: [
        'organization.delete',
        'organization.update',
        'members.invite',
        'members.remove',
        'members.update_role',
        'quiz.create',
        'quiz.update',
        'quiz.delete',
        'game.host',
        'game.moderate',
    ],
    [Role.ADMIN]: [
        'organization.update', // White-label branding only
        'quiz.create',
        'quiz.update',
        'quiz.delete',
        'game.host',
        'game.moderate',
    ],
    [Role.MANAGER]: [
        'quiz.create',
        'quiz.update',
        'quiz.delete',
        'game.host',
        'game.moderate',
    ],
} as const;

// ============================================================================
// Game Configuration
// ============================================================================

export const GameMode = {
    PERSONAL: 'PERSONAL',
    STAGE: 'STAGE',
} as const;
export type GameMode = (typeof GameMode)[keyof typeof GameMode];

export const GAME_MODE_LABELS: Record<GameMode, string> = {
    [GameMode.PERSONAL]: 'Kişisel Mod',
    [GameMode.STAGE]: 'Sahne Modu',
};

export const GAME_MODE_DESCRIPTIONS: Record<GameMode, string> = {
    [GameMode.PERSONAL]: 'Sorular ve şıklar katılımcının telefonunda görünür (Uzaktan katılım)',
    [GameMode.STAGE]: 'Telefonda sadece butonlar görünür, soru dev ekrandadır (Fiziksel etkinlik)',
};

export const GameStatus = {
    LOBBY: 'LOBBY',
    ACTIVE: 'ACTIVE',
    FINISHED: 'FINISHED',
} as const;
export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

/**
 * Default game settings
 */
export const DEFAULT_GAME_SETTINGS = {
    QUESTION_TIME_LIMIT: 30, // seconds
    BASE_POINTS: 1000,
    STREAK_THRESHOLD: 3, // Consecutive correct answers for streak
    STREAK_MULTIPLIER: 1.5,
    TRANSITION_COUNTDOWN: 3, // seconds for "Question coming!" screen
} as const;

/**
 * Streak flame levels based on consecutive correct answers
 */
export const STREAK_LEVELS = {
    NORMAL: 3,   // 🔥
    HOT: 5,      // 🔥🔥
    VERY_HOT: 7, // 🔥🔥🔥
} as const;

/**
 * Answer option colors (used in STAGE mode)
 */
export const ANSWER_COLORS = ['teal', 'pink', 'purple', 'orange'] as const;

export const ANSWER_COLOR_MAP = {
    0: 'teal',
    1: 'pink',
    2: 'purple',
    3: 'orange',
} as const;

// ============================================================================
// Question Configuration
// ============================================================================

export const QUESTION_CONSTRAINTS = {
    MIN_OPTIONS: 2,
    MAX_OPTIONS: 4,
    MIN_TIME_LIMIT: 10,
    MAX_TIME_LIMIT: 120,
    MIN_POINTS: 100,
    MAX_POINTS: 10000,
    MAX_TEXT_LENGTH: 500,
    MAX_OPTION_LENGTH: 200,
} as const;

// ============================================================================
// Organization Configuration
// ============================================================================

export const ORGANIZATION_CONSTRAINTS = {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 100,
    MIN_SUBDOMAIN_LENGTH: 3,
    MAX_SUBDOMAIN_LENGTH: 50,
    SUBDOMAIN_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // lowercase, numbers, hyphens
} as const;

/**
 * Reserved subdomains that cannot be used
 */
export const RESERVED_SUBDOMAINS = [
    'www',
    'api',
    'admin',
    'app',
    'mail',
    'ftp',
    'localhost',
    'staging',
    'dev',
    'test',
    'demo',
] as const;

// ============================================================================
// UI Configuration
// ============================================================================

export const PARTICIPANTS_DISPLAY = {
    LARGE_COUNT: 3,    // Last 3 players shown large
    MEDIUM_COUNT: 5,   // Next 5 players shown medium
    // Remaining players shown in horizontal slider
} as const;

export const LEADERBOARD_TOP_COUNT = 5;

/**
 * Debounce delays for various inputs
 */
export const DEBOUNCE_DELAYS = {
    SEARCH: 300,
    INPUT: 500,
    RESIZE: 150,
} as const;

/**
 * Animation durations (milliseconds)
 */
export const ANIMATION_DURATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    COUNTDOWN: 1000,
} as const;

// ============================================================================
// API Routes
// ============================================================================

export const API_ROUTES = {
    // Auth
    LOGIN: '/login',
    REGISTER: '/users',

    // Organizations
    ORGANIZATIONS: '/org',
    ORGANIZATION_BY_DOMAIN: (domain: string) => `/org/${domain}`,

    // Members
    MEMBERS: (orgDomain: string) => `/org/${orgDomain}/members`,
    INVITATIONS: (orgDomain: string) => `/org/${orgDomain}/invitations`,
    INVITATION_BY_ID: (orgDomain: string, invitationId: string) =>
        `/org/${orgDomain}/invitations/${invitationId}`,

    // Quizzes
    QUIZZES: (orgDomain: string) => `/org/${orgDomain}/quizzes`,
    QUIZ_BY_ID: (orgDomain: string, quizId: string) =>
        `/org/${orgDomain}/quizzes/${quizId}`,

    // Questions
    QUESTIONS: (orgDomain: string, quizId: string) =>
        `/org/${orgDomain}/quizzes/${quizId}/questions`,
    QUESTION_BY_ID: (orgDomain: string, quizId: string, questionId: string) =>
        `/org/${orgDomain}/quizzes/${quizId}/questions/${questionId}`,
    QUESTIONS_REORDER: (orgDomain: string, quizId: string) =>
        `/org/${orgDomain}/quizzes/${quizId}/questions/reorder`,

    // Games
    GAMES: '/games',
    GAME_BY_ID: (gameId: string) => `/games/${gameId}`,
    GAME_BY_PIN: (pin: string) => `/games/${pin}`,

    // Logs
    LOGS: (orgDomain: string) => `/org/${orgDomain}/logs`,
} as const;

// ============================================================================
// WebSocket Events
// ============================================================================

export const WSEventType = {
    // Client → Server
    JOIN_ROOM: 'JOIN_ROOM',
    KICK_PLAYER: 'KICK_PLAYER',
    START_GAME: 'START_GAME',
    SUBMIT_ANSWER: 'SUBMIT_ANSWER',
    SHOW_LEADERBOARD: 'SHOW_LEADERBOARD',
    NEXT_QUESTION: 'NEXT_QUESTION',

    // Server → Client (matches games.service.ts)
    ROOM_JOINED: 'ROOM_JOINED',
    PLAYER_JOINED: 'PLAYER_JOINED',
    PLAYER_KICKED: 'PLAYER_KICKED',
    LOBBY_UPDATE: 'LOBBY_UPDATE',
    FORCE_DISCONNECT: 'FORCE_DISCONNECT',
    QUESTION_START: 'QUESTION_START',
    ANSWER_RESULT: 'ANSWER_RESULT',
    QUESTION_END: 'QUESTION_END',
    LEADERBOARD_RESULT: 'LEADERBOARD_RESULT',
    GAME_OVER: 'GAME_OVER',
    ERROR: 'ERROR',
} as const;
export type WSEventType = (typeof WSEventType)[keyof typeof WSEventType];

// ============================================================================
// Validation Messages
// ============================================================================

export const VALIDATION_MESSAGES = {
    REQUIRED_FIELD: 'Bu alan zorunludur',
    INVALID_EMAIL: 'Geçerli bir e-posta adresi girin',
    PASSWORD_MIN_LENGTH: 'Şifre en az 6 karakter olmalıdır',
    USERNAME_MIN_LENGTH: 'Kullanıcı adı en az 3 karakter olmalıdır',
    SUBDOMAIN_INVALID: 'Alt alan adı yalnızca küçük harf, rakam ve tire içerebilir',
    SUBDOMAIN_RESERVED: 'Bu alt alan adı rezerve edilmiştir',
    SUBDOMAIN_TAKEN: 'Bu alt alan adı zaten kullanılmaktadır',
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
    SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    UNAUTHORIZED: 'Bu işlem için yetkiniz bulunmamaktadır.',
    NOT_FOUND: 'Aradığınız kayıt bulunamadı.',
    VALIDATION_ERROR: 'Lütfen form bilgilerini kontrol edin.',
    SESSION_EXPIRED: 'Oturumunuz sonlandı. Lütfen tekrar giriş yapın.',
    GAME_NOT_FOUND: 'Oyun bulunamadı. PIN kodunu kontrol edin.',
    ALREADY_ANSWERED: 'Bu soruya zaten cevap verdiniz.',
    TIME_EXPIRED: 'Süre doldu.',
    BANNED: 'Bu oyundan yasaklandınız.',
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Giriş başarılı!',
    REGISTER_SUCCESS: 'Kayıt başarılı! Hoş geldiniz.',
    ORG_CREATED: 'Organizasyon başarıyla oluşturuldu.',
    ORG_UPDATED: 'Organizasyon ayarları güncellendi.',
    QUIZ_CREATED: 'Quiz başarıyla oluşturuldu.',
    QUIZ_UPDATED: 'Quiz güncellendi.',
    QUIZ_DELETED: 'Quiz silindi.',
    QUESTION_CREATED: 'Soru eklendi.',
    QUESTION_UPDATED: 'Soru güncellendi.',
    QUESTION_DELETED: 'Soru silindi.',
    SETTINGS_SAVED: 'Ayarlar kaydedildi.',
} as const;
