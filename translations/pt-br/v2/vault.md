---
description: "Depósito CUBIT intransferível, bloqueio de 24 h e recompensa de 3% ao dia em CUBIT, paga exclusivamente por uma reserva e limitada a um dia."
section: "03 / MÓDULOS V2"
reading: "5 MIN DE LEITURA"
search:
  keywords: ["vault", "staking", "stake", "bloqueio", "lock", "retirada", "recompensa", "reserva", "claim", "resgate", "mCUBIT"]
---

# mCUBIT Vault

O Vault permite depositar CUBIT em uma posição **intransferível** e receber uma recompensa **em CUBIT**. Seu modelo não cria CUBIT e não dá nenhum direito sobre os fundos dos muros.

O nome mCUBIT designa essa experiência de depósito; o código não cria um token de recibo ERC-20 livremente transferível.

> **Aberto na Ethereum desde 26 de setembro de 2026.**

## De onde vem a recompensa

A recompensa é paga **exclusivamente a partir da reserva de recompensas** do Vault, nunca a partir do principal depositado. Essa reserva é alimentada por:

- os **20% da oferta**, ou seja, 4,2 milhões de CUBIT, transferidos no lançamento;
- os **CUBIT dos muros totalmente atravessados**, enviados por `deliverAbsorbed()` após as vendas;
- qualquer aporte voluntário: qualquer conta pode acrescentar CUBIT à reserva com `fundRewardReserve(amount)`.

A reserva é finita: quando ela se esgota, as recompensas param. **A recompensa é exclusivamente em CUBIT**, resgatada com `claimCubit()`, e nenhum rendimento é garantido.

## O percentual e seu teto

A recompensa é de **3% do depósito por dia**, calculada proporcionalmente ao tempo decorrido desde o último resgate.

O valor resgatável é **limitado a um dia**: após 24 horas sem resgate, ele não aumenta mais. Para receber a recompensa completa, é preciso resgatar todos os dias; **o excedente não resgatado é perdido**.

| Tempo desde o último resgate | Valor resgatável para 1 000 CUBIT depositados |
| --- | --- |
| 12 horas | 15 CUBIT |
| 24 horas | 30 CUBIT |
| 48 horas | 30 CUBIT: o segundo dia é perdido |

Esses valores supõem uma reserva suficiente. Se a reserva contiver menos que o valor devido, apenas seu saldo é pago.

## Depositar CUBIT

1. Verifique o endereço do Vault oferecido e sua conexão ao protocolo.
2. Autorize o Vault a transferir o valor escolhido.
3. Chame `stake(amount)` e aguarde a confirmação.
4. Leia `balanceOf(account)`, `unlockAt(account)` e `pendingCubit(account)` no contrato de depósito.

**Cada depósito adicional reinicia o bloqueio de 24 h de toda a posição dessa carteira nesse Vault.** Ele também paga a recompensa acumulada até então e reinicia o dia de contagem.

Os CUBIT depositados continuam sendo tokens existentes. Um depósito não é uma queima nem uma redução da oferta.

## Resgatar e retirar

`claimCubit()` paga a recompensa acumulada e reinicia o dia de contagem. O bloqueio de retirada não impede esse resgate.

`withdraw(amount)` devolve os CUBIT depositados quando o timestamp da cadeia alcança `unlockAt`. A retirada pode ser parcial; ela paga primeiro a recompensa acumulada.

Ninguém pode suspender essas saídas. Elas continuam sujeitas às regras e ao funcionamento correto do contrato que mantém a posição.

## Se o Vault for substituído

A equipe pode substituir o Vault a qualquer momento, sem prazo de espera. A substituição afeta o contrato oferecido para novos depósitos e aquele que recebe os CUBIT absorvidos enviados depois. **Os CUBIT depositados, a reserva de recompensas e as datas de desbloqueio já registrados permanecem no Vault antigo.** A substituição não move os fundos do usuário.

O registro mantém a lista dos Vaults sucessivos. Verifique o endereço selecionado antes de ler um saldo, resgatar ou retirar. Uma aprovação do Vault anterior não autoriza o novo.

O registro exige um novo Vault conectado ao mesmo hook e ao mesmo token, sem stake. A substituição desativa o Vault: o novo contrato só aceita depósitos após sua reativação.

## Os limites do módulo

A recompensa depende do saldo da reserva: um percentual de 3% ao dia pode esgotá-la, e os pagamentos então param. As verificações de substituição conferem a compatibilidade declarada dos endereços; elas não provam a segurança de todo código substituto. A contabilidade da reserva, o teto de um dia, a chegada dos CUBIT dos muros e as saídas dos Vaults antigos devem ser validados em cada lançamento.

<p class="source-note">Fontes: <code>periphery/CubitVault.sol</code> (<code>pendingCubit</code>, <code>claimCubit</code>, <code>fundRewardReserve</code>, <code>DAILY_REWARD_BPS</code>, <code>REWARD_PERIOD</code>, <code>LOCK_DURATION</code>), <code>CubitHook.deliverAbsorbed</code>, <code>CubitV2.setVault</code> e as decisões de design de 14 de setembro de 2026.</p>
