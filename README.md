# Bibliadle 📖

Um jogo diário inspirado em LoLdle: leia um versículo e adivinhe **livro, capítulo e versículo**. Feedback verde indica acerto e feedback vermelho com setas indica se a resposta está antes/depois ou é numericamente maior/menor.

## Tecnologias

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Lucide React
- Motion for React (`motion/react`, sucessor do Framer Motion)
- `localStorage` para tentativas e estatísticas (sem backend)
- API pública [Midvash](https://github.com/midvash/bible-api) para o texto bíblico, na **Almeida 1819 (domínio público)**

## Rodar localmente

Requisitos: Node.js 20.19+ ou 22.12+ (compatível com Vite 6).

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Outros comandos:

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

## Regras

1. Um versículo é selecionado para cada dia de calendário em `America/Sao_Paulo` (horário de Brasília), sem sorteio individual. Todos recebem a mesma pergunta.
2. O jogador informa um dos **66 livros do cânon protestante**, um capítulo e um versículo.
3. Cada campo é comparado **independentemente** com a resposta. Mesmo errando o livro, capítulo e versículo ainda recebem feedback numérico.
4. **Verde** = campo correto; **seta para cima** = livro posterior / capítulo ou versículo maior; **seta para baixo** = anterior / menor.
5. Não há limite de tentativas. Ao acertar, o jogador pode compartilhar um resultado sem spoiler. Tentativas e estatísticas ficam salvas no navegador.
6. O jogo muda à meia-noite em Brasília, inclusive quando a página permanece aberta no desafio do dia.
7. **Arquivo:** clique em **Ver todos os desafios** ou em **Arquivo** no menu. O calendário permite jogar cada dia desde 01/01/2026 até hoje, com indicadores de concluído/em andamento/não jogado. O botão **Anterior/Próximo** navega por dias consecutivos; não é possível acessar desafios futuros. Cada data tem seu progresso independente e os desafios previamente publicados não mudam.
8. Compartilhar um desafio anterior inclui `?data=AAAA-MM-DD` no link para que outra pessoa abra a mesma edição. Os botões de avançar/voltar do navegador também funcionam.

## Dados bíblicos

Os desafios iniciais estão em `src/data/dailyVerses.ts`. É um catálogo curado, que gira em ciclos determinísticos. Adicione referências ao catálogo para expandi-lo. A escolha se baseia na data, não em `Math.random()`.

O texto do versículo é consultado em tempo de execução na API Midvash (`GET /v1/almeida-livre/{book}/{chapter}/{verse}`). A fonte textual é [Almeida 1819](https://github.com/midvash/bible-data), declarada como domínio público pelo distribuidor. Não é preciso chave de API. **O texto requer conexão com a internet**; em caso de indisponibilidade, há um botão para tentar novamente. Não são usadas NAA, NVI ou outras traduções protegidas.

**Nota:** o formulário valida livros existentes, capítulos e o intervalo geral de versículos (1–176), mas ainda não valida o máximo de versículos de cada capítulo individualmente. Isso é uma melhoria recomendada antes de escalar o jogo.

## Publicação

O build estático em `dist/` pode ser publicado na Vercel ou Netlify usando `npm run build` e o diretório de saída `dist`.

Para subir o projeto manualmente em um repositório novo:

```bash
git init
npm install
npm run build
git add .
git commit -m "feat: lançar Bibliadle"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/bibliadle.git
git push -u origin main
```

Crie o repositório vazio no GitHub antes de executar o último comando.

## Licença

Código-fonte sob licença MIT (veja `LICENSE`). Texto bíblico consultado de fonte separada, em domínio público conforme metadados da fonte.
