---
description: "O que acontece com um muro atingido pelas vendas: parcialmente consumido, ele permanece no lugar; totalmente atravessado, ele é esvaziado e seus CUBIT vão para a reserva de recompensas do vault, sem queima."
section: "01 / ENTENDER"
reading: "4 MIN DE LEITURA"
search:
  keywords: ["absorção", "atravessado", "consumido", "reserva", "vault", "recompensas", "burn", "queima", "destruição", "governança", "deliverAbsorbed"]
---

# Muros atravessados e reserva do vault

Quando uma venda atinge um muro, os ETH desse muro recompram CUBIT. Na nova versão, esses CUBIT **não são mais queimados**: os de um muro totalmente atravessado vão para a **reserva de recompensas do vault**.

## Parcialmente consumido ou totalmente atravessado

| Estado do muro | O que acontece |
| --- | --- |
| Não atingido | O muro contém apenas ETH, em seu tick |
| Parcialmente consumido | Parte de seus ETH recomprou CUBIT; o muro permanece no lugar |
| Preço volta a subir depois de um muro parcialmente consumido | O muro revende seus CUBIT e se recarrega em ETH |
| Totalmente atravessado | O muro passa a conter apenas CUBIT; a venda que o atravessou o esvazia, seus CUBIT aguardam o envio e seus ETH restantes voltam para `pendingFloorEth` |

Um muro só é esvaziado depois de **totalmente atravessado**. Enquanto está apenas parcialmente consumido, o hook não mexe nele: ele continua funcionando como uma posição LP comum em seu tick. Uma mesma venda esvazia todos os muros que atravessou totalmente, do mais próximo ao mais distante.

## O caminho dos CUBIT

```text
Uma venda atravessa totalmente um muro
    → a venda esvazia o muro
    → seus CUBIT aguardam em pendingAbsorbedTokens
    → deliverAbsorbed() os envia à reserva de recompensas do vault
```

O roteador CUBIT chama `deliverAbsorbed()` ao final de cada venda, na mesma transação. Se esse envio falhar, a venda não é bloqueada: os CUBIT permanecem isolados no hook. Após uma venda feita por outro roteador, ou após um envio malsucedido, qualquer conta pode chamar `deliverAbsorbed()`, sem escolher destinatário nem valor. A reserva paga, em seguida, a recompensa diária dos depositantes do vault. [mCUBIT Vault](../v2/vault.md).

## A oferta não diminui mais

A oferta permanece fixada em **21 milhões de CUBIT**, sem emissão. Como os CUBIT dos muros não são mais destruídos, ela não diminui mais com as absorções: CUBIT não é mais apresentado como deflacionário. Apenas a poeira de arredondamento do depósito inicial, desprezível, é queimada no lançamento.

Os CUBIT pagos como recompensas a partir da reserva são tokens comuns: seus beneficiários podem mantê-los, depositá-los ou vendê-los.

## Os filhos Forge

Para um mercado filho criado pela Forge, os tokens dos muros esvaziados não vão para um vault de staking: `deliverAbsorbed()` os envia ao **vault de governança do launchpad**, cujo endereço é fixado na Forge que implantou o token filho. Cada depósito fica bloqueado ali por 30 dias a partir de seu próprio recebimento, e somente o deployer desse vault pode resgatá-los. [Momentum e Forge](../v2/momentum-forge.md).

## O que a absorção não garante

Um muro que absorve uma venda gasta seus ETH. Um muro parcialmente consumido só se recarrega em ETH se o preço voltar a subir acima dele; um muro esvaziado só recupera profundidade se um novo financiamento cair em seu tick.

As evidências da antiga queima estrita não validam esse novo caminho. Ele funciona na Ethereum desde 22 de setembro de 2026. [Veja os limites conhecidos](../securite/risques.md).

## Verificar os movimentos

Para acompanhar uma absorção, concilie os eventos do hook: `WallAbsorbed(id, cubit, ethRemaining)` para cada muro esvaziado, `TokensAbsorbed(amount, pendingAbsorbedTokens)` para o total colocado em espera e, depois, `AbsorbedDelivered(sink, amount)` no envio. Do lado do destino, o vault emite `RewardReserveFunded`; para um filho Forge, o vault de governança emite `Deposited`.

<p class="source-note">Fontes: decisões de design de 14 de setembro de 2026, <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> e <code>periphery/CubitGovernanceVault.sol</code>.</p>
