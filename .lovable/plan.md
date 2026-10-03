# Sistema de design VizionZ — futurista, blockchain, streaming

## Leitura das logos
- **VizionZ Entertainment** (logo principal): degradê roxo, magenta e laranja, com o "O" em forma de nota musical. Define a energia criativa e audiovisual.
- **Clyro / Clyro Labs AI / ícone Clyro**: ciano neon, cérebro com circuitos, gota com dragão, "C" mecânico em fundo azul-noite. Interpretadas como a camada de tecnologia (IA de moderação, blockchain) por trás da VizionZ — "powered by Clyro Labs".
- Observação: a arte da logo diz "VISIONZ" e o texto da mensagem diz "VizionZ". O plano usa as logos exatamente como enviadas e escreve "VizionZ" nos textos; confirme qual é o correto.

## Direção visual
- Base escura (azul-noite das logos Clyro), superfícies de vidro com bordas finas luminosas.
- Duas cores de destaque: degradê VizionZ (criação, ganhos, ações principais) e ciano Clyro (tecnologia, segurança, status da rede).
- Tipografia: Orbitron/Exo para títulos (eco do "CLYRO"), Inter para texto.
- Detalhes: linhas de circuito, brilho neon suave, grade sutil. Tema claro opcional na vitrine.

## Vitrine (páginas)
1. **Visão geral** — manifesto: "A VizionZ vai revolucionar o streaming no Brasil e no mundo", pilares: criação audiovisual, streaming sob demanda e à la carte, recompensas multichain com ganhos ilimitados, conteúdo monitorado e seguro para crianças.
2. **Marca** — as quatro logos, usos corretos sobre fundos claros/escuros.
3. **Cores** e **Tipografia** — todos os tokens com nome e função.
4. **Ícones** — conjunto com busca.
5. **Componentes** — com barra lateral e busca, exemplos ao vivo e código.

## Componentes
Básicos: Botão (primário degradê, neon, fantasma, perigo), Campo, Seleção, Interruptor, Caixa, Selo, Avatar, Cartão, Abas, Diálogo, Menu, Dica, Aviso (toast), Barra de progresso, Esqueleto.
Específicos da plataforma:
- **Cartão de conteúdo** (capa, duração, preço à la carte ou "incluído").
- **Selo de classificação etária** e **Selo "Verificado por IA"** (moderação automática).
- **Controle de modo infantil**.
- **Carteira / saldo de recompensas** com seletor de rede (multichain).
- **Cartão de ganhos** do criador e **Etiqueta de rede**.
- **Barra do player** (play, progresso, qualidade).

## Detalhes técnicos
- Logos copiadas sem alteração para `src/assets/logos/`; favicon a partir do ícone Clyro (ou VizionZ, se preferir).
- Tokens em `src/styles/theme.css` (Tailwind v4 `@theme inline`), componentes com CVA em `src/components/`, `cn()` em `src/lib/utils.ts`, barril `src/index.ts`.
- `.lovable/meta.yaml` (react, tailwind, local), `.lovable/system.md` com regras (tokens, acessibilidade, tom), `.lovable/sources.yaml`, `lovable.toml`, `.dsignore` excluindo a vitrine.
- Rotas TanStack para cada página da vitrine, cada uma com seu título e descrição.
