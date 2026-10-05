# Página "O que vem por aí": apresentação do ecossistema VisionZ

Nova página rolável no site com as novidades descritas nos arquivos, em linguagem simples, curta e sem termos técnicos.

## Acesso
- Novo item **"O que vem por aí"** no menu do cabeçalho do site, depois de "Investidores".
- No celular, o mesmo item aparece dentro do menu ☰.
- O item fica em destaque magenta quando a página está aberta.

## Seções (cada termo difícil vira uma frase do dia a dia)
1. **Abertura:** "A VisionZ está crescendo. Veja o que vem por aí", com um resumo de três linhas e um botão "Começar".
2. **O que já existe:** três cards que você pode tocar: Clyro Synth (criar vídeos com IA), Clyro Jukebox (criar músicas e provar que são suas) e Filtro Inteligente (protege as crianças e explica cada decisão). Cada card abre uma explicação curta.
3. **As 4 novidades**, cada uma com ícone, uma frase e um exemplo:
   - **Recompensas que crescem:** suas recompensas $VZN podem ficar guardadas e render dentro do ecossistema (antes chamado "DeFi/vaults"). Inclui um simulador simples com valor e meses, marcado como "exemplo, não é promessa".
   - **Ferramentas para parceiros:** marcas e estúdios podem usar a tecnologia VisionZ nos próprios produtos (antes "Launchpad PaaS/SDKs").
   - **Conexão entre redes:** levar seus $VZN de uma rede para outra de forma segura, sem deixá-los parados num cofre de terceiros (antes "deBridge 0-TVL"). Inclui uma comparação lado a lado, "jeito comum" × "jeito VisionZ".
   - **IA que ajuda, pessoas que decidem:** abas Criar, Proteger e Prever, cada uma com um passo a passo de 4 etapas.
4. **O token $VZN em palavras simples:** para que serve (usar, ganhar, participar) e um alerta claro de que o valor pode variar.
5. **Números:** a mesma projeção conservadora do site (60 mil → 350 mil → 1,2 milhão de usuários; receita de R$ 2,4 → R$ 16 → R$ 58 milhões), com o aviso "estimativas".
6. **Cuidados que tomamos:** quatro cards (direitos autorais, segurança do sistema, sobe e desce do token, privacidade dos dados), cada um com o nível de atenção e o que fazemos a respeito.
7. **Linha do tempo:** quatro fases que você pode tocar para ver as entregas: Base, Recompensas, Parceiros e redes, Crescimento.
8. **Chamada final:** botões "Entrar na lista de espera" e "Falar com a VisionZ".

## Regras
- O nome usado é sempre VisionZ.
- Nunca prometer ganhos: o texto fala em "recompensas" e "estimativas".
- A página segue o visual escuro futurista do site, com animações suaves ao rolar.
- Tudo centralizado e sem cortes no celular.
- Os textos são traduzidos para os 4 idiomas, como no resto do site.

## Detalhes técnicos
- Rota `src/routes/site.ecossistema.tsx` (`/site/ecossistema`) com `head()` próprio. O conteúdo fica em `src/experience/roadmap-data.ts`.
- Sem dependências novas: usa `Card`, `Tabs`, `SectionHeading`, `Timeline`, `Reveal`, `ScrollSnapRow` e `Stat`. O gráfico usa recharts, que já está instalado.
- Link adicionado aos `links` de `src/routes/site.tsx`, que já alimentam o menu desktop e o menu ☰.
- Os textos novos são traduzidos com IA e incluídos em `src/experience/i18n/dict.ts`.
- O cálculo do simulador fica em `logic.ts`, com um teste vitest (juros compostos, sem valores negativos).
