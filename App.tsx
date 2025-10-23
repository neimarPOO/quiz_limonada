import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { GameState, GameAction, GameStatus, Player } from './types';
import AdminDashboard from './components/AdminDashboard';
import PlayerView from './components/PlayerView';
import PublicDashboard from './components/PublicDashboard';

const initialState: GameState = {
    status: GameStatus.CONFIG,
    players: [],
    questions: [],
    currentQuestionIndex: 0,
    countdown: 5,
    config: {
        numberOfQuestions: 10,
        category: 'Tecnologia',
        source: 'AI',
        tieBreaker: 'time',
    },
    playerAnswers: {},
    previousStatus: undefined,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'SET_CONFIG':
            return { ...state, config: action.payload };
        case 'START_GAME':
            return {
                ...state,
                questions: action.payload,
                status: GameStatus.COUNTDOWN,
                currentQuestionIndex: 0,
                countdown: 5,
                playerAnswers: {},
                players: state.players.map(p => ({ ...p, score: 0 }))
            };
        case 'START_COUNTDOWN':
             return { ...state, status: GameStatus.COUNTDOWN, countdown: 5 };
        case 'TICK_COUNTDOWN':
            return { ...state, countdown: state.countdown - 1 };
        case 'SHOW_QUESTION':
            return { ...state, status: GameStatus.QUESTION, countdown: 20, playerAnswers: {} };
        case 'PLAYER_ANSWER': {
            const { playerId, answer, time } = action.payload;
            const question = state.questions[state.currentQuestionIndex];
            const isCorrect = answer === question.correctAnswer;
            const score = isCorrect ? 100 + Math.max(0, 20 - Math.floor(time)) : 0; // Points for speed

            return {
                ...state,
                players: state.players.map(p =>
                    p.id === playerId ? { ...p, score: p.score + score } : p
                ),
                playerAnswers: {
                    ...state.playerAnswers,
                    [playerId]: { answer, time, score },
                }
            };
        }
        case 'SHOW_RESULTS':
            return {
                ...state,
                status: GameStatus.ROUND_END,
                countdown: 5,
                currentCorrectAnswer: state.questions[state.currentQuestionIndex].correctAnswer
            };
        case 'NEXT_QUESTION':
            if (state.currentQuestionIndex < state.questions.length - 1) {
                return {
                    ...state,
                    currentQuestionIndex: state.currentQuestionIndex + 1,
                    status: GameStatus.COUNTDOWN,
                    countdown: 5,
                    playerAnswers: {},
                    currentCorrectAnswer: undefined,
                };
            }
            return { ...state, status: GameStatus.GAME_END };
        case 'PAUSE_GAME':
            return { 
                ...state, 
                status: GameStatus.PAUSED,
                previousStatus: state.status, // Save the current status
            };
        case 'RESUME_GAME':
            return { 
                ...state, 
                status: state.previousStatus || GameStatus.QUESTION, // Restore previous status
                previousStatus: undefined,
            };
        case 'END_GAME':
             return { ...state, status: GameStatus.GAME_END };
        case 'ADD_PLAYER':
            // Avoid adding player if ID already exists
            if (state.players.find(p => p.id === action.payload.id)) {
                return state;
            }
            return { ...state, players: [...state.players, action.payload] };
        case 'RESET_GAME':
            return {
                ...initialState,
                players: state.players,
                config: state.config,
             };
        default:
            return state;
    }
};

const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<GameAction> }>({
    state: initialState,
    dispatch: () => null,
});

export const useGame = () => useContext(GameContext);

// FIX: Made the 'children' prop optional to resolve a TypeScript error.
// In modern React type definitions (like PropsWithChildren), 'children' is often optional.
const GameProvider = ({ children }: { children?: ReactNode }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

const Nav = () => (
    <nav className="absolute top-4 right-4 bg-surface-dark p-2 rounded-lg shadow-lg z-50">
        <Link to="/" className="text-white hover:text-primary px-3 py-1 rounded transition-colors">Player View</Link>
        <span className="text-white/30">|</span>
        <Link to="/admin" className="text-white hover:text-primary px-3 py-1 rounded transition-colors">Admin View</Link>
        <span className="text-white/30">|</span>
        <Link to="/dashboard" className="text-white hover:text-primary px-3 py-1 rounded transition-colors">Dashboard</Link>
    </nav>
)

const App = () => {
    return (
        <GameProvider>
            <HashRouter>
                <Nav />
                <Routes>
                    <Route path="/" element={<PlayerView />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/dashboard" element={<PublicDashboard />} />
                </Routes>
            </HashRouter>
        </GameProvider>
    );
};

export default App;
