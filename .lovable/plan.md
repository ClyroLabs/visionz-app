# Whitepaper VisionZ + painel financeiro no protótipo

Conteúdo dos três documentos (Especificação Técnica v2.4, Relatório de Expansão, widget de carteira) levado para o site e o protótipo, em linguagem clara e no visual VisionZ. Cenário financeiro: **Expansão (R$ 232 mi no ano 3)**. Rede do token: **Solana**, com Base e Arbitrum via ponte.

## 1. Nova página "Whitepaper" (/site/whitepaper)
Item novo no menu do site (no ☰ em celulares). Seções com índice lateral fixo no desktop:
1. **Visão geral** — problema (intermediários ficam com até 70%, pagamento em 90 dias) e solução.
2. **Arquitetura** — diagrama animado em 4 camadas: App → Gateway/CDN → Clyro Engine (IA) → Solana.
3. **Motores de IA** — Synth (pipeline roteiro → finalização), Jukebox (royalties por execução), Filtro em 3 camadas.
4. **Token $VZN na Solana** — SPL Token-2022, 1 bilhão de tokens, desconto de 20% em assinatura paga com $VZN, queima de 10% no uso de IA.
5. **Distribuição (gráfico de rosca)** — 40% comunidade, 25% vendas, 15% tesouraria, 12% equipe, 8% parceiros, com vesting ao clicar.
6. **Simulador de recompra e queima** — cenários Base / Conservador / Agressivo, sliders de recompra (α 20%) e queima (β 10%), preço médio; gráfico de linha do suprimento em 36 meses e totais (queimado, % destruído, recompras, suprimento final).
7. **Ecossistema de expansão** — DeFi (mercados isolados, eMode), simulador de vaults com aviso "exemplo, não é promessa", Launchpad PaaS, Koda Learn-to-Earn, comparação deBridge × pontes comuns.
8. **Receitas e projeções** — 4 motores de receita; gráfico de barras Plano Base × Expandido (anos 1–3, até R$ 232 mi, EBITDA 42%, equilíbrio no mês 11), marcado "estimativa".
9. **Riscos e roadmap** — matriz de 4 riscos com nível e roadmap em 4 fases (M1–4, M5–8, M9–12, M13+).

## 2. Protótipo: nova tela "Finanças" (/app/financas)
- **Carteira por categorias** (como o widget): rosca interativa com $VZN, SOL, USDC, Vaults e Recompensas; clique numa fatia abre o detalhe e "Voltar à visão geral". Valores de demonstração.
- **Simulador de vaults** (Multiply, Creator Yield, Real Yield) com aviso de exemplo.
- **Safety Score IA** de exemplo para $VZN/SOL/KODA (dados ilustrativos, sem conexão real).
- Item "Finanças" no menu do protótipo.

## 3. Ajustes de coerência
- Investidores e "O que vem por aí" passam a usar o cenário de R$ 232 mi (com o aviso de estimativa).
- Rede principal Solana: NetworkTag padrão e textos de carteira atualizados; Base/Arbitrum como redes conectadas.
- Tudo traduzido para EN/ES/中文.

## Fora deste passo
- Laboratório de IA e Copilot do relatório (já existem Synth e Filtro reais no protótipo; posso adicionar o Copilot depois).
- Conexão com blockchain real (ainda sem endereço do contrato $VZN).

## Detalhes técnicos
- Gráficos com recharts (já instalado): PieChart, LineChart, ComposedChart.
- Fórmula pura em `src/experience/logic.ts`: `burnSimulation({ months, revenue, alpha, beta, price, aiVolume })` → S(t+1) = S(t) − (α·R/P + β·V_ai); testes vitest com os valores do documento (cenário base ≈ 16,57 M queimados, 983,43 M finais — calibrar entradas a partir do script do HTML).
- Dados (tokenomics, fases, projeções base/expandido, riscos) em `src/experience/data.ts`; números de anos 1–2 do cenário expandido extraídos do script do relatório.
- Rotas: `src/routes/site.whitepaper.tsx`, `src/routes/app.financas.tsx` com head() próprio; strings novas no `dict.ts`.
