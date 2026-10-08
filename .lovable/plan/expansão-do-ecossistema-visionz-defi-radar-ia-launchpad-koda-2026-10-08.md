# Expansão do ecossistema VisionZ: DeFi, Radar IA, Launchpad, Koda e redes (demonstração)

Tudo roda como demonstração no protótipo: valores de exemplo, sem dinheiro real, sem carteira de verdade e sem contratos na blockchain. Toda tela leva o selo "Demonstração · exemplo, não é promessa". Nada promete retorno garantido.

## Novas telas no protótipo

O menu ganha um grupo "Ecossistema DeFi" com cinco itens. As telas atuais de Finanças e Carteira continuam e passam a ter atalhos para as novas.

1. **Crédito (empréstimos com garantia)**
  - Mercados separados por ativo (SOL, USDC, $VZN, RWA). Cada mercado mostra o limite de empréstimo (LTV), o ponto de liquidação, os juros de quem deposita e de quem pega emprestado e quanto do mercado está em uso. *Crie um sistema de bloqueio anti-perdas (limite aceitável máximo e configurável até 50%)
  - Simulador: você deposita uma garantia, escolhe quanto quer pegar emprestado e vê a "saúde" da posição. A barra vai do verde ao vermelho e mostra a partir de qual preço a posição seria liquidada.
  - Modo eMode para pares parecidos (SOL e SOL em staking; $VZN e $VZN em staking), com limite de até 90%. *Sistema de segurança para finalizar automaticamente em caso de perda abaixo dos 50%
  - Teste de choque: um botão "E se o preço cair 30%?" mostra o efeito na posição.
2. **Cofres de rendimento**
  - Multiply, Creator Yield (financia produções do Synth com participação na receita) e Real Yield (taxas divididas com quem tem $VZN em staking).
  - Cada cofre mostra a estratégia em passos, o risco e uma simulação usando a conta do simulador atual.
3. **Radar IA (análise de tokens)**
  - Lista de tokens da Solana com Nota de Segurança de 0 a 100.
  - Cada nota se explica pelos motivos: concentração nos maiores donos, liquidez travada, permissões do contrato (emitir/congelar).
  - Sinais de baleias, termômetro de sentimento e um gráfico de tendência com faixa de incerteza.
  - Alertas configuráveis, guardados no navegador.
  - Texto fixo: "Não é recomendação de investimento".
4. **Launchpad para terceiros**
  - Vitrine de projetos (jogos, estúdios, apps).
  - Formulário "Enviar meu projeto" em 4 passos: dados, modelo de contrato, uso do $VZN e revisão. Ao final, uma tela de status "Em análise pela governança".
  - Catálogo de modelos pré-auditados: token, staking, vesting, royalties, leilão.
  - Página de APIs (Filtro Inteligente, Synth, Jukebox) com exemplos de código em TypeScript e uma chave de teste falsa.
5. **Koda — Aprenda e ganhe**
  - Trilhas de aprendizado, como "Criar no Synth" e "DeFi com segurança", com aulas curtas e um quiz.
  - Ao concluir, você ganha $VZN de demonstração e um certificado (selo intransferível), que dá benefícios simulados: taxa menor no Crédito e limite maior.
6. **Ponte entre redes**
  - Leve $VZN ou USDC entre Solana, Base e Arbitrum, com cotação fixa, prazo de 1 a 4 segundos e o token original na chegada.
  - Botões de "Conectar Phantom/MetaMask" de demonstração.
  - Um quadro compara a ponte comum com o modelo deBridge.

## Site público (explicação simples)

- **O que vem por aí:** os seis módulos viram cartões com "o que é" e "exemplo do dia a dia". A linha do tempo passa a mostrar as quatro fases do documento, com os itens de cada mês.
- **Whitepaper:** entra a tabela "Para onde vai o $VZN":
  - IA: queima de 10%.
  - Assinaturas: recompra com 20% do lucro.
  - Crédito: metade queimada, metade para quem tem $VZN em staking.
  - Launchpad: $VZN travado como garantia.
  - Ponte: recompra para o tesouro.
  - Koda: emissão controlada.
- **Whitepaper:** entra também a tabela de receitas por fonte (R$ 6M, 50M e 232M; EBITDA de −10%, +28% e +42%) e a matriz de riscos com as medidas de proteção.
- Os números seguem o cenário de Expansão que o site já usa. Todos os textos novos saem traduzidos para EN, ES e 中文, e os valores em reais são convertidos.

## O que não entra agora

Contratos reais, carteiras conectadas de verdade, dados de mercado ao vivo e governança/DAO funcionando. Ficam para uma fase de produção com equipe de contratos e auditorias.

## Ordem de entrega

1. Contas e dados de exemplo, com testes.
2. Crédito e Cofres.
3. Radar IA.
4. Launchpad.
5. Koda e Ponte.
6. Site e Whitepaper.
7. Traduções.
8. Verificação em celular e computador.

## Detalhes técnicos

- Novas rotas: `app.credito.tsx`, `app.cofres.tsx`, `app.radar.tsx`, `app.launchpad.tsx`, `app.koda.tsx`, `app.ponte.tsx`, cada uma com o próprio `head()`. Os itens entram no menu em `app.tsx`.
- `src/experience/defi.ts` (funções puras):
  - `healthFactor(collateral, price, liqThreshold, debt)` e `liquidationPrice(...)`.
  - `borrowRate(utilization)`, uma curva com ponto de inflexão.
  - `maxBorrow(ltv, eMode)` e `shock(position, pct)`.
  - `safetyScore(holdersTop10, lockedLiquidity, mintAuth, freezeAuth)`, que devolve a nota e os motivos.
  - `bridgeQuote(amount, from, to)`, com taxa fixa e sem derrapagem.
  - `kodaReward(track)`.
- `src/experience/defi-data.ts`: mercados, cofres, tokens do Radar, projetos do Launchpad, modelos de contrato e trilhas da Koda.
- Estado de demonstração (saldos, posição de crédito, cursos concluídos, alertas) guardado no store atual com localStorage. Não cria tabelas novas.
- `src/experience/defi.test.ts` (vitest), com valores concretos:
  - eMode com limite de 90%.
  - Saúde abaixo de 1 = liquidável.
  - Divisão das taxas de Crédito: 50% queima, 50% stakers.
  - Queima de 10% no uso da IA.
  - Nota de Segurança cai quando há permissão de emissão ativa.
- Componentes do design system: Card, Stat, Badge, Tabs, Dialog, TokenBadge e NetworkTag, com ciano para risco/tecnologia e o degradê da marca para valores. Gráficos em SVG no padrão do `finance-ui.tsx`.
- i18n: todo texto PT novo ganha entrada no `dict.ts` no mesmo commit.