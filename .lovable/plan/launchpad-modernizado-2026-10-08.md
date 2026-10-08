# Launchpad modernizado

## O que muda para o usuário
- **Vitrine nova** na aba Projetos: ~16 projetos simulados com imagem de capa, em 8 categorias (Jogos, Estúdios, Música, Educação infantil, Ferramentas IA, Metaverso, Colecionáveis, Infra/DeFi).
- **Filtros**: chips de categoria, filtro por rede (Solana, Base, Arbitrum, Ethereum), status (Captação, Ativo, Em análise, Encerrado) e busca por nome; ordenação (mais recentes, mais captado, mais apoiadores).
- **Card moderno**: capa com selo da rede e status, nome, categoria, barra de progresso da captação, preço do token e apoiadores.
- **Detalhes ao clicar**: janela (no celular ocupa a tela inteira) com capa grande, descrição, rede e endereço de contrato fictício (copiável), supply total, circulante, preço, valor de mercado simulado, distribuição (comunidade / equipe / tesouraria / liquidez) em barras, cronograma de liberação, auditoria, links e data de lançamento. Botão "Apoiar (demonstração)" sem dinheiro real.
- Selo "Demonstração · exemplo, não é promessa" mantido; abas Enviar/Modelos/APIs continuam iguais.

## Responsividade
- Grade 1 → 2 → 3 → 4 colunas; filtros em linha rolável horizontal no celular; abas roláveis; textos com quebra/truncamento; detalhes em tela cheia no celular.

## Imagens
- Gerar ~16 capas (estilo VisionZ escuro/neon, sem texto) em `src/assets/launchpad/`.

## Detalhes técnicos
- Dados em `src/experience/launchpad-data.ts` (tipo `LaunchProject` com network, supply, allocation, vesting, raised/goal etc.) + lógica pura (progresso %, valor de mercado, filtrar/ordenar) com testes.
- Reaproveita `Dialog`, `NetworkTag`, `Badge`, `Card` do design system.
- Todo texto novo traduzido para EN/ES/ZH no dicionário.
