## Resolução de Erro de Build no Netlify: Exposição de Variáveis de Ambiente

**Problema:**
O build do projeto no Netlify estava falhando devido à detecção de variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) no output final do build. O recurso de "Secrets Scanning" do Netlify, por padrão, impede o deploy quando detecta o que considera informações sensíveis no bundle de produção.

**Causa:**
As variáveis de ambiente com o prefixo `VITE_` são injetadas diretamente no código JavaScript do lado do cliente pelo Vite durante o processo de build. Embora `VITE_SUPABASE_ANON_KEY` seja uma chave anônima e projetada para uso no cliente, o Netlify a trata como um segredo que não deve ser exposto no bundle público.

**Solução:**
Para permitir que o build seja concluído sem desabilitar completamente o recurso de segurança do Netlify, instruímos o Netlify a ignorar especificamente essas chaves durante a verificação de segredos.

**Passos para Implementar a Solução no Netlify:**
1.  Acesse o painel do seu site no Netlify.
2.  Navegue até **Configurações de Build e Deploy** (`Build & deploy settings`).
3.  Clique em **Variáveis de Ambiente** (`Environment variables`).
4.  Adicione uma nova variável de ambiente com os seguintes detalhes:
    *   **Nome:** `SECRETS_SCAN_OMIT_KEYS`
    *   **Valor:** `VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY`

Após adicionar esta variável, o Netlify permitirá que o build seja concluído, pois será instruído a ignorar a detecção dessas chaves específicas no bundle de produção.