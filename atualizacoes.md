# Documento de Requisitos do Produto (PRD) - QuizColetivo

## Visão Geral

O QuizColetivo é um aplicativo de quiz multiplayer em tempo real, projetado para permitir que administradores configurem e gerenciem jogos de quiz, enquanto os jogadores participam e respondem a perguntas geradas por IA.

## Funcionalidades Implementadas

### 1. Interface do Usuário (Frontend)

*   **Visão do Jogador (`PlayerView.tsx`):**
    *   Permite que os jogadores entrem em um jogo de quiz existente.
    *   Participação ativa no quiz, respondendo às perguntas.
    *   (Detalhes adicionais sobre a interação do jogador a serem especificados).

*   **Visão do Administrador (`AdminDashboard.tsx`, `AdminLogin.tsx`):**
    *   **Autenticação:** Login de administrador para acesso ao painel de controle.
    *   **Criação de Jogo:** Opção para criar um novo jogo caso nenhum esteja ativo.
    *   **Configuração do Quiz:**
        *   Definição do número de perguntas para o quiz.
        *   Seleção da categoria/tema das perguntas (ex: Tecnologia, Ciência, História).
        *   Salvamento das configurações do jogo no banco de dados Supabase.
    *   **Controle do Jogo:**
        *   Início do jogo: Aciona a geração de perguntas e inicia a contagem regressiva do jogo.
        *   Pausar/Retomar jogo: Permite ao administrador controlar o fluxo do jogo.
        *   Reiniciar jogo: Opção para resetar o jogo, limpando jogadores, perguntas e respostas.
    *   **Monitoramento:**
        *   Exibição do status atual do jogo (Configuração, Contagem Regressiva, Pergunta, Pausado, Fim do Jogo).
        *   Visualização da pergunta atual sendo exibida aos jogadores.
        *   Lista de jogadores online, com a capacidade de remover jogadores.

*   **Painel Público (`PublicDashboard.tsx`):**
    *   (Funcionalidade básica existente, detalhes específicos a serem definidos para exibição pública do jogo/resultados).

*   **Navegação:**
    *   Links de navegação entre as visões de Jogador, Administrador e Painel Público.

### 2. Backend (Supabase & Edge Functions)

*   **Integração com Supabase (`supabaseClient.ts`):**
    *   Configuração do cliente Supabase para interação com o banco de dados e serviços de autenticação/funções.
    *   Conexão com o projeto Supabase usando URL e chave anônima.

*   **Atualizações em Tempo Real:**
    *   Utilização das assinaturas Realtime do Supabase para sincronizar o estado do jogo, a lista de jogadores, as perguntas e as respostas dos jogadores em tempo real entre todos os clientes conectados.
    *   Monitoramento de alterações nas tabelas `games`, `players`, `questions` e `player_answers`.

*   **Gerenciamento de Dados do Jogo:**
    *   **Tabela `games`:** Armazena configurações do jogo (código da sala, status, número de perguntas, categoria, ID do administrador).
    *   **Tabela `players`:** Armazena informações dos jogadores (ID, nome, avatar, status online, ID do jogo).
    *   **Tabela `questions`:** Armazena as perguntas geradas (texto da pergunta, opções, resposta correta, índice de ordem, ID do jogo).
    *   **Tabela `player_answers`:** Armazena as respostas dos jogadores.

*   **Edge Function de Geração de Perguntas (`supabase/functions/generate-quiz-questions/index.ts`):**
    *   **Propósito:** Função serverless executada no Supabase Edge para gerar perguntas de quiz.
    *   **Entrada:** Recebe `category` (categoria do quiz) e `numberOfQuestions` (número de perguntas a gerar).
    *   **Integração com IA:** Utiliza a API OpenRouter AI para gerar perguntas de múltipla escolha de alta qualidade.
    *   **Formato de Saída:** Retorna um objeto JSON estrito contendo um array de objetos de pergunta, cada um com `question` (texto), `options` (array de 4 strings) e `correctAnswer` (string).
    *   **Segurança:** A chave da API OpenRouter (`OPENROUTER_API_KEY`) é armazenada como um segredo do Supabase, garantindo que não seja exposta no frontend.

### 3. Camada de Serviço de API (`apiService.ts`)

*   **Abstração:** Fornece uma função `generateQuizQuestions` que atua como uma interface para o frontend.
*   **Invocação da Edge Function:** Esta função agora invoca a Edge Function `generate-quiz-questions` do Supabase, em vez de chamar diretamente a API externa.
*   **Segurança e Consistência:** Garante que a lógica de chamada da API de IA seja centralizada e que a chave da API permaneça segura no backend, promovendo uma arquitetura mais limpa e segura.
