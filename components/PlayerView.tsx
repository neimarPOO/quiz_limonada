import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../App';
import { GameStatus, Player } from '../types';

const WaitingRoom = () => {
    const { state, dispatch } = useGame();
    const [playerName, setPlayerName] = useState('');
    const [localPlayer, setLocalPlayer] = useState<Player | null>(null);

    useEffect(() => {
        // Check if player data is already in session storage
        const storedPlayer = sessionStorage.getItem('quizPlayer');
        if (storedPlayer) {
            const player: Player = JSON.parse(storedPlayer);
            setLocalPlayer(player);
            // Add player to game state if not already there
            dispatch({ type: 'ADD_PLAYER', payload: player });
        }
    }, [dispatch]);

    const handleJoinGame = (e: React.FormEvent) => {
        e.preventDefault();
        if (playerName.trim() === '') return;

        const newPlayer: Player = {
            id: `player_${Date.now()}`,
            name: playerName,
            avatar: `https://picsum.photos/seed/${Date.now()}/100`,
            score: 0,
            isOnline: true,
        };

        sessionStorage.setItem('quizPlayer', JSON.stringify(newPlayer));
        setLocalPlayer(newPlayer);
        dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
    };

    // If player has not joined yet, show the join form
    if (!localPlayer) {
        return (
            <div className="relative flex h-screen w-full flex-col items-center justify-center text-center p-4 bg-background-dark text-white">
                 <h1 className="text-5xl font-bold text-primary mb-4">Quiz Coletivo</h1>
                 <p className="text-xl text-white/70 mb-8">Entre na sala para começar a jogar!</p>
                 <form onSubmit={handleJoinGame} className="w-full max-w-sm flex flex-col gap-4">
                    <input 
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Digite seu nome"
                        className="w-full h-12 p-3 rounded-lg text-white bg-surface-dark-hover border-none focus:outline-0 focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" className="w-full h-12 bg-primary text-background-dark font-bold rounded-lg hover:brightness-110 transition-transform">
                        Entrar no Jogo
                    </button>
                 </form>
                 <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-gray-400 text-lg">
                    Código da Sala: <span className="font-bold text-white tracking-widest">{state.roomCode}</span>
                </footer>
            </div>
        );
    }

    // If player has joined, show the waiting room
    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center text-center p-4 bg-background-dark text-white gradient-animation">
            <style>{`
                .gradient-animation {
                    background: linear-gradient(300deg, #161022, #1d162f, #161022);
                    background-size: 180% 180%;
                    animation: gradient-animation 18s ease infinite;
                }
            `}</style>
            <div className="flex flex-col gap-4 mb-12">
                <p className="text-white text-5xl font-bold leading-tight tracking-tighter">Sala de Espera</p>
                <p className="text-white/60 text-lg font-normal leading-normal">Aguardando o anfitrião iniciar a próxima rodada.</p>
            </div>
            <div className="w-full max-w-sm">
                <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-4 text-left">Jogadores na sala: ({state.players.filter(p => p.isOnline).length})</h3>
                <div className="flex flex-col gap-2">
                    {state.players.map(player => (
                        <div key={player.id} className="flex items-center gap-4 bg-white/5 px-4 min-h-[3.5rem] rounded-lg">
                            <img className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10" alt={`Avatar de ${player.name}`} src={player.avatar} />
                            <p className="text-white text-base font-normal leading-normal flex-1 truncate text-left">{player.name}</p>
                            {player.id === localPlayer.id && <span className="material-symbols-outlined text-yellow-400">workspace_premium</span>}
                        </div>
                    ))}
                </div>
            </div>
             <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-gray-400 text-lg">
                Acesse com o código: <span className="font-bold text-white tracking-widest">{state.roomCode}</span>
            </footer>
        </div>
    );
};

const CountdownScreen = () => {
    const { state } = useGame();
    const formattedTime = (val: number) => val.toString().padStart(2, '0');
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 w-full min-h-screen">
            <h1 className="text-white tracking-light text-[32px] font-bold leading-tight">A próxima rodada começa em...</h1>
            <div className="flex gap-4 w-full max-w-md">
                <div className="flex grow basis-0 flex-col items-stretch gap-4">
                    <div className="flex h-20 grow items-center justify-center rounded-xl px-3 bg-[#2e2839]">
                        <p className="text-white text-4xl font-bold">{formattedTime(state.countdown)}</p>
                    </div>
                    <div className="flex items-center justify-center"><p className="text-white text-sm">Segundos</p></div>
                </div>
            </div>
        </div>
    );
};

