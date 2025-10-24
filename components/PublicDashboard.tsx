
import React from 'react';
import { useGame } from '../App';
import { GameStatus } from '../types';
import QRCode from "react-qr-code";

const PublicDashboard = () => {
    const { state } = useGame();

    const renderContent = () => {
        switch (state.game?.status) {
            case GameStatus.CONFIG:
            case GameStatus.WAITING:
                const playerJoinURL = `${window.location.origin}${window.location.pathname}#/?roomCode=${state.game?.room_code}`;
                return (
                    <div className="text-center flex flex-col items-center justify-center">
                        <h1 className="text-6xl font-black text-white mb-4">Entre no Jogo!</h1>
                        <p className="text-2xl text-white/70 mb-8">Aponte a câmera do seu celular para o QR Code abaixo.</p>
                        
                        <div className="bg-white p-8 rounded-xl shadow-2xl">
                            <QRCode
                                value={playerJoinURL}
                                size={256}
                                bgColor="#FFFFFF"
                                fgColor="#1A1A2E"
                                level="H"
                            />
                        </div>

                        <div className="mt-12">
                            <p className="text-xl text-white/80">Ou acesse pelo código:</p>
                            <p className="text-5xl font-bold text-primary tracking-widest bg-black/20 px-6 py-2 rounded-lg mt-2">{state.game?.room_code}</p>
                        </div>
                    </div>
                );
            case GameStatus.COUNTDOWN:
                return (
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-6">A rodada começa em...</h1>
                        <p className="text-9xl font-black text-primary animate-ping">{state.countdown}</p>
                    </div>
                );
            case GameStatus.QUESTION:
            case GameStatus.ROUND_END: {
                const question = state.questions[state.currentQuestionIndex];
                if (!question) return null;

                const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);

                return (
                    <div className="w-full h-full flex gap-8 p-10">
                        <div className="flex-[3] flex flex-col items-center justify-center bg-black/20 rounded-2xl p-8">
                            <p className="text-2xl text-white/70 mb-4">Pergunta {state.currentQuestionIndex + 1} de {state.questions.length}</p>
                            <h1 className="text-5xl font-bold text-center text-white">{question.question}</h1>
                        </div>
                        <div className="flex-1 bg-black/20 rounded-2xl p-8">
                            <h2 className="text-3xl font-bold text-white mb-6 text-center">Ranking</h2>
                            <div className="flex flex-col gap-4">
                                {sortedPlayers.slice(0, 5).map((player, index) => (
                                    <div key={player.id} className={`flex items-center gap-4 p-4 rounded-lg bg-surface-dark-hover ${index === 0 ? 'border-2 border-yellow-400' : ''}`}>
                                        <span className="text-2xl font-bold text-white/80 w-8">{index + 1}º</span>
                                        <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-full" />
                                        <p className="text-xl font-medium text-white flex-grow">{player.name}</p>
                                        <p className="text-2xl font-bold text-primary">{player.score}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }
            case GameStatus.GAME_END:
                const winner = [...state.players].sort((a, b) => b.score - a.score)[0];
                return (
                    <div className="text-center">
                        <h1 className="text-6xl font-black text-primary mb-4 animate-pulse">Fim de Jogo!</h1>
                        <h2 className="text-4xl text-white mb-2">O vencedor é...</h2>
                        {winner && (
                            <div className="mt-8 flex flex-col items-center gap-4">
                                <img src={winner.avatar} alt={winner.name} className="w-40 h-40 rounded-full border-4 border-yellow-400 shadow-lg"/>
                                <p className="text-5xl font-bold text-yellow-300">{winner.name}</p>
                                <p className="text-3xl font-bold text-white">{winner.score} pontos</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-screen h-screen bg-background-dark flex items-center justify-center">
            {renderContent()}
        </div>
    );
};

export default PublicDashboard;
