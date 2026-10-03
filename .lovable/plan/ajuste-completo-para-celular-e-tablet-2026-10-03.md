# Ajuste completo para celular e tablet

Objetivo: no celular (até ~640px) e no tablet (~640–1024px), tudo deve caber na largura da tela sem rolagem lateral. Ícones e textos dos cards ficam centralizados, os menus aparecem inteiros em um único painel e as fontes ficam menores.

## 1. Menus em um único quadro
- **Site:** troco a faixa de links com rolagem lateral (abaixo do cabeçalho) por um botão de menu (três linhas). Ao tocar, abre um painel que ocupa a tela, com logo, os 4 links, o botão "Abrir protótipo" e o "Entrar na lista de espera", todos visíveis sem rolagem. Fecha ao escolher um link, ao tocar no X ou com a tecla Esc.
- **Cabeçalho no celular:** fica só o símbolo VZ, o nome menor e o botão de menu. "Abrir protótipo" vai para dentro do painel.
- **Protótipo (/app):** o menu de seções vira o mesmo tipo de painel no celular. No tablet, uma grade de ícones que cabe em um só quadro.

## 2. Ícones e textos centralizados
- No celular e no tablet, os cards ("Assista / Crie / Ganhe", agentes Clyro, segurança, planos, criadores, investidores) passam a ter ícone, título e texto centralizados. No computador continuam alinhados à esquerda.
- A faixa dos 5 pilares (Criação, Streaming, IA, Seguro, Recompensas) usa uma grade 2+2+1 centralizada no celular e 5 colunas a partir do tablet. As linhas divisórias aparecem só no computador.
- Os números (0%, 40%, 4K/8K, 5) ficam centralizados em 2 colunas.

## 3. Tamanhos de cards e elementos
- Espaçamento interno e distância entre seções reduzidos no celular (cerca de 60%) e no tablet (cerca de 80%).
- Grades: 1 coluna no celular, 2 no tablet, 3 ou 4 no computador.
- O anel de órbita e os brilhos ficam proporcionais à tela, sem ultrapassar as bordas.
- Botões do topo empilhados com largura total no celular, lado a lado no tablet.
- Capas do catálogo em carrossel controlado, sem empurrar a página para os lados.

## 4. Fontes menores
| Elemento | Celular | Tablet | Computador (como hoje) |
|---|---|---|---|
| Título principal | ~30px | ~44px | 72px |
| Títulos de seção | ~22px | ~30px | 48px |
| Texto de apoio | 15px | 16px | 18px |
| Rótulos espaçados | menos espaço entre letras | — | — |

## 5. Verificação
Capturas em 360, 393, 768, 820 e 1024px em todas as páginas do site e do protótipo, confirmando que não há rolagem lateral, que o menu cabe inteiro na tela e que os itens estão centralizados.

## Detalhes técnicos
- Novo componente `MobileNav` na biblioteca (diálogo nativo, foco preso, `aria-expanded`, fecha ao trocar de rota), exportado pelo barril. Mantém o padrão de variantes e tokens.
- `Section`, `SectionHeading`, `Card`, `Stat` e `PricingCard` recebem classes responsivas: `text-center sm:text-left` e `items-center` ficam até `lg`; tipografia fluida com `clamp()` na escala display.
- Corrijo as divisórias `md:divide-x` → `lg:divide-x`, adiciono `overflow-x-clip` na raiz do site e `min-w-0` nos itens das grades para eliminar o transbordo.
- Atualizo `.lovable/system.md` com as regras de responsividade (celular primeiro, centralizado até tablet).
