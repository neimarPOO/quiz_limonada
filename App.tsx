import React, { createContext, useReducer, useContext, ReactNode, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { LocalGameState, GameAction, GameStatus, Game, Player, Question, PlayerAnswer } from './types';
import AdminDashboard from './components/AdminDashboard';
import PlayerView from './components/PlayerView';
import PublicDashboard from './components/PublicDashboard';
import AdminLogin from './components/AdminLogin';
import { supabase } from './src/supabaseClient';

const initialState: LocalGameState = {
    game: null,
    players: [],
    questions: [],
    playerAnswers: [],
    isAdminAuthenticated: false,
    localPlayerId: null,
};

const gameReducer = (state: LocalGameState, action: GameAction): LocalGameState => {
    switch (action.type) {
        case 'SET_GAME':
            return { ...state, game: action.payload };
        case 'SET_PLAYERS':
            return { ...state, players: action.payload };
        case 'SET_QUESTIONS':
            return { ...state, questions: action.payload };
        case 'SET_PLAYER_ANSWERS':
            return { ...state, playerAnswers: action.payload };
        case 'ADMIN_LOGIN':
            return { ...state, isAdminAuthenticated: true };
        case 'SET_LOCAL_PLAYER_ID':
            return { ...state, localPlayerId: action.payload };
        default:
            return state;
    }
};

const GameContext = createContext<{ state: LocalGameState; dispatch: React.Dispatch<GameAction> }>(
    { state: initialState, dispatch: () => null }
);

export const useGame = () => useContext(GameContext);

const GameProvider = ({ children }: { children?: ReactNode }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const gameChannel = useRef<any>(null);

    // Effect to handle initial data fetch and Realtime subscriptions
    useEffect(() => {
        const fetchInitialData = async () => {
            // For simplicity, we'll assume a single game for now, or fetch by room_code
            // In a real app, you'd fetch the specific game the user is trying to join
            const { data: games, error: gameError } = await supabase
                .from('games')
                .select('*, players(*), questions(*), player_answers(*)')
                .limit(1);

            if (gameError) {
                console.error("Error fetching initial game data:", gameError);
                return;
            }

            if (games && games.length > 0) {
                const gameData = games[0];
                dispatch({ type: 'SET_GAME', payload: gameData });
                dispatch({ type: 'SET_PLAYERS', payload: gameData.players || [] });
                dispatch({ type: 'SET_QUESTIONS', payload: gameData.questions || [] });
                dispatch({ type: 'SET_PLAYER_ANSWERS', payload: gameData.player_answers || [] });
            }
        };

        fetchInitialData();

        // Setup Realtime subscriptions
        gameChannel.current = supabase.channel('game_room')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, payload => {
                console.log('Change received!', payload);
                if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                    dispatch({ type: 'SET_GAME', payload: payload.new as Game });
                } else if (payload.eventType === 'DELETE') {
                    dispatch({ type: 'SET_GAME', payload: null });
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
                console.log('Player change received!', payload);
                if (payload.eventType === 'INSERT') {
                    dispatch({ type: 'SET_PLAYERS', payload: [...state.players, payload.new as Player] });
                } else if (payload.eventType === 'UPDATE') {
                    dispatch({ type: 'SET_PLAYERS', payload: state.players.map(p => p.id === (payload.new as Player).id ? (payload.new as Player) : p) });
                } else if (payload.eventType === 'DELETE') {
                    dispatch({ type: 'SET_PLAYERS', payload: state.players.filter(p => p.id !== (payload.old as Player).id) });
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, payload => {
                console.log('Question change received!', payload);
                if (payload.eventType === 'INSERT') {
                    dispatch({ type: 'SET_QUESTIONS', payload: [...state.questions, payload.new as Question] });
                } else if (payload.eventType === 'UPDATE') {
                    dispatch({ type: 'SET_QUESTIONS', payload: state.questions.map(q => q.id === (payload.new as Question).id ? (payload.new as Question) : q) });
                } else if (payload.eventType === 'DELETE') {
                    dispatch({ type: 'SET_QUESTIONS', payload: state.questions.filter(q => q.id !== (payload.old as Question).id) });
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'player_answers' }, payload => {
                console.log('Player Answer change received!', payload);
                if (payload.eventType === 'INSERT') {
                    dispatch({ type: 'SET_PLAYER_ANSWERS', payload: [...state.playerAnswers, payload.new as PlayerAnswer] });
                } else if (payload.eventType === 'UPDATE') {
                    dispatch({ type: 'SET_PLAYER_ANSWERS', payload: state.playerAnswers.map(pa => pa.id === (payload.new as PlayerAnswer).id ? (payload.new as PlayerAnswer) : pa) });
                } else if (payload.eventType === 'DELETE') {
                    dispatch({ type: 'SET_PLAYER_ANSWERS', payload: state.playerAnswers.filter(pa => pa.id !== (payload.old as PlayerAnswer).id) });
                }
            })
            .subscribe();

        // Check for local player ID in session storage
        const storedPlayer = sessionStorage.getItem('quizPlayer');
        if (storedPlayer) {
            const player = JSON.parse(storedPlayer);
            dispatch({ type: 'SET_LOCAL_PLAYER_ID', payload: player.id });
        }

        return () => {
            if (gameChannel.current) {
                supabase.removeChannel(gameChannel.current);
            }
        };
    }, [state.players]); // Dependency on state.players to update player list correctly on changes

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
);

const App = () => {
    const { state } = useGame();

    return (
        <GameProvider>
            <HashRouter>
                <Nav />
                <Routes>
                    <Route path="/" element={<PlayerView />} />
                    <Route path="/admin" element={state.isAdminAuthenticated ? <AdminDashboard /> : <AdminLogin />} />
                    <Route path="/dashboard" element={<PublicDashboard />} />
                </Routes>
            </HashRouter>
        </GameProvider>
    );
};

export default App;