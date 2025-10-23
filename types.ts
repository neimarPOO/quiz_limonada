export interface Game {
    id: string;
    room_code: string;
    status: GameStatus;
    current_question_index: number;
    countdown: number;
    config_number_of_questions: number;
    config_category: string;
    config_source: 'AI' | 'Manual';
    config_tie_breaker: 'time' | 'quick_question';
    admin_user_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Player {
    id: string;
    game_id: string;
    name: string;
    avatar: string;
    score: number;
    is_online: boolean;
    session_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Question {
    id: string;
    game_id: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    order_index: number;
    created_at: string;
}

export interface PlayerAnswer {
    id: string;
    player_id: string;
    question_id: string;
    game_id: string;
    answer_chosen: string;
    time_taken?: number;
    is_correct?: boolean;
    score_awarded: number;
    created_at: string;
}

export enum GameStatus {
    CONFIG = 'CONFIG',
    WAITING = 'WAITING',
    COUNTDOWN = 'COUNTDOWN',
    QUESTION = 'QUESTION',
    ROUND_END = 'ROUND_END',
    PAUSED = 'PAUSED',
    GAME_END = 'GAME_END',
}

// Simplified GameState for local React context, reflecting what's fetched from Supabase
export interface LocalGameState {
    game: Game | null;
    players: Player[];
    questions: Question[];
    playerAnswers: PlayerAnswer[];
    isAdminAuthenticated: boolean;
    localPlayerId: string | null; // To identify the current user's player ID
}

export type GameAction =
    | { type: 'SET_GAME'; payload: Game | null }
    | { type: 'SET_PLAYERS'; payload: Player[] }
    | { type: 'SET_QUESTIONS'; payload: Question[] }
    | { type: 'SET_PLAYER_ANSWERS'; payload: PlayerAnswer[] }
    | { type: 'ADMIN_LOGIN' }
    | { type: 'SET_LOCAL_PLAYER_ID'; payload: string | null };