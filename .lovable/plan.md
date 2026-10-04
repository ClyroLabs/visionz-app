# Visual moderno no protótipo + painel do usuário com dados salvos

## 1. Novo visual em todo o protótipo
- **Cantos mais arredondados**: cards, campos e menus com bordas bem suaves; botões em formato de pílula.
- **Botões modernos**:
  - Principal em degradê com brilho.
  - "Aprovar" e "Bloquear" mais leves, com fundo translúcido, ícone e destaque ao passar o mouse.
  - Botões de ícone redondos.
- **Cards de números**: ícone em um círculo colorido, número grande e uma linha de apoio menor, com fundo de vidro e borda sutil.
- **Itens da moderação**:
  - Ícone de alerta dentro de um círculo da cor da gravidade.
  - Etiqueta de gravidade (alta, média ou baixa).
  - Barra mostrando a confiança da IA.
  - A borda grossa à esquerda é substituída por um brilho suave.
- **Menu lateral**:
  - Itens em pílula, com o item atual em destaque magenta.
  - Rodapé com saldo e Modo infantil num card arredondado.
  - Um novo item "Minha conta".
- O mesmo estilo vale para Início, Assistir, Perfis, Estúdio, Carteira, Moderação e Ecossistema.

## 2. Login
- Página de entrada com e-mail e senha e com Google.
- O protótipo pode ser visto sem login. O painel "Minha conta" pede login.
- No menu, depois de entrar, aparecem a foto ou as iniciais do usuário e o botão "Sair".

## 3. Painel do usuário ("Minha conta")
O painel é organizado em abas:
- **Perfil**: nome, apelido, foto (envio de imagem), telefone, data de nascimento, CPF, cidade e estado. Tudo editável, com botão "Salvar" e aviso de confirmação.
- **Saldos**:
  - Saldo em reais e em $VZN, com a rede escolhida.
  - Histórico de movimentações salvo na conta.
  - Atalhos para depositar e resgatar (simulados, sem dinheiro real).
- **Pagamentos** (como você paga): cartões e chaves Pix cadastrados, com um marcado como principal.
  - Por segurança, só guardamos o apelido, a bandeira e os 4 últimos números do cartão. Nunca o número completo.
- **Recebimentos** (como você recebe ganhos de criador e resgates):
  - Conta bancária ou chave Pix.
  - Carteira blockchain (endereço e rede).
  - Valor mínimo para saque.
- **Preferências**: Modo infantil padrão, notificações e idioma.

Nenhum dinheiro de verdade é cobrado ou enviado. Cobranças reais podem ser ativadas depois com a integração de pagamentos.

## Detalhes técnicos
- Ativar o Lovable Cloud.
- Tabelas, todas com acesso restrito a quem é dono (`auth.uid()`) e com GRANTs:
  - `profiles`
  - `payment_methods`
  - `payout_accounts`
  - `wallet_transactions`
  - `user_preferences`
- Um gatilho cria o perfil e as preferências no cadastro.
- Bucket de fotos de perfil com acesso só do dono.
- Login por e-mail e senha mais Google.
- Rota pública `/auth`. Painel em `src/routes/_authenticated/conta.tsx`, com o layout do protótipo.
- Leituras e gravações via `createServerFn` com `requireSupabaseAuth`, validação com zod (CPF, telefone, endereço de carteira) e TanStack Query.
- Estilo: aumentar os raios em `theme.css`, dar formato de pílula aos botões e adicionar uma variante `soft` em `button.tsx`. Redesenhar `ModerationItem` e `Stat`, e atualizar o layout do `app.tsx`.
- Testes: só o dono lê os próprios dados, e o cartão guarda apenas os 4 últimos dígitos.
