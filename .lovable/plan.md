# Fundo harmonioso para a intro em celulares (tela em pé)

## O que muda
Hoje, com o celular em pé, o vídeo horizontal fica numa faixa no meio da tela. Acima e abaixo dele fica só uma foto parada e desfocada, o que passa a impressão de recorte mal feito. O fundo novo faz o vídeo parecer parte de uma cena só:

1. **Fundo em movimento:** uma cópia ampliada e bem desfocada do próprio vídeo toca atrás dele, sincronizada. As cores e luzes do fundo mudam junto com a cena.
2. **Bordas que se misturam:** o topo e a base do vídeo se dissolvem no fundo com um degradê suave, sem linha de corte.
3. **Luz da marca:** brilho de palco violeta/magenta atrás do vídeo, faixas de luz diagonais bem discretas e uma escurecida nas bordas da tela, mantendo a identidade da VisionZ.
4. **Reflexo:** um reflexo suave do vídeo logo abaixo dele, como num piso molhado, preenchendo a parte de baixo da tela.
5. **Símbolo VZ** discreto na parte de cima, para que o espaço vazio tenha propósito.

O celular deitado, o tablet e o computador continuam como estão hoje, com o vídeo ocupando a tela inteira. Os botões Pular, som e idioma e a tela "Toque para começar" continuam funcionando como hoje.

## Como vou conferir
Capturas de tela em 360, 390 e 430 px com o celular em pé e em 844 px com ele deitado. Vou checar que não aparece nenhuma faixa preta ou corte reto e que os botões continuam visíveis.

## Detalhes técnicos
- `src/routes/abertura.tsx`: trocar a `<img>` do pôster por um segundo `<video>` mudo (`aria-hidden`, `object-cover`, `scale-125 blur-3xl opacity-60`, `portrait:` apenas), sincronizado ao principal via `play`/`pause`/`seeked`/`timeupdate` (corrige a diferença quando passar de 0,3s). O pôster continua como fallback até carregar.
- O vídeo principal em portrait fica dentro de um wrapper `relative w-full aspect-video` com `mask-image: linear-gradient(transparent, black 12%, black 88%, transparent)` para dissolver as bordas.
- Camadas da marca com utilitários existentes: `bg-stage-glow`, `bg-light-streaks opacity-30`, vinheta radial, e `floor-reflection` no wrapper para o reflexo. Nada de cores hex nem estilo inline.
- O símbolo VZ (`Logo brand="visionz-symbol"`) fica no topo com `portrait:` apenas, sem sobrepor o seletor de idioma.
- Todas as camadas extras ficam ocultas com `landscape:hidden`; animações respeitam `prefers-reduced-motion`.
