
import React, { useState } from 'react';
import { useGame } from '../App';
import { GameStatus, QuizConfig } from '../types';
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
    return (
        <div className="bg-surface-dark rounded-xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <p className="text-white text-2xl font-bold leading-tight tracking-tight">Jogadores Online</p>
                <p className="text-primary font-bold bg-primary/20 px-3 py-1 rounded-full text-sm">Total: {state.players.length}</p>
            </div>
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-96">
                {state.players.map(player => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-surface-dark-hover rounded-lg">
                        <div className="flex items-center gap-3">
                            <img className="w-10 h-10 rounded-full" alt={`Avatar de ${player.name}`} src={player.avatar} />
                            <p className="font-medium">{player.name}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${player.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { state, dispatch } = useGame();
    const [config, setConfig] = useState<QuizConfig>(state.config);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({ ...config, numberOfQuestions: parseInt(e.target.value, 10) });
    };

    const handleStartGame = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const questions = await generateQuizQuestions(config.category, config.numberOfQuestions);
            dispatch({ type: 'START_GAME', payload: questions });
        } catch (err) {
            setError('Falha ao gerar perguntas. Verifique a chave da API e tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResetGame = () => {
        dispatch({ type: 'RESET_GAME' });
    }

    const isGameActive = state.status !== GameStatus.CONFIG && state.status !== GameStatus.GAME_END;
    const currentQuestion = state.questions[state.currentQuestionIndex];

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-white/10 px-10 py-3">
                <div className="flex items-center gap-4 text-white">
                    <LogoIcon />
                    <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">QuizColetivo - Sala {state.roomCode}</h2>
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
                                        <p className="text-white text-sm font-normal leading-normal">{config.numberOfQuestions}</p>
                                    </div>
                                    <input type="range" min="5" max="20" step="1" value={config.numberOfQuestions} onChange={handleSliderChange} disabled={isGameActive} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer range-thumb:bg-primary" />
                                </div>
                                <label className="flex flex-col">
                                    <p className="text-white text-base font-medium leading-normal pb-2">Temas/Categorias</p>
                                    <select name="category" value={config.category} onChange={handleConfigChange} disabled={isGameActive} className="form-select w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-surface-dark-hover h-12 p-3 appearance-none">
                                        <option>Tecnologia</option>
                                        <option>Ciência</option>
                                        <option>História</option>
                                        <option>Geografia</option>
                                        <option>Cultura Pop</option>
                                    </select>
                                </label>
                            </div>
                            <button onClick={() => dispatch({type: 'SET_CONFIG', payload: config})} className="w-full h-12 bg-primary/20 text-primary font-bold rounded-lg hover:bg-primary/30 transition-colors" disabled={isGameActive}>
                                Salvar Configurações
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-surface-dark rounded-xl p-6 flex flex-col justify-between items-center gap-8">
                        <div className="text-center">
                            <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Status Atual do Jogo</p>
                            <p className="text-3xl font-bold text-primary">{state.status}</p>
                        </div>
                        <div className="w-full flex flex-col items-center gap-6">
                            <p className="text-white/60 font-medium">Pergunta Atual no Ar</p>
                            <div className="w-full h-48 bg-surface-dark-hover rounded-lg flex items-center justify-center p-4">
                                <p className="text-white/80 text-center">{currentQuestion?.question || 'As perguntas aparecerão aqui quando o jogo começar.'}</p>
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-4">
                            {isGameActive ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {state.status === GameStatus.PAUSED ? (
                                        <button onClick={() => dispatch({ type: 'RESUME_GAME' })} className="w-full h-12 bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                                            <span className="material-symbols-outlined">play_arrow</span>
                                            CONTINUAR
                                        </button>
                                    ) : (
                                        <button onClick={() => dispatch({ type: 'PAUSE_GAME' })} className="w-full h-12 bg-yellow-500 text-background-dark font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors">
                                            <span className="material-symbols-outlined">pause</span>
                                            PAUSAR
                                        </button>
                                    )}
                                    <button onClick={handleResetGame} className="w-full h-12 bg-red-500/80 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-red-500 transition-colors">
                                        <span className="material-symbols-outlined">stop</span>
                                        ENCERRAR
                                    </button>
                                </div>
                            ) : (
                                <button onClick={handleStartGame} disabled={isLoading} className="w-full h-16 bg-primary text-background-dark font-black text-xl rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span className="material-symbols-outlined text-3xl">play_arrow</span>
                                    {isLoading ? 'Gerando Perguntas...' : 'INICIAR JOGO'}
                                </button>
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
