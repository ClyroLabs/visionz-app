# VisionZ — Landing page e protótipo da plataforma

## O que os documentos dizem (síntese)
- **Quem**: VisionZ Entertainment, o braço de streaming futurista da Clyro Labs. Mensagem: "O entretenimento nunca mais será o mesmo."
- **Posicionamento**: "Streaming Ético, Criativo e Lucrativo". A mensagem central é "Segurança absoluta para a sua família, liberdade total para criar, rentabilidade máxima para os parceiros."
- **Pilares**:
  1. Tecnologia Clyro: baixa latência, IA nativa, escala global, 4K/8K.
  2. Criação: Clyro Synth (séries animadas, como *Aventuras do Trio Alegria* e *Rebeca e sua turma*) e Clyro Jukebox (música original; quem cria é dono da obra).
  3. Filtro Inteligente: análise de imagem frame a frame, análise de áudio em vários idiomas e revisão humana que retreina a IA. A proteção infantil vem em primeiro lugar.
  4. Ecossistema de ganhos: participação para criadores (VisionZ Ambassadors), assinantes e parceiros, com tokenização e valorização cruzada.
- **Receitas**: assinaturas Premium e Family, ferramentas Pro, licenciamento da IA, marketplace de conteúdo, taxa do ecossistema e anúncios inteligentes.
- **Números (Master Plan)**: 500 mil / 2,5 milhões / 8 milhões+ de usuários; receita de R$ 15M / R$ 90M / R$ 350M; margem EBITDA de -12% / 22% / 35%.
- **Tecnologia (Clyro Agent Core)**: um orquestrador coordena vários agentes (Marketing, Dev, Web3, R&D). A plataforma conta com memória, uma camada de IA, um gateway de blockchain e um roteiro em três fases: MVP (0–3 meses), Beta (3–6 meses) e Produção (6–12 meses).
- **Nome**: os documentos e a logo usam "VisionZ". Passo a usar **VisionZ** em todos os textos, inclusive na vitrine atual.

## Parte 1 — Landing page (`/site`)
Uma página longa, com páginas próprias para os temas que merecem aprofundamento:
1. **Topo**: "O entretenimento nunca mais será o mesmo.", a logo, os botões "Entrar na lista de espera" e "Sou investidor", e os selos de destaque (IA Clyro, 4K/8K, multichain, seguro para crianças).
2. **Como funciona**: assistir, criar e ganhar, em 3 passos.
3. **Segurança familiar**: as três etapas do Filtro Inteligente em um diagrama animado, com uma demonstração do Modo infantil.
4. **Estúdio de criação**: Clyro Synth e Clyro Jukebox, com cartões das séries em produção.
5. **Ecossistema de ganhos**: quem ganha e como (criadores, assinantes, embaixadores, parceiros), com uma carteira de exemplo. O texto fala em "recompensas no ecossistema", sem promessa de retorno garantido.
6. **Planos**: Premium e Family, com compra avulsa de títulos e ferramentas Pro.
7. **Tecnologia Clyro**: mapa visual dos agentes e o roteiro MVP → Beta → Produção.
8. **Programa VisionZ Ambassadors**: chamada para criadores.
9. **Rodapé**: "VisionZ Entertainment & Clyro Labs".

Páginas próprias:
- **`/site/investidores`**: por que investir agora, as quatro fontes de receita, gráfico das projeções de 3 anos (Master Plan), gestão de risco e o convite a parceiros.
- **`/site/criadores`**: Synth, Jukebox, divisão de receita e Ambassadors.
- **`/site/seguranca`**: o Filtro Inteligente em detalhe, para pais e educadores.

Os formulários de lista de espera e de contato com investidores aparecem neste primeiro momento como demonstração, com aviso de "recebido". Para gravar de verdade, depois ativamos o Lovable Cloud.

## Parte 2 — Protótipo da plataforma (`/app`)
Um aplicativo navegável com dados de exemplo e menu lateral:
- **Início**: destaque principal, fileiras de títulos ("Em alta", "Produções Clyro Synth", "Para a família") e compra avulsa ao clicar.
- **Assistir**: player completo com classificação indicativa, selo "Verificado por IA" e recompensa por tempo assistido (aviso animado).
- **Perfis e Modo infantil**: ao trocar para o perfil infantil, o catálogo é filtrado na hora (só Livre e 10 anos), e os títulos bloqueados aparecem com o motivo.
- **Estúdio do criador**: envio de vídeo com barra de "análise da IA", painel de ganhos, vendas avulsas e atalhos para o Synth e o Jukebox.
- **Carteira**: saldo de recompensas, troca de rede, histórico de ganhos e resgate (simulado).
- **Central de moderação**: fila de itens marcados pela IA, com decisão humana (aprovar ou bloquear) e o contador "IA retreinada".
- **Painel do ecossistema**: o mapa dos agentes Clyro com status e eventos em tempo real (simulados).

## Parte 3 — Ajustes na vitrine
- Mudar "VizionZ" para "VisionZ" em todos os textos.
- Na navegação, adicionar links para "Site" e "Protótipo".

## Detalhes técnicos
- Rotas novas: `src/routes/site.tsx` (layout) + `site.index.tsx`, `site.investidores.tsx`, `site.criadores.tsx`, `site.seguranca.tsx`; `src/routes/app.tsx` (layout com menu lateral) + `app.index.tsx`, `app.assistir.tsx`, `app.perfis.tsx`, `app.estudio.tsx`, `app.carteira.tsx`, `app.moderacao.tsx`, `app.ecossistema.tsx`. Cada rota tem seu próprio head().
- Código do site e do protótipo em `src/experience/` (dados de exemplo, seções), adicionado ao `.dsignore` para não vazar para quem conecta a biblioteca. Montado só com os componentes do barril `@/index`.
- Componentes novos que fazem sentido para a biblioteca, com variantes CVA, entram em `src/vizionz/` e no barril: `Stat` (número de destaque), `SectionHeading`, `PricingCard`, `Timeline` (roteiro), `ModerationItem` e `RewardToast` (variante do aviso), além da página de componentes da vitrine.
- Gráfico de projeções com `recharts` (já instalado), usando as cores dos tokens.
- Estado do protótipo (perfil ativo, saldo, fila de moderação) em um contexto React local, sem backend.
- Imagens: capas dos títulos geradas com IA no estilo da marca e salvas em `src/assets/`. Nenhuma logo é redesenhada.
- Testes (vitest): o filtro do Modo infantil só libera L/10, e o resgate não deixa o saldo negativo.
