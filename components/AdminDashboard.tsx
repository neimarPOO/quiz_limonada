import React, { useState, useEffect } from 'react';
import { useGame } from '../App';
import { GameStatus, Game, Player, Question } from '../types';
import { supabase } from '../src/supabaseClient';
import { generateQuizQuestions } from '../services/apiService';

const LogoIcon = () => (
    <div className="size-6 text-primary">
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
        </svg>
    </div>
);

const PlayerList = () => {
    const { state } = useGame();
    const { game, players } = state;

    const handleRemovePlayer = async (playerId: string) => {
        if (!game) return;
        const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', playerId)
            .eq('game_id', game.id); // Ensure only players from the current game are removed

        if (error) {
            console.error("Error removing player:", error);
        }
    };

    return (
        <div className="bg-surface-dark rounded-xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <p className="text-white text-2xl font-bold leading-tight tracking-tight">Jogadores Online</p>
                <p className="text-primary font-bold bg-primary/20 px-3 py-1 rounded-full text-sm">Total: {players.length}</p>
            </div>
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-96">
                {players.map(player => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-surface-dark-hover rounded-lg">
                        <div className="flex items-center gap-3">
                            <img className="w-10 h-10 rounded-full" alt={`Avatar de ${player.name}`} src={player.avatar} />
                            <p className="font-medium">{player.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${player.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                            <button 
                                onClick={() => handleRemovePlayer(player.id)}
                                className="text-red-400 hover:text-red-600 transition-colors text-sm"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { state, dispatch } = useGame();
    const { game, isAdminAuthenticated } = state;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Local state for config changes before saving to DB
    const [localConfig, setLocalConfig] = useState({
        numberOfQuestions: game?.config_number_of_questions || 10,
        category: game?.config_category || 'Tecnologia',
    });

    useEffect(() => {
        if (game) {
            setLocalConfig({
                numberOfQuestions: game.config_number_of_questions,
                category: game.config_category,
            });
        }
    }, [game]);

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLocalConfig({ ...localConfig, [e.target.name]: e.target.value });
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalConfig({ ...localConfig, numberOfQuestions: parseInt(e.target.value, 10) });
    };

    const handleSaveConfig = async () => {
        if (!game) {
            setError("Nenhum jogo ativo para salvar configurações.");
            return;
        }
        setIsLoading(true);
        setError(null);
        const { error: updateError } = await supabase
            .from('games')
            .update({
                config_number_of_questions: localConfig.numberOfQuestions,
                config_category: localConfig.category,
                updated_at: new Date().toISOString(),
            })
            .eq('id', game.id);

        if (updateError) {
            console.error("Error saving config:", updateError);
            setError("Falha ao salvar configurações.");
        }
        setIsLoading(false);
    };

    const handleStartGame = async () => {
        if (!game) {
            setError("Nenhum jogo ativo para iniciar.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            // 1. Update game status to COUNTDOWN
            const { error: statusError } = await supabase
                .from('games')
                .update({ status: GameStatus.COUNTDOWN, current_question_index: 0, countdown: 5, updated_at: new Date().toISOString() })
                .eq('id', game.id);

            if (statusError) throw statusError;

            // 2. Call Edge Function to generate questions
            // This part assumes you have an Edge Function named 'generate-quiz-questions'
            // that takes category and numberOfQuestions and returns an array of questions.
            const generatedQuestions = await generateQuizQuestions(game.config_category, game.config_number_of_questions);

            // 3. Insert generated questions into the 'questions' table
            const questionsToInsert = generatedQuestions.map((q, index) => ({
                game_id: game.id,
                question_text: q.question_text,
                options: q.options,
                correct_answer: q.correct_answer,
                order_index: index,
            }));

            const { error: insertQuestionsError } = await supabase
                .from('questions')
                .insert(questionsToInsert);

            if (insertQuestionsError) throw insertQuestionsError;

        } catch (err: any) {
            console.error("Error starting game or generating questions:", err);
            setError(`Falha ao iniciar jogo: ${err.message || err.error_description || 'Erro desconhecido'}`);
            // Revert status if something went wrong after status update
            await supabase.from('games').update({ status: GameStatus.CONFIG }).eq('id', game.id);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResetGame = async () => {
        if (!game) return;
        setIsLoading(true);
        setError(null);
        try {
            // Reset game status
            const { error: gameUpdateError } = await supabase
                .from('games')
                .update({ status: GameStatus.CONFIG, current_question_index: 0, countdown: 0, updated_at: new Date().toISOString() })
                .eq('id', game.id);
            if (gameUpdateError) throw gameUpdateError;

            // Optionally, delete all players, questions, and answers for this game
            await supabase.from('players').delete().eq('game_id', game.id);
            await supabase.from('questions').delete().eq('game_id', game.id);
            await supabase.from('player_answers').delete().eq('game_id', game.id);

        } catch (err: any) {
            console.error("Error resetting game:", err);
            setError(`Falha ao resetar jogo: ${err.message || err.error_description || 'Erro desconhecido'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePauseGame = async () => {
        if (!game) return;
        const { error } = await supabase
            .from('games')
            .update({ status: GameStatus.PAUSED, updated_at: new Date().toISOString() })
            .eq('id', game.id);
        if (error) console.error("Error pausing game:", error);
    };

    const handleResumeGame = async () => {
        if (!game) return;
        // Restore to QUESTION status, or previous if we stored it
        const { error } = await supabase
            .from('games')
            .update({ status: GameStatus.QUESTION, updated_at: new Date().toISOString() })
            .eq('id', game.id);
        if (error) console.error("Error resuming game:", error);
    };

    const isGameActive = game && game.status !== GameStatus.CONFIG && game.status !== GameStatus.GAME_END;
    const currentQuestion = state.questions[game?.current_question_index || 0];

    if (!isAdminAuthenticated) {
        return <p className="text-white text-center p-10">Acesso negado. Por favor, faça login como administrador.</p>;
    }

    if (!game) {
        // If no game exists, provide an option to create one
        const handleCreateNewGame = async () => {
            setIsLoading(true);
            setError(null);
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Simple room code
            const { data, error: insertError } = await supabase
                .from('games')
                .insert({
                    room_code: roomCode,
                    status: GameStatus.CONFIG,
                    admin_user_id: state.localPlayerId, // Assuming admin is logged in as a player for now
                })
                .select();
            if (insertError) {
                console.error("Error creating new game:", insertError);
                setError("Falha ao criar novo jogo.");
            } else if (data && data.length > 0) {
                dispatch({ type: 'SET_GAME', payload: data[0] as Game });
            }
            setIsLoading(false);
        };

        return (
            <div className="flex items-center justify-center min-h-screen bg-background-dark">
                <div className="text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">Nenhum Jogo Ativo</h1>
                    <p className="text-lg mb-6">Crie um novo jogo para começar.</p>
                    <button 
                        onClick={handleCreateNewGame}
                        disabled={isLoading}
                        className="px-8 py-3 bg-primary text-background-dark font-bold rounded-lg text-lg hover:brightness-110 transition-transform disabled:opacity-50"
                    >
                        {isLoading ? 'Criando Jogo...' : 'Criar Novo Jogo'}
                    </button>
                    {error && <p className="text-red-400 mt-4">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-white/10 px-10 py-3">
                <div className="flex items-center gap-4 text-white">
                    <LogoIcon />
                    <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">QuizColetivo - Sala {game.room_code}</h2>
                </div>
            </header>
            <main className="flex-1 p-5 lg:p-10">
                <div className="flex flex-col gap-4 mb-8">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Painel de Controle do Administrador</h1>
                    <p className="text-white/60 text-lg font-normal leading-normal">Configure e gerencie seu quiz em tempo real.</p>
                </div>

                {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-4">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="flex flex-col gap-8">
                        <div className="bg-surface-dark rounded-xl p-6 flex flex-col gap-6">
                             <div className="flex flex-col gap-1">
                                <p className="text-primary text-sm font-bold leading-normal">Prepare seu Jogo</p>
                                <p className="text-white text-2xl font-bold leading-tight tracking-tight">Configuração de Rodadas</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <div className="flex w-full items-center justify-between">
                                        <p className="text-white text-base font-medium leading-normal">Número de Perguntas</p>
                                        <p className="text-white text-sm font-normal leading-normal">{localConfig.numberOfQuestions}</p>
                                    </div>
                                    <input type="range" min="5" max="20" step="1" value={localConfig.numberOfQuestions} onChange={handleSliderChange} disabled={isGameActive} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer range-thumb:bg-primary" />
                                </div>
                                <label className="flex flex-col">
                                    <p className="text-white text-base font-medium leading-normal pb-2">Temas/Categorias</p>
                                    <select name="category" value={localConfig.category} onChange={handleConfigChange} disabled={isGameActive} className="form-select w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-surface-dark-hover h-12 p-3 appearance-none">
                                        <option>Tecnologia</option>
                                        <option>Ciência</option>
                                        <option>História</option>
                                        <option>Geografia</option>
                                        <option>Cultura Pop</option>
                                    </select>
                                </label>
                            </div>
                            <button onClick={handleSaveConfig} className="w-full h-12 bg-primary/20 text-primary font-bold rounded-lg hover:bg-primary/30 transition-colors" disabled={isGameActive || isLoading}>
                                Salvar Configurações
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-surface-dark rounded-xl p-6 flex flex-col justify-between items-center gap-8">
                        <div className="text-center">
                            <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Status Atual do Jogo</p>
                            <p className="text-3xl font-bold text-primary">{game.status}</p>
                        </div>
                        <div className="w-full flex flex-col items-center gap-6">
                            <p className="text-white/60 font-medium">Pergunta Atual no Ar</p>
                            <div className="w-full h-48 bg-surface-dark-hover rounded-lg flex items-center justify-center p-4">
                                <p className="text-white/80 text-center">{currentQuestion?.question_text || 'As perguntas aparecerão aqui quando o jogo começar.'}</p>
                            </div>
                        </div>
                         <div className="w-full flex flex-col gap-4">
                            {!isGameActive ? (
                                <button onClick={handleStartGame} disabled={isLoading || !game} className="w-full h-16 bg-primary text-background-dark font-black text-xl rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span className="material-symbols-outlined text-3xl">play_arrow</span>
                                    {isLoading ? 'Gerando Perguntas...' : 'INICIAR JOGO'}
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {game.status === GameStatus.PAUSED ? (
                                        <button onClick={handleResumeGame} className="w-full h-12 bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                                            <span className="material-symbols-outlined">play_arrow</span>
                                            CONTINUAR
                                        </button>
                                    ) : (
                                        <button onClick={handlePauseGame} className="w-full h-12 bg-yellow-500 text-background-dark font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors">
                                            <span className="material-symbols-outlined">pause</span>
                                            PAUSAR
                                        </button>
                                    )}
                                    <button onClick={handleResetGame} className="w-full h-12 bg-red-500/80 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-red-500 transition-colors">
                                        <span className="material-symbols-outlined">stop</span>
                                        ENCERRAR
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <PlayerList />
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;