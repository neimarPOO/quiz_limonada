
export interface Player {
    id: string;
    name: string;
    avatar: string;
    score: number;
    isOnline: boolean;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
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

export interface QuizConfig {
    numberOfQuestions: number;
    category: string;
    source: 'AI' | 'Manual';
    tieBreaker: 'time' | 'quick_question';
}

export interface GameState {
    status: GameStatus;
    players: Player[];
    questions: QuizQuestion[];
    currentQuestionIndex: number;
    countdown: number;
    config: QuizConfig;
    roomCode: string;
    playerAnswers: { [playerId: string]: { answer: string; time: number; score: number } | null };
    currentCorrectAnswer?: string;
    previousStatus?: GameStatus;
}

export type GameAction =
    | { type: 'SET_CONFIG'; payload: QuizConfig }
    | { type: 'START_GAME'; payload: QuizQuestion[] }
    | { type: 'START_COUNTDOWN' }
    | { type: 'TICK_COUNTDOWN' }
    | { type: 'SHOW_QUESTION' }
    | { type: 'PLAYER_ANSWER'; payload: { playerId: string; answer: string; time: number } }
    | { type: 'SHOW_RESULTS' }
    | { type: 'NEXT_QUESTION' }
    | { type: 'PAUSE_GAME' }
    | { type: 'RESUME_GAME' }
    | { type: 'END_GAME' }
    | { type: 'RESET_GAME' }
    | { type: 'ADD_PLAYER'; payload: Player }
    | { type: 'UPDATE_PLAYER_STATUS'; payload: { playerId: string; isOnline: boolean } };
