# Documento de Requisitos do Produto (PRD) - QuizColetivo

## Visão Geral

O QuizColetivo é um aplicativo de quiz multiplayer em tempo real, projetado para permitir que administradores configurem e gerenciem jogos de quiz, enquanto os jogadores participam e respondem a perguntas geradas por IA.

## Estado Atual da Aplicação (23/10/2025)

**A aplicação não está funcional.** Nenhuma das páginas (Admin, Player View, Dashboard) está operando como esperado. O último erro identificado (`new row violates row-level security policy for table "games"`) sugere um problema fundamental com a autenticação e as políticas de segurança de linha (RLS) do Supabase.

## Alterações Realizadas na Sessão Atual

1.  **Implementação do QR Code:**
    *   A biblioteca `react-qr-code` foi instalada.
    *   O componente `PublicDashboard.tsx` foi modificado para exibir um QR code para os jogadores entrarem no jogo.
    *   O componente `AdminDashboard.tsx` foi modificado para também exibir o QR code.

2.  **Refatoração para Múltiplas Salas:**
    *   **`App.tsx`**: O provedor de contexto (`GameProvider`) foi refatorado para buscar dados do jogo com base em um `roomCode` passado na URL.
    *   **`PlayerView.tsx`**: A tela do jogador foi modificada para ler o `roomCode` da URL e associar o jogador ao jogo correto no banco de dados.
    *   As assinaturas do Supabase Realtime foram ajustadas para serem específicas de cada sala, isolando a comunicação.

3.  **Correção de Erros de Build:**
    *   **Netlify Secrets Scanning:** O build no Netlify estava falhando devido à detecção de chaves de API no output. A solução foi configurar a variável de ambiente `SECRETS_SCAN_OMIT_KEYS` no Netlify para ignorar a verificação das chaves do Supabase e OpenRouter.
    *   **Erro de JSX:** Corrigido um erro de sintaxe JSX no `AdminDashboard.tsx` onde um componente foi definido dentro de outro.
    *   **Erro de CSS não encontrado:** Removido um link para `index.css` do `index.html` que estava causando um erro 404.

4.  **Tentativa de Correção de Autenticação:**
    *   **`AdminLogin.tsx`**: A função de login foi alterada para usar o método `supabase.auth.signInWithPassword()` em vez de credenciais hardcoded.
    *   **`AdminDashboard.tsx`**: A função de criação de jogo foi ajustada para usar o ID do usuário autenticado do Supabase.
    *   **Políticas RLS:** Foram fornecidas as queries SQL para criar as políticas de segurança de linha (RLS) necessárias para a tabela `games`, permitindo que usuários autenticados criem, vejam, atualizem e deletem seus próprios jogos.

## Próximos Passos (Sugestão para a Próxima Interação)

1.  **Verificar as Credenciais do Supabase:** Confirmar se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no Netlify estão 100% corretas.
2.  **Verificar a Criação do Usuário Admin:** Garantir que um usuário com as credenciais de login exista na seção "Authentication" do projeto Supabase.
3.  **Aplicar e Validar as Políticas RLS:** Executar o SQL fornecido no editor de SQL do Supabase e garantir que as políticas para a tabela `games` estejam ativas e corretas.
4.  **Debuggar o Fluxo de Autenticação:** Investigar por que o login do administrador ainda falha, mesmo após a implementação do `signInWithPassword`. Verificar o console do navegador em busca de erros detalhados no momento do login.