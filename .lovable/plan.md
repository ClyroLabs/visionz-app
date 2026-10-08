# Saldo na moeda do idioma + depósito com cara de gateway real

## 1. "Saldo em reais" na moeda certa
- O título passa a mudar com o idioma: PT "Saldo em reais", EN "Balance in US dollars", ES "Saldo en euros" (seguindo a conversão já usada: EN US$, ES €, ZH ¥ → "人民币余额").
- Vale na Carteira e em Minha conta → Saldos. Os valores já são convertidos; agora o texto bate com eles.

## 2. Novo fluxo de depósito (simulado, mas profissional)
Substitui os botões "+ R$ 20/50/100" por um botão **Depositar** que abre um checkout em etapas (tela cheia no celular):

```text
Valor -> Forma de pagamento -> Pagamento -> Comprovante
```

- **Valor**: campo livre com atalhos (R$ 20 / 50 / 100 / 200), mínimo e máximo mostrados, taxa e total calculados ("Pix sem taxa", "Cartão 2,99%").
- **Forma de pagamento**: lista os meios salvos em Minha conta → Pagamentos (cartão com bandeira e final, chave Pix), com o principal pré-selecionado e opção "Adicionar novo" que leva para a aba Pagamentos.
- **Pagamento**:
  - Pix: QR code gerado, código "copia e cola" copiável, contador de expiração (10 min) e status "Aguardando pagamento..." que confirma sozinho após alguns segundos.
  - Cartão: etapa "Processando com o banco emissor" + confirmação de segurança (código de 6 dígitos de exemplo), com chance de recusa simulada quando o valor passa do limite.
- **Comprovante**: ID da transação, data/hora, meio usado, valor, taxa e total; botão de copiar ID.
- Selo "Ambiente de testes · nenhum valor real é cobrado" no rodapé do checkout, no estilo de gateways (sandbox).

## 3. Reflexo em Configurações (Minha conta)
- Depósito grava a movimentação com o meio usado ("Depósito · Pix", "Depósito · Visa •••• 4242") e status (Aprovado / Recusado).
- Aba **Pagamentos** ganha: "Último uso" em cada meio e uma seção **Histórico de depósitos** com status e ID.
- Aba **Saldos** usa o mesmo botão Depositar e mostra os depósitos na lista de movimentações.
- Sem meio salvo: o checkout pede para cadastrar um antes (Pix ou cartão), sem sair do fluxo.

## Detalhes técnicos
- Componente compartilhado `DepositCheckout` em `src/experience/`, usado em `app.carteira.tsx` e `app.conta.tsx`; lógica pura (`depositFee`, `depositTotal`, limites, gerador de ID e de payload Pix fictício) com testes.
- Grava em `wallet_transactions` (já existente) com rótulo do meio; status e último uso derivados do rótulo/registro, sem mudança de banco se possível; se faltar campo de status, migration pequena adicionando `status` e `method_id`.
- Visitante sem conta: fluxo funciona só no navegador (store local) como hoje.
- Rótulo do saldo via chave de dicionário por idioma; todo texto novo em EN/ES/ZH.
