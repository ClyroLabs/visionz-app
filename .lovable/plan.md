# Vídeo de apresentação do protótipo VisionZ (motion graphics)

Um vídeo animado de ~30 segundos, 1920×1080, com a identidade VisionZ, mostrando como o protótipo funciona. Entregue como arquivo MP4 em Arquivos (não muda o site).

## Roteiro (6 cenas)
1. **Gancho (0–3s)** — símbolo VZ surge com luz, frase "O entretenimento nunca mais será o mesmo."
2. **Assista (3–8s)** — telas reais do catálogo do protótipo deslizando em perspectiva; selo "4K/8K" e classificação indicativa.
3. **Modo infantil + Filtro IA (8–13s)** — o switch liga, títulos impróprios somem, escudo do Filtro Inteligente verifica.
4. **Crie (13–19s)** — Clyro Synth monta um roteiro com cenas; Clyro Jukebox mostra acordes e ondas sonoras.
5. **Ganhe (19–25s)** — carteira com saldo em $VZN subindo, redes blockchain aparecendo, aviso "recompensas no ecossistema".
6. **Fecho (25–30s)** — logo VisionZ + "Assista. Crie. Ganhe." + endereço vizionz.clyrolabs.tech.

## Estilo
- Fundo near-black violeta, degradê da marca (índigo → violeta → magenta → laranja → dourado), ciano só nos momentos de tecnologia/segurança.
- Títulos em Orbitron, textos em Inter.
- Ritmo energético com cortes rápidos, entradas com mola, raios de luz diagonais como transição recorrente.
- Textos em inglês (idioma padrão do site). Se quiser, faço versão em português depois.
- Trilha sonora: sem música no início (posso adicionar depois se você enviar uma faixa ou pedir uma gerada).

## Detalhes técnicos
- Remotion renderizado no sandbox (`/tmp/remotion`), MP4 h264 em `/mnt/documents/visionz-prototipo.mp4`.
- Screenshots reais do protótipo (`/app`, `/app/synth`, `/app/jukebox`, `/app/carteira`) capturados via Playwright em localhost e usados como mídia nas cenas, mais logos oficiais de `src/assets/logos/`.
- Verificação: stills em quadros-chave antes do render final.
