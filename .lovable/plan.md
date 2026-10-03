# Logo sem fundo, movimento na landing e abertura com vídeo

## 1. Logo do cabeçalho sem fundo
- A logo da VisionZ enviada é uma imagem com fundo branco (1024 x 1024, com muita margem em volta).
- Vou criar uma versão nova da logo **sem fundo branco** e **cortada só na área da marca**, mantendo as cores e o desenho originais (sem redesenhar). O arquivo original continua guardado.
- O cabeçalho do site deixa de usar a caixinha branca: a logo fica direto sobre o fundo escuro, maior e mais nítida.
- Resolução: a versão nova será salva no tamanho máximo que a imagem original permite, para não ficar borrada em telas de alta definição. Se você tiver o arquivo original em vetor (SVG/AI/PDF de verdade) ou em PNG grande, a nitidez fica perfeita — vale enviar.

## 2. Movimento na landing page
- Entrada suave dos textos e botões da abertura, um após o outro.
- Anel orbital girando devagar e brilho de palco "respirando".
- Faixas de luz deslizando levemente nos cantos.
- Seções, cartões e números aparecem ao rolar a página (com leve subida e foco).
- Números da abertura contam do zero até o valor.
- Botão principal com brilho que passa por ele de tempos em tempos.
- Tudo respeita quem pediu "menos movimento" no aparelho (os efeitos são desligados).

## 3. Página de abertura com o vídeo (5 s)
- Ao entrar no site, aparece uma tela cheia com o seu vídeo de introdução (1920 x 1080, 5 segundos).
- Ao terminar, passa automaticamente para a página inicial com uma transição suave.
- Botão "Pular" sempre visível, e botão para ligar o som (navegadores só deixam vídeo começar sozinho se estiver sem som).
- Aparece só na primeira visita de cada sessão, para não incomodar quem volta para a página inicial.

## Detalhes técnicos
- Logo: recortar e remover o branco com Python/PIL (transparência suave nas bordas), salvar em `src/assets/logos/vizionz-logo-transparent.png`; adicionar `brand="vizionz-transparent"` ao `Logo` e usar no `site.tsx` sem o fundo `bg-white`. Atualizar a regra do `system.md` ("logo VisionZ sobre fundo claro") para incluir a versão transparente.
- Vídeo: enviar via `lovable-assets` para `src/assets/videos/video_de_intro.mp4.asset.json`; nova rota `/` → abertura? Não: rota `src/routes/abertura.tsx` com `<video autoplay muted playsInline>`, `onEnded` navega para `/site`; `/site` redireciona para `/abertura` na primeira visita da sessão (`sessionStorage`, lido em `useEffect`).
- Movimento: CSS keyframes + `IntersectionObserver` num componente `Reveal` e `CountUp` (biblioteca), sem novas dependências; `motion-reduce:` desativa.
