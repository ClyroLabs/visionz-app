# Ajuste de responsividade do site VisionZ (telas pequenas)

Vale para as páginas Início, Criadores, Segurança e Investidores, além do cabeçalho e do rodapé. As telas grandes ficam como estão hoje.

## O que muda para quem usa o celular

1. **Cabeçalho mais enxuto**
   - O logo e o botão "Abrir protótipo" (menor, encurtado para "Protótipo") ficam na mesma linha.
   - A linha de links logo abaixo continua deslizando para o lado, com o link atual em destaque.

2. **Abertura (topo da página inicial)**
   - Título menor e bem ajustado, sem palavras cortadas.
   - A frase "Mais que tecnologia…" e o lema "Inovação • Streaming • Recompensas" ficam centralizados e sem sobreposição.
   - Os botões ficam um embaixo do outro, com a largura toda; "Ver o protótipo" vira um link de texto.
   - Os 5 ícones de pilares ficam centralizados, em linha deslizante.
   - Os 4 números passam a aparecer em uma grade de 2×2 compacta.
   - O anel orbital diminui para não cobrir o texto.

3. **Ícones e textos de todos os cards centralizados no celular.** Isso vale para:
   - "Assista. Crie. Ganhe."
   - Segurança familiar
   - Estúdio
   - Ecossistema de ganhos
   - Planos
   - Agentes Clyro
   - Os cards das outras páginas

   No computador, cada card mantém o alinhamento atual quando isso fizer sentido.

4. **Menos rolagem no celular**
   - **Cards repetidos viram carrossel deslizante:** os 3 passos de "Como funciona", os benefícios de ganhos, os 3 planos (o plano mais popular aparece primeiro) e os agentes Clyro. Pontinhos abaixo mostram em qual card você está.
   - **Listas longas ficam recolhidas:** os itens de segurança e os detalhes técnicos mostram só o título e abrem com um toque.
   - **Mais compacto:** menos espaço entre seções e textos de apoio mais curtos no celular.
   - **Catálogo de títulos:** continua em linha deslizante.
   - **Chamada final:** fica mais compacta, com um único botão.

5. **Outras páginas** (Criadores, Segurança, Investidores): recebem o mesmo tratamento.
   - Cabeçalhos de seção centralizados no celular.
   - Cards centralizados.
   - Grades longas viram carrossel.
   - Tabelas e projeções de investidores passam a deslizar para o lado em vez de quebrar a página.
   - Os formulários usam a largura toda.

6. **Rodapé:** fica centralizado e mais compacto.

## Como vou verificar
Vou tirar capturas de tela em três larguras: celular pequeno (360 px), celular comum (393 px) e tablet (768 px). Vou conferir se a página não desliza para o lado em nenhuma delas e comparar quanto a rolagem diminuiu no celular.

## Detalhes técnicos
- Um novo componente na biblioteca, `ScrollSnapRow` (em `src/vizionz/components/`), entra no barril e na vitrine:
  - no celular é um carrossel com `overflow-x-auto snap-x snap-mandatory` e indicadores;
  - a partir do `md` volta a ser uma grade normal, definida por `className`;
  - respeita reduced-motion e funciona com o teclado.
- Os cards no celular usam `text-center items-center` e passam a `md:text-left md:items-start` no computador. `SectionHeading` recebe um alinhamento responsivo: centralizado no celular, como definido no computador.
- Os blocos recolhíveis usam `<details>/<summary>` nativo, sem dependência nova.
- As seções usam espaçamento `py-14 md:py-24`. O título principal usa `text-4xl sm:text-6xl md:text-7xl` com `text-balance`. A grade de números passa a `grid-cols-2`.
- Arquivos alterados:
  - `src/routes/site.tsx`
  - `site.index.tsx`
  - `site.criadores.tsx`
  - `site.seguranca.tsx`
  - `site.investidores.tsx`
  - `src/experience/site-parts.tsx`
  - componentes `marketing.tsx` e `display.tsx` (alinhamento responsivo)
