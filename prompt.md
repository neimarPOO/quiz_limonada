Crie um aplicativo web de quiz coletivo em tempo real com três interfaces distintas:

**INTERFACE DO JOGADOR:**
- Tela de entrada onde o usuário recebe automaticamente um código único ao acessar
- Exibição clara do nome/código do jogador e pontuação atual
- Área destacada para perguntas com tipografia grande e legível
- Botões de resposta (A, B, C, D) com animações ao hover e feedback visual ao selecionar
- Timer visível para cada pergunta
- Feedback imediato (acerto/erro) com animações celebratórias ou de apoio
- Ranking ao vivo durante a rodada
- Tela de espera entre rodadas com animações sutis
- Notificações de início/fim de rodada

**INTERFACE DO ADMIN:**
- Painel de controle completo do jogo
- Configuração de rodadas: número de perguntas (mínimo 5, customizável)
- Seleção de temas predefinidos
- Duas opções para perguntas:
  1. Inserção manual (formulário intuitivo)
  2. Geração automática via IA usando OpenRouter API (modelo: openai/gpt-oss-20b:free)
- Prompt para IA: "Gere [X] perguntas de múltipla escolha sobre [TEMA] com 4 alternativas cada, sendo apenas 1 correta. Formato JSON: [{pergunta, opcoes:[], respostaCorreta}]"
- Controles de rodada: iniciar, pausar, encerrar antecipadamente
- Timer configurável por pergunta
- Gestão de desempates automáticos (sudden death com novas perguntas)
- Botão para abrir dashboard em nova janela/URL único
- Lista de jogadores conectados em tempo real
- Histórico de vencedores

**INTERFACE DO DASHBOARD (público):**
- Tela de projeção para exibição pública
- Contagem regressiva para início de cada rodada
- Exibição da pergunta atual sincronizada com todos os jogadores
- Placar em tempo real com animações de mudança de posição
- Destaque visual para o líder
- Anúncio do vencedor com animação celebratória (nome + código único)
- Estatísticas da rodada: total de jogadores, taxa de acertos, etc.
- Pode ser embutida no admin OU acessada via URL independente

**REQUISITOS TÉCNICOS:**
- React com hooks para gerenciamento de estado
- Armazenamento em memória (sem banco de dados)
- Sincronização em tempo real entre as três interfaces
- Cada mudança no admin só afeta a próxima rodada (rodada atual continua com config anterior)
- Sistema de códigos únicos para jogadores (6 caracteres alfanuméricos)
- Integração com OpenRouter API conforme documentação fornecida
- Headers da API: Authorization com bearer token, HTTP-Referer, X-Title, Content-Type

**DESIGN:**
- Estilo descontraído, disruptivo e minimalista
- Paleta de cores vibrantes com bom contraste
- Animações suaves (transições, hover effects, entrada/saída de elementos)
- Fontes grandes e legíveis (mínimo 18px para texto corrente)
- Espaçamento generoso entre elementos
- Microinterações em botões e cards
- Responsivo para desktop e mobile
- Efeitos de partículas ou confetes para celebrações
- Loading states elegantes durante geração de perguntas por IA

**FLUXO DO JOGO:**
1. Admin configura tema e número de perguntas
2. Admin escolhe entre criar perguntas manualmente ou gerar via IA
3. Admin inicia rodada (timer de entrada para novos jogadores)
4. Dashboard mostra contagem regressiva
5. Perguntas aparecem simultaneamente para todos
6. Jogadores respondem dentro do tempo limite
7. Placar atualiza após cada pergunta
8. Ao fim das perguntas, identifica vencedor(es)
9. Se empate: rodada extra automática apenas com empatados
10. Vencedor único é anunciado com destaque
11. Admin pode iniciar nova rodada com novas configurações

