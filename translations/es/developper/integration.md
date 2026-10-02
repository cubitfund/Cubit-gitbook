---
description: "Identidades del pool, módulos sustituibles, banda de liquidez, muros y envío de los CUBIT absorbidos, vaults, funciones suprimidas, unidades y eventos de integración."
section: "04 / CONSTRUIR"
reading: "10 MIN DE LECTURA"
search:
  keywords: ["API", "ABI", "integración", "integration", "contrato", "dirección", "banda", "band", "BAND_SALT", "MIN_POOL_SUPPLY", "bandEth", "bandTokens", "muros", "walls", "WallLib", "wallCount", "deliverAbsorbed", "pendingAbsorbedTokens"]
---

# Contratos e integración

Una integración debe identificar **la cadena, el núcleo del pool, la ABI y la revisión de los módulos**. Una dirección de router copiada de un informe antiguo puede sustituirse; una ABI nueva puede ser incompatible con el pool histórico.

> La ABI siguiente es la del código de la nueva versión. Exporta la ABI de la versión validada y verifica los runtimes antes de conectar un cliente.

## Identidad del pool

La `PoolKey` contiene `currency0`, `currency1`, `fee`, `tickSpacing` y `hooks`. Para CUBIT, ETH nativo es `currency0` y el token CUBIT es `currency1`.

| Campo | Lectura esperada |
| --- | --- |
| `currency0` | Dirección cero, que representa ETH nativo |
| `currency1` | Token del despliegue identificado |
| `fee` | `100` en la versión en servicio, es decir, un 0,01% |
| `tickSpacing` | `10` en las fuentes leídas |
| `hooks` | Hook del despliegue identificado |

El poolId depende de toda esta clave. Cambiar únicamente `fee` en un frontend no transforma un pool antiguo en un despliegue nuevo.

## Resolver los módulos en un mismo bloque

Lee primero el registro anclado en `hook.v2()`. Después resuelve las direcciones de los módulos disponibles y `moduleRevision` en el mismo bloque. Comprueba su conexión al núcleo.

Este fragmento es de **solo lectura**, para utilizarlo con un cliente viem ya configurado y una dirección de registro verificada:

```ts
import { parseAbi, type Address, type PublicClient } from "viem";

const registryAbi = parseAbi([
  "function router() view returns (address)",
  "function moduleRevision() view returns (uint256)",
]);

export async function readRelease(
  client: PublicClient,
  registry: Address,
) {
  const blockNumber = await client.getBlockNumber();
  const [router, revision] = await Promise.all([
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "router", blockNumber }),
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "moduleRevision", blockNumber }),
  ]);
  return { blockNumber, router, revision };
}
```

Este fragmento no verifica por sí solo todas las conexiones ni autoriza ninguna firma. El frontend del repositorio las comprueba en `resolveRelease`, `readRelease` y `assertCurrentDeployment`.

Antes de cada firma, compara los módulos y la revisión con el contexto que el usuario ya ha revisado. No redirijas silenciosamente una autorización.

## Leer la banda