const RankingSidebar = () => {
    const { state } = useGame();
    const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);

    const getBorderColor = (index: number) => {
        if (index === 0) return 'border-yellow-400';
        if (index === 1) return 'border-gray-400';
        if (index === 2) return 'border-yellow-600';
        return 'border-transparent';
    };

    return (
        <aside className="w-80 bg-[#1e162f] p-6 hidden lg:flex flex-col">
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-3xl text-accent-cyan">leaderboard</span>
                    <h2 className="text-white text-xl font-bold">Ranking ao Vivo</h2>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto">
                    {sortedPlayers.map((player, index) => (
                        <div key={player.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-[#2e2839]/60 border-l-4 ${getBorderColor(index)}`}>
                             <span className="font-bold text-lg w-6 text-center">{index + 1}º</span>
                             <img alt={`Avatar de ${player.name}`} className="size-10 rounded-full" src={player.avatar} />
                             <div className="flex-grow">
                                <p className="text-white font-medium">{player.name}</p>
                                <p className="text-[#a69db9] text-sm">{player.score} pts</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};


const GameScreen = () => {
    const { state, dispatch } = useGame();
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const startTime = useRef(Date.now());
    const question = state.questions[state.currentQuestionIndex];
    const isRoundEnd = state.status === GameStatus.ROUND_END;

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;

        const storedPlayer = sessionStorage.getItem('quizPlayer');
        if (!storedPlayer) {
            console.error("Player information not found in session storage.");
            return; // Cannot answer without a player
        }
        const player: Player = JSON.parse(storedPlayer);

        const endTime = Date.now();
        const timeTaken = (endTime - startTime.current) / 1000;
        setSelectedAnswer(answer);
        dispatch({ type: 'PLAYER_ANSWER', payload: { playerId: player.id, answer, time: timeTaken } });
    };
    
    useEffect(() => {
      if (isRoundEnd) {
        // Show feedback for a few seconds then move to next
      } else {
        // Reset for new question
        setSelectedAnswer(null);
        startTime.current = Date.now();
      }
    }, [isRoundEnd, state.currentQuestionIndex]);

    const getButtonClass = (option: string) => {
        if (!isRoundEnd && !selectedAnswer) return 'bg-secondary hover:bg-secondary/80';
        if (option === question.correctAnswer) return 'bg-feedback-correct text-black';
        if (option === selectedAnswer && option !== question.correctAnswer) return 'bg-feedback-wrong text-black';
        return 'bg-gray-600 opacity-50';
    };

    const progressPercentage = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
    const timerProgress = (state.countdown / 20) * 289;


    return (
        <div className="relative flex min-h-screen w-full">
            <main className="flex-1 p-6 md:p-10 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex-1">
                        <div className="flex flex-col gap-2">
                            <p className="text-white text-base font-medium leading-normal">Pergunta {state.currentQuestionIndex + 1} de {state.questions.length}</p>
                            <div className="rounded bg-[#433b54] h-2 w-full">
                                <div className="h-2 rounded bg-gradient-to-r from-accent-magenta to-accent-cyan" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                    {!isRoundEnd && (
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="absolute inset-0" viewBox="0 0 100 100">
                            <circle className="text-[#2e2839]" cx="50" cy="50" fill="transparent" r="46" stroke="currentColor" strokeWidth="8"></circle>
                            <circle className="text-accent-cyan transform -rotate-90 origin-center transition-all duration-1000" cx="50" cy="50" fill="transparent" r="46" stroke="currentColor" strokeDasharray="289" strokeDashoffset={timerProgress} strokeWidth="8"></circle>
                        </svg>
                        <p className="text-white text-2xl font-bold">{state.countdown}</p>
                    </div>
                    )}
                </div>

                <div className="flex-grow flex flex-col justify-center items-center text-center">
                    <h1 className="text-white tracking-light text-3xl md:text-4xl font-bold leading-tight px-4 pb-8 pt-6">{question.question}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                        {question.options.map((option, index) => (
                             <button key={index} onClick={() => handleAnswer(option)} disabled={!!selectedAnswer} className={`flex min-w-[84px] items-center justify-center overflow-hidden rounded-xl h-16 px-5 text-white text-lg font-bold transition-all duration-300 ${getButtonClass(option)}`}>
                                <span className="truncate">{String.fromCharCode(65 + index)}. {option}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </main>
            <RankingSidebar />
             {isRoundEnd && (
                <div className={`absolute inset-0 flex flex-col justify-center items-center z-20 ${state.playerAnswers[JSON.parse(sessionStorage.getItem('quizPlayer') || '{}').id]?.answer === question.correctAnswer ? 'bg-feedback-correct/90' : 'bg-feedback-wrong/90'}`}>
                    <span className="material-symbols-outlined text-8xl text-white">{state.playerAnswers[JSON.parse(sessionStorage.getItem('quizPlayer') || '{}').id]?.answer === question.correctAnswer ? 'celebration' : 'sentiment_dissatisfied'}</span>
                    <p className="text-4xl font-bold text-white mt-4">{state.playerAnswers[JSON.parse(sessionStorage.getItem('quizPlayer') || '{}').id]?.answer === question.correctAnswer ? 'Correto!' : 'Quase lá!'}</p>
                </div>
            )}
        </div>
    );
};

const GameEndScreen = () => {
    const { state, dispatch } = useGame();
    const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-5xl font-bold text-primary mb-4">Fim de Jogo!</h1>
            {winner && <h2 className="text-3xl font-bold mb-8">Vencedor: {winner.name}!</h2>}
            <div className="w-full max-w-md bg-surface-dark rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-4">Ranking Final</h3>
                <div className="flex flex-col gap-3">
                    {sortedPlayers.map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-surface-dark-hover rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="font-bold w-6">{index + 1}.</span>
                                <img className="w-10 h-10 rounded-full" alt={player.name} src={player.avatar}/>
                                <p className="font-medium">{player.name}</p>
                            </div>
                            <p className="font-bold text-primary">{player.score} pts</p>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={() => dispatch({ type: 'RESET_GAME' })} className="mt-8 px-8 py-3 bg-primary text-background-dark font-bold rounded-lg text-lg hover:brightness-110 transition-transform">
                Jogar Novamente
            </button>
        </div>
    );
};

const PlayerView = () => {
    const { state, dispatch } = useGame();

    useEffect(() => {
        // FIX: The return type of setTimeout in a browser environment is `number`, not `NodeJS.Timeout`.
        let timer: number;
        if (state.status === GameStatus.COUNTDOWN && state.countdown > 0) {
            timer = setTimeout(() => dispatch({ type: 'TICK_COUNTDOWN' }), 1000);
        } else if (state.status === GameStatus.COUNTDOWN && state.countdown === 0) {
            dispatch({ type: 'SHOW_QUESTION' });
        } else if (state.status === GameStatus.QUESTION && state.countdown > 0) {
            timer = setTimeout(() => dispatch({ type: 'TICK_COUNTDOWN' }), 1000);
        } else if (state.status === GameStatus.QUESTION && state.countdown === 0) {
            dispatch({ type: 'SHOW_RESULTS' });
        } else if (state.status === GameStatus.ROUND_END && state.countdown > 0) {
            timer = setTimeout(() => dispatch({ type: 'TICK_COUNTDOWN' }), 1000);
        } else if (state.status === GameStatus.ROUND_END && state.countdown === 0) {
            dispatch({ type: 'NEXT_QUESTION' });
        }
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.status, state.countdown, dispatch]);
    

    switch (state.status) {
        case GameStatus.CONFIG:
        case GameStatus.WAITING:
            return <WaitingRoom />;
        case GameStatus.COUNTDOWN:
            return <CountdownScreen />;
        case GameStatus.PAUSED:
            return (
                <div className="flex flex-col items-center justify-center text-center w-full min-h-screen">
                    <span className="material-symbols-outlined text-8xl text-yellow-400 mb-4">pause_circle</span>
                    <h1 className="text-white text-4xl font-bold">Jogo Pausado</h1>
                    <p className="text-white/70 text-lg mt-2">Aguarde o administrador continuar a partida.</p>
                </div>
            );
        case GameStatus.QUESTION:
        case GameStatus.ROUND_END:
            return <GameScreen />;
        case GameStatus.GAME_END:
            return <GameEndScreen />;
        default:
            return <WaitingRoom />;
    }
};

export default PlayerView;
