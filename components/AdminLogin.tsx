
import React, { useState } from 'react';
import { useGame } from '../App';

const AdminLogin = () => {
    const { dispatch } = useGame();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded credentials as per requirement
        if (username === 'admin' && password === 'pobresservos') {
            dispatch({ type: 'ADMIN_LOGIN' });
        } else {
            setError('Credenciais inválidas.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-dark">
            <div className="bg-surface-dark p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-white text-3xl font-bold text-center mb-6">Login do Administrador</h1>
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-12 p-3 rounded-lg text-white bg-surface-dark-hover border-none focus:outline-0 focus:ring-2 focus:ring-primary"
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 p-3 rounded-lg text-white bg-surface-dark-hover border-none focus:outline-0 focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        className="w-full h-12 bg-primary text-background-dark font-bold rounded-lg hover:brightness-110 transition-transform"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
