# VisionZ — visual mais profissional, baseado na arte "VisionZ 8K"

## O que a imagem define
- Fundo quase preto com leve tom violeta, em vez do azul-noite atual.
- Degradê mais largo e mais quente: azul-violeta → violeta → magenta → laranja → dourado.
- Luz como elemento de design: brilho neon nas bordas, faixas diagonais de luz nos cantos, reflexo de "piso molhado" abaixo do conteúdo principal, anel orbital ao redor da marca.
- Tipografia: títulos grandes em branco metálico; rótulos em CAIXA ALTA bem espaçada ("INOVAÇÃO • MOBILIDADE • LIBERDADE"); sublinhado curto em degradê.
- Ícones de linha, cada um com uma cor da faixa do degradê.
- Moeda confirmada: **$VZN**, com selo circular de anel em degradê.

## Mudanças
1. **Cores**: novo fundo e novas superfícies (preto-violeta), degradê de marca em 5 paradas, e o ciano passa a ser só um destaque secundário para tecnologia e segurança. O tema claro é ajustado para combinar.
2. **Efeitos novos na biblioteca** (reutilizáveis):
   - faixas de luz diagonais nos cantos
   - brilho de palco atrás do conteúdo principal + reflexo no piso
   - anel orbital em degradê
   - borda com degradê que brilha (para cartões em destaque e preços)
   - título metálico
   - rótulo espaçado em caixa alta e sublinhado em degradê
3. **Componentes refinados**: botão principal com brilho mais forte e brilho ao passar o mouse; cartões com borda em degradê fina; selo de moeda "$VZN" no estilo do medalhão; ícones com cores do degradê.
4. **Site** (início, criadores, segurança, investidores): a abertura recriada no estilo da arte — frase de impacto com "visão de futuro" em degradê, faixas de luz, reflexo, linha de pilares com ícones coloridos e divisores finos.
5. **Protótipo e vitrine**: recebem as novas cores e efeitos; as páginas de Cores e Tipografia mostram os novos itens.
6. A imagem enviada **não** é usada como foto no site, só como referência visual. Se você quiser usá-la como imagem da abertura, eu incluo.

## Detalhes técnicos
- Tokens em `src/vizionz/styles/theme.css`: nova `--background`/`--surface*`, `--gradient-brand` com 5 paradas, tokens `--indigo` e `--gold`, novas sombras de brilho. Novos `@utility`: `bg-light-streaks`, `bg-stage-glow`, `floor-reflection`, `border-gradient-brand`, `text-metallic`, `text-eyebrow`, `underline-brand`.
- Novos componentes no barril: `OrbitRing`, `TokenBadge` ($VZN), `Eyebrow`; variante `glow` em `Card`; ícones com prop `tone`.
- Atualizar `.lovable/system.md` (paleta, efeitos, $VZN) e a memória do projeto (moeda $VZN, nova direção visual).
- Checar com capturas de tela no tema escuro e no claro.