| Elemento | Resultado / uso |
| --- | --- |
| `band()` | `(int24 lower, int24 upper, uint128 liquidity)` de la posición única de trading |
| `MIN_POOL_SUPPLY()` | Depósito mínimo aceptado en la inicialización: el 80% de la oferta |
| `BAND_SALT()` | Salt de la posición de banda, `keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | Evento emitido una sola vez, en la inicialización del pool |
| Lens `bandEth()` / `bandTokens()` | ETH y CUBIT que mantiene la banda al precio actual, sin contar las comisiones LP |

`lower` vale `minUsableTick` para un espaciado de 10, es decir, −887 270. `upper` es el tick de apertura del pool redondeado hacia abajo al espaciado: con una FDV de lanzamiento de 3,75 ETH, vale 155 390. Un redondeo hacia arriba haría activa la posición y exigiría ETH.

El hook coloca en la banda **todo su depósito**. `afterInitialize` rechaza un depósito inferior a `MIN_POOL_SUPPLY` con `SupplyNotDeposited`: el lanzamiento del padre deposita exactamente ese mínimo y un hijo Forge deposita toda su oferta. El residuo de redondeo se quema, de modo que el hook no conserva ni tokens brutos ni claims de CUBIT después de la inicialización.

El snapshot del Lens sustituye los antiguos campos del ladder y de los keepers por `bandEth` y `bandTokens`. Estos valores se refieren al principal de la posición: las comisiones LP acumuladas en la banda no se recogen ni se cuentan.

## Leer múltiples muros

| Vista del hook | Resultado / uso |
| --- | --- |
| `wallCount()` | Número de identificadores históricos, distinto del número de posiciones activas |
| `activeWallCount()` | Número de muros activos en el estado leído |
| `activeWallId(index)` | ID permanente en un índice de la lista activa actual |
| `latestWallId()` | ID del último muro financiado; comprueba primero que existe un muro |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | Total de remanentes ETH asignados a los muros |

Las ventas crean, engrosan y vacían los muros. Un muro vaciado sale de la lista activa, pero conserva su identificador y su tick.

Los índices de la lista activa pueden cambiar tras una absorción. **Conserva el ID del muro como identidad**, no su índice de recorrido. Lee el recuento y los elementos en el mismo bloque.

`fundedEth` representa el acumulado de los fondos realmente colocados en ese tick; no debe mostrarse como la profundidad restante. `idleEth` representa un remanente vinculado al muro, distinto de su liquidez desplegada. El límite superior de un muro es `lower + tickSpacing`. Los fondos de los muros que no pudieron colocarse permanecen separados en `pendingFloorEth`.

Los campos históricos `floorPrice` y `netFloorPrice` del Lens describen el último muro financiado; no resumen todos los niveles. Para el muro activo más cercano al mercado, lee `bestWallPrice` y `netBestWallPrice`.

## Muros atravesados y envío de los CUBIT

En cada venta, tanto en entrada exacta como en salida exacta, `afterSwap` llama a `_collectCrossedWalls()` y después a `_placeWall()`. Todos los muros que el precio ha atravesado por completo se vacían, del más cercano al más lejano: sus CUBIT se suman a `pendingAbsorbedTokens` y sus ETH restantes, comisiones realizadas y residuos, vuelven a `pendingFloorEth`. Después, `_placeWall()` coloca todos los ETH pendientes en el objetivo calculado sobre el precio después de la venta. Si ese objetivo no está estrictamente por encima del tick del pool, lo que ocurre en el precio de lanzamiento o por debajo, coloca el muro un 1% por debajo del precio actual con `BandLib.underMarketWallTarget`. Solo un importe demasiado pequeño para crear una posición y el caso extremo de un precio en lo más alto del rango de ticks, donde ningún muro cabe por debajo del precio, permanecen en `pendingFloorEth`.

| Elemento | Resultado / uso |
| --- | --- |
| `pendingAbsorbedTokens()` | CUBIT de los muros atravesados, aislados en el hook como claims del PoolManager hasta su envío |
| `deliverAbsorbed()` | Envío público y sin permisos de estos CUBIT a `absorbedTokenSink()`; quien llama no elige destinatario ni importe |
| `absorbedTokenSink()` | Vault del registro para CUBIT; para un hijo Forge, `governanceVault()` de la Forge que desplegó su token |
| `WallFunded(id, lower, addedEth, liquidity)` | Muro creado o engrosado en el tick objetivo |
| `WallAbsorbed(id, cubit, ethRemaining)` | Muro totalmente atravesado y vaciado |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | CUBIT que una venta deja pendientes de envío |
| `AbsorbedDelivered(sink, amount)` | CUBIT enviados a su destino |

Para CUBIT, `deliverAbsorbed()` llama a `fundRewardReserve` del vault. Para un hijo Forge, sin registro, transfiere los tokens al vault de gobernanza y después llama a `lockUntracked`. El router CUBIT lo llama después de cada venta dentro de un try/catch: un envío que falla nunca bloquea la venta, y cualquiera puede reintentar el envío. El Lens ya no totaliza los muros en `snapshot()`: `wallAmountsPage(start, count)` devuelve el ETH y los CUBIT de un tramo de muros, y los CUBIT pendientes de envío se suman una sola vez al total de las páginas, mediante el campo `pendingAbsorbedTokens`.

Cada muro atravesado cuesta unos 185 000 gas. Con el límite de 16 777 216 gas por transacción fijado por EIP-7825, una venta atraviesa como máximo unos 88 muros; más allá, falla sin pérdidas y debe dividirse.

## Las funciones suprimidas

La nueva versión retira la API del ladder, del mantenimiento, del flujo WETH y de la financiación de los muros por la Forge, y renombra la de los tokens absorbidos. Un cliente que todavía llame a estos elementos apunta a la versión antigua.

| Contrato | Elementos suprimidos |
| --- | --- |
| Hook, funciones | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| Hook, funciones renombradas | `burnAbsorbed()` pasa a ser `deliverAbsorbed()`; `pendingBurnTokens()` pasa a ser `pendingAbsorbedTokens()` |
| Hook, constantes | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| Hook, eventos y errores | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens, funciones | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens, campos del snapshot | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| Registro | `weth()` |

Internamente, `_fundWall` y `_planRaise` han desaparecido en favor de `_collectCrossedWalls` y `_placeWall`. La recompensa del Vault es únicamente en CUBIT, reclamada con `claimCubit()`, y los scripts de despliegue ya no utilizan ninguna variable `WETH`.

## El Vault y el vault de gobernanza

| Contrato | Funciones útiles |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`, `depositEth()`, `lockUntracked(token)`, `claimable(token)`, `locked(token)`, `lockExtension()`, y después `claim(token, maxTranches)` y `extendLock(extra)`, reservadas al desplegador, sin posibilidad de transferir este derecho |
| `CubitForge` | `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)`, abierto a todos con la comisión exacta, `launchFee()` inmutable en 0,005 ETH, salts ligados a quien lanza; `governanceVault()`, dirección fijada en la construcción, recibe la comisión de lanzamiento con `depositEth()` |

