---
description: "Qué ocurre con un muro alcanzado por las ventas: parcialmente consumido, permanece en su sitio; totalmente atravesado, se vacía y sus CUBIT pasan a la reserva de recompensas del vault, sin quema."
section: "01 / ENTENDER"
reading: "4 MIN DE LECTURA"
search:
  keywords: ["absorción", "atravesado", "atravesar", "consumido", "reserva", "vault", "recompensas", "burn", "quema", "destrucción", "gobernanza", "deliverAbsorbed"]
---

# Muros atravesados y reserva del vault

Cuando una venta alcanza un muro, los ETH de ese muro recompran CUBIT. En la nueva versión, esos CUBIT **ya no se queman**: los de un muro totalmente atravesado pasan a la **reserva de recompensas del vault**.

## Parcialmente consumido o totalmente atravesado

| Estado del muro | Qué ocurre |
| --- | --- |
| No alcanzado | El muro solo contiene ETH, en su tick |
| Parcialmente consumido | Una parte de sus ETH ha recomprado CUBIT; el muro permanece en su sitio |
| Precio recuperado tras un muro parcialmente consumido | El muro revende sus CUBIT y se recarga de ETH |
| Totalmente atravesado | El muro solo contiene CUBIT; la venta que lo ha atravesado lo vacía, sus CUBIT esperan su envío y sus ETH restantes vuelven a `pendingFloorEth` |

Un muro solo se vacía cuando está **totalmente atravesado**. Mientras solo esté parcialmente consumido, el hook no lo toca: sigue funcionando como una posición LP ordinaria en su tick. Una misma venta vacía todos los muros que ha atravesado por completo, del más cercano al más lejano.

## El recorrido de los CUBIT

```text
Una venta atraviesa por completo un muro
    → la venta vacía el muro
    → sus CUBIT esperan en pendingAbsorbedTokens
    → deliverAbsorbed() los envía a la reserva de recompensas del vault
```

El router CUBIT llama a `deliverAbsorbed()` al final de cada venta, en la misma transacción. Si este envío falla, la venta no se bloquea: los CUBIT quedan aislados en el hook. Tras una venta realizada a través de otro router, o tras un envío fallido, cualquier cuenta puede llamar a `deliverAbsorbed()`, sin elegir destinatario ni importe. Después, la reserva paga la recompensa diaria de los depositantes del vault. [mCUBIT Vault](../v2/vault.md).

## La oferta ya no disminuye

La oferta sigue fijada en **21 millones de CUBIT**, sin emisión. Como los CUBIT de los muros ya no se destruyen, la oferta ya no disminuye a medida que se producen absorciones: CUBIT ya no se presenta como deflacionario. En el lanzamiento solo se quema el residuo de redondeo del depósito inicial, insignificante.

Los CUBIT pagados como recompensas desde la reserva son tokens ordinarios: sus beneficiarios pueden conservarlos, depositarlos o venderlos.

## Los hijos Forge

En un mercado hijo creado por la Forge, los tokens de los muros vaciados no van a un vault de staking: `deliverAbsorbed()` los envía al **vault de gobernanza del launchpad**, cuya dirección está fijada en la Forge que desplegó el token hijo. Cada depósito queda bloqueado allí 30 días a partir de su propia recepción, y solo el desplegador de ese vault puede reclamarlos. [Momentum y Forge](../v2/momentum-forge.md).

## Qué no garantiza la absorción

Un muro que absorbe una venta gasta sus ETH. Un muro parcialmente consumido solo se recarga de ETH si el precio vuelve a subir por encima de él; un muro vaciado solo recupera profundidad si una nueva financiación cae en su tick.

Las pruebas de la antigua quema estricta no validan este nuevo recorrido. Funciona en Ethereum desde el 22 de septiembre de 2026. [Consulta los límites conocidos](../securite/risques.md).

## Verificar los movimientos

Para seguir una absorción, concilia los eventos del hook: `WallAbsorbed(id, cubit, ethRemaining)` para cada muro vaciado, `TokensAbsorbed(amount, pendingAbsorbedTokens)` para el total que queda pendiente y, después, `AbsorbedDelivered(sink, amount)` en el envío. En el destino, el vault emite `RewardReserveFunded`; para un hijo Forge, el vault de gobernanza emite `Deposited`.

<p class="source-note">Fuentes: decisiones de diseño del 14 de septiembre de 2026, <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> y <code>periphery/CubitGovernanceVault.sol</code>.</p>
