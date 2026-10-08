# Novo plano de recompensas $VZN

## O problema hoje
No protótipo, assistir rende 2 $VZN a cada 2 minutos: 60 $VZN por hora, sem limite. Uma única pessoa assistindo 3 h por dia receberia cerca de 5.400 $VZN por mês. Com 1 milhão de usuários, isso passa de toda a reserva de incentivos (400M) em menos de 3 meses. Comprar um título rende +5 $VZN fixos.

## Princípio
Assistir rende **XP** (pontos de jogo, sem valor de troca). O $VZN vira prêmio de **gamificação**: missões, sequências de dias, níveis e criação com qualidade. Tudo com teto diário e um orçamento mensal fixo.

## Regras propostas (valores ajustáveis)

| Ação | Antes | Depois |
|---|---|---|
| Assistir | 2 $VZN / 2 min | 10 XP / 10 min, sem $VZN direto |
| Concluir um título (80% ou mais) | — | 0,5 $VZN |
| Missões diárias (3 por dia) | — | 1 $VZN cada |
| Sequência de 7 dias | — | bônus de 5 $VZN |
| Compra avulsa | +5 $VZN | 1 $VZN |
| Criação publicada e aprovada pela IA | — | 10 $VZN |
| **Teto diário por pessoa** | sem limite | **5 $VZN** (bônus semanal fora do teto) |

Níveis por XP (Bronze, Prata, Ouro, Diamante) multiplicam o $VZN de missões em 1,0 / 1,1 / 1,2 / 1,3, sem passar o teto.

## Saúde da economia
- **Orçamento mensal fixo**: a reserva "Ecossistema & Comunidade" (400M, 48 meses) libera no máximo ~8,3M $VZN por mês.
- **Redução programada**: as recompensas caem 15% a cada semestre.
- **Rateio**: se os pedidos do mês passarem do orçamento, todas as recompensas são reduzidas na mesma proporção.
- **Contra fraudes**: vídeo mudo, aba em segundo plano ou repetição do mesmo título não contam.
- **Modo infantil**: só XP. Nenhum $VZN vai para perfis de criança.

## O que muda na plataforma
- **Assistir**: o contador mostra XP e o progresso para concluir o título. O aviso "+2 VZN" sai.
- **Início do protótipo**: novo cartão "Missões do dia" com as 3 missões, a sequência de dias, o nível e a barra do teto diário (ex.: 3/5 $VZN hoje).
- **Carteira**: a barra do teto diário e o histórico separado por origem (missão, conclusão, sequência, criação).
- **Whitepaper e Criadores**: tabela "Como se ganha $VZN" com as novas regras, o orçamento e a redução programada, com o selo "estimativa, não é promessa".
- **Traduções** EN/ES/ZH para todos os textos novos.

## Detalhes técnicos
- Novo módulo `src/experience/rewards.ts` com constantes (`DAILY_CAP=5`, `WATCH_XP_PER_10MIN=10`, `COMPLETE_VZN=0.5`, `MISSION_VZN=1`, `STREAK7_BONUS=5`, `PURCHASE_VZN=1`, `CREATION_VZN=10`, `LEVELS`, `MONTHLY_BUDGET`, `SEMESTER_DECAY=0.15`) e funções puras: `applyDailyCap`, `levelFor(xp)`, `emissionFor(month)`, `prorate(requested, budget)`, `eligibleWatch({muted, hidden, repeat, kids})`.
- `store.tsx`: estado de XP, missões, sequência e total ganho hoje (salvo no navegador, zera à meia-noite). `earn()` passa por `applyDailyCap`. A compra avulsa passa a dar 1.
- `app.assistir.tsx`: XP a cada 10 min, checagem de mudo e de aba visível (`document.visibilityState`), e 0,5 $VZN ao chegar em 80%.
- Testes vitest para cada regra: teto de 5/dia, bônus de 7 dias fora do teto, multiplicadores por nível, 15% de redução por semestre, rateio e o modo infantil zerando o $VZN.
