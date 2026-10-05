# Sistema de idiomas (EN padrão, PT-BR, ES, 中文) + vídeo de abertura por idioma

## O que você vai ver
- Um seletor de idioma no cabeçalho do site, no menu do protótipo, no login e na abertura: **EN · PT · ES · 中文**.
- O site abre em **inglês** por padrão. A escolha fica salva no navegador e vale para todas as páginas.
- Todo o conteúdo traduzido: abertura, Início, Criadores, Segurança, Investidores, protótipo (Início, Assistir, Perfis, Estúdio, Synth, Jukebox, Vitrine, Carteira, Moderação, Ecossistema, Minha conta) e login.
- Preços continuam em reais (R$) em todos os idiomas, e "$VZN" não muda. Datas e números seguem o formato de cada idioma.
- O chinês usado é o simplificado.

## Vídeo de abertura
- Volta a usar o vídeo leve (o mesmo de antes), agora com som.
- Uma narração para cada idioma (EN, PT, ES, 中文), gerada com IA e sincronizada com os 5 segundos do vídeo, junto com a trilha original.
- Antes disso, vou verificar o que existe no som atual: se tiver fala em português, ela vira o texto base das traduções. Se for só música, escrevo uma frase curta de abertura em cada idioma (por exemplo: "VisionZ — entertainment will never be the same") e mostro para você aprovar.
- O vídeo toca no idioma escolhido. Se o navegador bloquear o som automático, ele liga no primeiro toque ou clique.

## O que não muda
- Textos criados pela IA no Synth/Jukebox continuam no idioma em que a pessoa escrever.
- O catálogo do design system (/design-system) continua em português.

## Detalhes técnicos
- i18n sem dependências novas: `src/experience/i18n/` com `en.ts`, `pt.ts`, `es.ts`, `zh.ts` (mesmo formato tipado de chaves; `pt.ts` é a fonte, `en.ts` é o padrão), `I18nProvider` + `useT()` no `__root.tsx`, idioma em `localStorage` lido em `useEffect` (SSR sempre renderiza EN para evitar diferenças de hidratação), `<html lang>` atualizado.
- Os textos de `src/experience/data.ts` e de cada rota passam a usar chaves; traduções geradas com IA em lote e revisadas.
- `head()` de cada rota em EN (o padrão de busca), mantendo títulos e descrições já aprovados, traduzidos.
- Vídeo: com ffmpeg, extrair a trilha do original, gerar narração TTS por idioma, mixar com o vídeo leve de 720p → 4 arquivos (`intro-en/pt/es/zh.mp4`) via lovable-assets; `abertura.tsx` escolhe pelo idioma.
- Teste vitest: idioma padrão é EN; todas as chaves existem nos 4 idiomas.
- Registrar a regra de i18n no `AGENTS.md` e o padrão EN na memória do projeto.