En el Vault, `DAILY_REWARD_BPS` vale 300 y `REWARD_PERIOD`, un día: `pendingCubit` crece a prorrata durante 24 horas y después alcanza su tope, sin superar `rewardReserve`. En el vault de gobernanza, `LOCK_DURATION` vale 30 días para cada depósito, y el ETH se contabiliza bajo la clave `ETH()`, la dirección cero. `extendLock(extra)` añade `extra` segundos al bloqueo de todos los depósitos, presentes y futuros, y `lockExtension()` solo crece.

El Lens expone también `rewardReserve()`, la suma de las reservas de recompensas de todos los vaults registrados, actuales y retirados. Desde la sustitución del Lens del 19 de septiembre de 2026, los totales de los muros y la oferta ya no se calculan en la cadena: los getters `wallEth()`, `wallTokens()`, `circulatingSupply()` y `heldSupply()` y los campos del mismo nombre han desaparecido del snapshot, que entrega en su lugar `totalSupply`, `activeWallCount` y `pendingAbsorbedTokens`. Quien llama deriva las cifras por sí mismo, con todas las páginas leídas en el mismo bloque: `wallTokens` es la suma de los CUBIT de las páginas más `pendingAbsorbedTokens`, y luego `circulatingSupply = totalSupply − wallTokens − rewardReserve` y `heldSupply = circulatingSupply − bandTokens`, deteniéndose cada resta en cero. Los CUBIT en stake siguen formando parte de la oferta en circulación. `bestWallPrice()` y `netBestWallPrice()` dan el precio bruto y el precio neto del muro activo más cercano al mercado, leído con `nearestWallTick()` del hook, o cero si no queda ningún muro. El snapshot termina con `blockNumber`, `bestWallPrice` y `netBestWallPrice`.

## Unidades y orientación

Las cantidades de CUBIT y ETH utilizan 18 decimales. Los precios derivados del Lens se expresan en **ETH por CUBIT a escala 1e18**. El tick v4 sigue la orientación CUBIT por ETH; disminuye cuando aumenta el precio en ETH por CUBIT.

Utiliza enteros `bigint` para importes y cálculos antes de darles formato. Una conversión prematura a `Number` puede perder precisión. La FDV de lanzamiento queda fijada en el despliegue en `LAUNCH_ETH()`: 3,75 ETH elegidos para la nueva versión, sobre 21 millones de CUBIT. No mezcles USD, wei y unidades de token.

## Los métodos del router

```text
swapExactIn(
    PoolKey key, bool zeroForOne,
    uint256 amountIn, uint256 amountOutMin,
    address recipient, uint256 deadline
)

swapExactOut(
    PoolKey key, bool zeroForOne,
    uint256 amountOut, uint256 amountInMax,
    address recipient, uint256 deadline
)
```

`zeroForOne = true` compra CUBIT con ETH. Para exact-input, proporciona `amountIn` como value; para una compra exact-output, proporciona `amountInMax`, con devolución del excedente. Una venta utiliza `zeroForOne = false`, value cero y una autorización CUBIT para el router.

Los importes devueltos siguen los límites netos/brutos del router: salida neta para exact-input, entrada bruta para exact-output. El contrato controla las ejecuciones incompletas. La cotización debe simularse con la clave de pool correcta y su versión. Después de una venta, el router también llama a `deliverAbsorbed()` si quedan CUBIT absorbidos pendientes.

## Eventos y errores

Los eventos del hook incluyen `BuyTaxed`, `SellTaxed`, `BandBootstrapped`, `TeamPaid` y, para los muros, `WallFunded`, `WallAbsorbed`, `TokensAbsorbed` y `AbsorbedDelivered`. `ModuleUpdated` permite seguir las sustituciones de módulos.

En los vaults, sigue `Staked`, `Withdrawn`, `RewardReserveFunded` y `CubitRewardClaimed`, y después `Deposited`, `Claimed` y `LockExtended` para el vault de gobernanza.

Los logs de `WallLib` se emiten en el contexto del hook: indéxalos en la dirección del hook con las firmas ABI correspondientes. El antiguo evento `FloorRaised` ya no existe.

En el router, trata especialmente `Expired`, `WrongPool`, `TooLittleReceived`, `TooMuchRequested`, `InsufficientOutput` e `IncompleteInput`. En el hook, `ExternalLiquidityForbidden` rechaza cualquier liquidez de terceros y `SupplyNotDeposited`, un depósito de lanzamiento insuficiente. Revisa los códigos y la ABI de la versión validada.

<p class="source-note">Fuentes: <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code> y el historial Git de la nueva versión, incluido el commit <code>4aa063ac</code>.</p>
