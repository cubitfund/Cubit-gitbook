---
description: "Plan de pruebas manuales en Sepolia para la nueva versión: banda, swaps, tasas, muros, vaults, sustituciones, rechazos esperados y hoja de registro numerada."
section: "05 / VERIFICAR"
reading: "PLAN DE PRUEBAS NUMERADO"
search:
  keywords: ["pruebas de aceptación", "prueba", "testnet", "Sepolia", "manual", "checklist", "plan", "gravedad", "registro", "rechazo"]
---

# Plan de pruebas manuales en Sepolia

Esta página es una **lista de control que se ejecuta a mano**, en la red de pruebas Sepolia, por una persona equipada con una cartera. Cada caso lleva un número estable con la forma `T-01`, citable en un informe.

> **Antes de empezar.** Este plan se refiere a la nueva versión. El manifiesto público del repositorio describe el despliegue Sepolia **en servicio**, con comisiones LP `100`: este plan sí se le aplica. Un caso que no aplique a la versión probada se anota como “fuera del alcance de la versión”, nunca como “fallo”.

Los valores citados proceden del código de la nueva versión, en `contracts/src/`, y de las decisiones de diseño del 14 de septiembre de 2026. Un comportamiento que no se ha podido establecer se marca como **“por confirmar durante la prueba”**.

## Cómo usar este plan

Cada sección presenta sus casos en una tabla de seis columnas. Las dos últimas se rellenan durante las pruebas de aceptación.

| Columna | Qué se anota |
| --- | --- |
| Caso | El identificador estable, de `T-01` a `T-110` |
| Condiciones previas | Lo que debe cumplirse antes de empezar |
| Pasos | Las acciones, en orden |
| Resultado esperado | Lo que prevén el código y las decisiones |
| Resultado observado | Lo que ocurrió, con el hash de transacción o el bloque de lectura |
| Gravedad | Vacía si es conforme; si no, Bloqueante, Mayor, Menor o Cosmética |

| Gravedad | Criterio |
| --- | --- |
| Bloqueante | Pérdida o bloqueo de fondos, tasa no cobrada, muro perdido, recompensa pagada sobre el principal |
| Mayor | Comportamiento contrario a las fuentes, rechazo ausente, cifra mostrada errónea |
| Menor | Diferencia de visualización sin consecuencias en la cadena, mensaje impreciso |
| Cosmética | Tipografía, maquetación, etiqueta |

Una transacción **rechazada conforme a un caso de rechazo es un éxito**. Un hash solo significa que la transacción se ha enviado: solo el recibo informa de su éxito.

**Algunos casos no pasan por la interfaz.** En sus fuentes actuales, el dapp lee la ABI de la versión en servicio y no expone las órdenes de salida exacta, ni `claimTeam()`, ni las lecturas detalladas de los muros. Estos casos se marcan como “llamada directa”: se ejecutan con una herramienta de llamada a contratos, en las direcciones del manifiesto del despliegue probado.

## 1. Preparación

Anota estos elementos **antes** del primer swap: sirven de referencia para todas las comparaciones posteriores.

- La red: Sepolia, identificador de cadena `11155111`.
- Las direcciones del despliegue probado, leídas en su manifiesto: token, hook, PoolManager, `poolId`, router, Lens, registro V2, Vault, lanzador; y después, una vez añadido el launchpad, vault de gobernanza y Forge. **No copies ninguna clave privada en tus notas.**
- Los parámetros fijados: `fee`, `tickSpacing`, `LAUNCH_ETH`, `MIN_POOL_SUPPLY`, `launchTimestamp`, `moduleRevision`.
- El estado inicial: `snapshot()` del Lens, `band()` del hook, `totalSupply()` y `totalBurned()` del token, `pendingFloorEth`, `pendingAbsorbedTokens`, `wallCount()`, `activeWallCount()`, `teamAccrued`, `teamPaidCumulative`, `rewardReserve()` del Vault, y el **número de bloque** de lectura.

Reserva ETH de prueba **además** de los importes intercambiados: cada transacción paga su gas, y varios casos exigen transacciones rechazadas, que también lo consumen.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-01 | Cartera instalada | Seleccionar Sepolia; abrir el dapp conectado a la versión probada | La red se reconoce; ninguna invitación a firmar en otra cadena |  |  |
| T-02 | Cuenta nueva | Proveer ETH de prueba mediante un faucet de Sepolia | Saldo visible en la cartera y en el dapp tras actualizar |  |  |
| T-03 | Manifiesto a la vista | Comparar cada dirección mostrada con la del manifiesto | Identidades idénticas; `poolId`, `fee` y `tickSpacing` coinciden |  |  |
| T-04 | Todavía no se ha emitido ningún swap | Leer `snapshot()` y anotar el bloque | Valores de referencia registrados, bloque identificado |  |  |
| T-05 | Llamada directa | Leer `poolKey()` del hook | `currency0` igual a la dirección cero, `fee = 100`, `tickSpacing = 10`, `hooks` igual al hook |  |  |
| T-06 | Registro V2 legible | Leer `moduleRevision()` y las direcciones de los módulos | Revisión anotada; cualquier cambio durante las pruebas obliga a volver a verificar antes de cada firma |  |  |

## 2. Lanzamiento y banda

En la inicialización del pool, el hook coloca **todo su depósito** en una sola posición `[minUsableTick, tickUpper]`, identificada por `BAND_SALT`. `tickUpper` es el tick de apertura redondeado hacia abajo al espaciado, de modo que la posición solo contiene CUBIT. El hook rechaza un depósito inferior a `MIN_POOL_SUPPLY`, es decir, el 80% de la oferta, y quema el residuo de redondeo.

El lanzamiento completo también aporta el 20% de la oferta a la reserva del Vault y realiza una compra de 0,1 ETH en la misma transacción.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-07 | Lanzamiento realizado, llamada directa | Leer `band()` | `lower = −887 270`; `upper` igual al tick de apertura redondeado hacia abajo al múltiplo de 10, es decir, `155 390` para una FDV de 3,75 ETH; liquidez no nula |  |  |
| T-08 | Transacción de lanzamiento conocida | Leer sus eventos | `BandBootstrapped(lower, upper, liquidity, tokens)` emitido una vez, con los valores de `band()`; `tokens` igual al depósito menos un residuo de redondeo |  |  |
| T-09 | Lanzamiento sin compra inicial | Leer `bandEth` y `bandTokens` en `snapshot()` antes de cualquier swap | `bandEth = 0`; `bandTokens` igual al depósito, salvo redondeos |  |  |
| T-10 | Lanzamiento realizado, llamada directa | Leer `token.balanceOf(hook)` | Cero, salvo transferencia directa de un tercero: el hook no conserva ningún CUBIT bruto después de la inicialización |  |  |
| T-11 | Llamada directa | Intentar añadir liquidez al pool | Rechazo `ExternalLiquidityForbidden`: el hook es el único proveedor de liquidez |  |  |
| T-12 | Despliegue de ensayo | Inicializar el pool con un depósito inferior a `MIN_POOL_SUPPLY` | Rechazo `SupplyNotDeposited`; no se coloca ninguna banda |  |  |
| T-13 | Lanzamiento completo | Leer `rewardReserve()` del Vault después de la transacción de lanzamiento | Reserva igual al 20% de la oferta, es decir, 4,2 millones de CUBIT; ninguna asignación al equipo ni airdrop |  |  |
| T-14 | Lanzamiento completo | Leer la compra del desplegador en la transacción de lanzamiento | Compra de 0,1 ETH; `BuyTaxed` con el 3% para el equipo; CUBIT recibidos libremente transferibles |  |  |
| T-15 | Compra confirmada, llamada directa | Recalcular la salida esperada a partir de las reservas virtuales de la banda | Salida coherente con la curva x·y=k después de la tasa del 3% y las comisiones LP; al principio, 16,8 millones de CUBIT frente a 3 ETH virtuales — por confirmar durante la prueba |  |  |
| T-16 | Compra y después reventa de los CUBIT comprados | Leer `bandEth` antes, entre ambas operaciones y después | `bandEth` aumenta con la compra y después vuelve hacia su valor inicial; nunca supera los ETH realmente aportados por las compras |  |  |

## 3. Recorrido de compra y venta

El router expone `swapExactIn(key, zeroForOne, amountIn, amountOutMin, recipient, deadline)` y `swapExactOut(key, zeroForOne, amountOut, amountInMax, recipient, deadline)`. `zeroForOne = true` compra CUBIT con ETH.

**En las fuentes actuales del dapp, la interfaz solo utiliza la entrada exacta.** El usuario siempre introduce el importe que paga; la cantidad recibida es un campo de solo lectura. Por tanto, los recorridos de salida exacta deben probarse mediante llamada directa al router.

Una compra envía ETH nativo en `msg.value`. Una venta envía un valor nulo y exige una **autorización ERC-20** del CUBIT al router: la interfaz solicita la autorización **del importe exacto**, nunca ilimitada, por lo que una venta mayor requiere una nueva autorización.

El router rechaza las ejecuciones parciales: una entrada exacta no consumida por completo activa `IncompleteInput`, y una salida exacta no servida por completo activa `InsufficientOutput`. Como la tasa se dimensiona sobre el importe solicitado, la anulación protege al usuario.

Ajustes de la interfaz leídos en las fuentes del dapp, que deben verificarse durante las pruebas de aceptación: tolerancia de slippage **por defecto del 1,0%**, entrada limitada a **dos decimales** y al intervalo de `0` a `99,99`; mínimo recibido calculado en enteros y **redondeado al wei superior**; cotización **actual durante 30 segundos**; fecha límite on-chain = timestamp de la cadena **más 120 segundos menos la antigüedad de la cotización**.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-17 | Saldo ETH suficiente | Comprar un importe pequeño, por ejemplo 0,001 ETH | Recibo exitoso; CUBIT abonados; evento `BuyTaxed` emitido |  |  |
| T-18 | Saldo ETH elevado | Comprar un importe alto | Recibo exitoso; el impacto de precio se ve en la cotización, no en el porcentaje de la tasa |  |  |
| T-19 | CUBIT en cartera | Autorizar y después vender | Dos transacciones distintas; ETH netos recibidos; `SellTaxed` emitido |  |  |
| T-20 | Venta anterior confirmada | Vender un importe **superior** al anterior | Se solicita una nueva autorización: la autorización cubría el importe exacto |  |  |
| T-21 | Pantalla de swap abierta | Leer la tolerancia propuesta sin tocarla | Valor por defecto **1,0%** |  |  |
| T-22 | Pantalla de swap abierta | Introducir `0.005`, después `100` y después un valor negativo | Entradas rechazadas con un mensaje sobre el intervalo 0–99,99 y los dos decimales |  |  |
| T-23 | Cotización actual | Ajustar la tolerancia a su valor más bajo aceptado, esperar un movimiento de precio y después firmar | Rechazo `TooLittleReceived(received, minimum)`; ningún token perdido; la interfaz no invita a eliminar la protección |  |  |
| T-24 | Cotización mostrada | Dejar pasar más de 30 segundos sin actuar y después intentar firmar | La cotización se considera caducada y se recalcula antes de cualquier firma |  |  |
| T-25 | Cotización a punto de caducar | Firmar justo antes de la expiración y leer la fecha límite transmitida | La fecha límite vale 120 segundos **menos** la antigüedad de la cotización: una cotización de 30 segundos deja unos 90 segundos |  |  |
| T-26 | Llamada directa | Llamar a `swapExactIn` con una fecha límite ya superada | Rechazo `Expired`; ningún movimiento de fondos |  |  |
| T-27 | Llamada directa | Llamar a `swapExactOut` para una compra, con un límite de entrada holgado | Cantidad exacta recibida; excedente de ETH devuelto al llamante en la misma transacción |  |  |
| T-28 | Llamada directa | Llamar a `swapExactOut` con un límite de entrada inferior en un wei al importe requerido | Rechazo `TooMuchRequested(required, maximum)` |  |  |
| T-29 | Saldo de CUBIT superior a lo que la banda y los muros pueden recomprar, por ejemplo CUBIT recibidos como recompensa | Vender ese saldo en entrada exacta mediante el router | Rechazo `IncompleteInput`; la tasa se anula con la transacción — por confirmar durante la prueba |  |  |
| T-30 | Llamada directa | Solicitar en salida exacta más ETH de los que el libro puede servir | Rechazo `InsufficientOutput`; ninguna liquidación parcial |  |  |
| T-31 | Llamada directa | Enviar sucesivamente un importe nulo, un destinatario nulo, un valor `msg.value` incoherente y después otra clave de pool | Rechazos respectivos `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` |  |  |
| T-32 | Router de terceros compatible | Comprar y después vender por una ruta de terceros | Se aplican las tasas del hook |  |  |
| T-33 | Contrato de llamada o lote de transacciones | Encadenar una compra y después una venta en la **misma transacción** | Los dos tramos se gravan por separado |  |  |

## 4. Tasas y contabilidad

| Operación | Base | Reparto |
| --- | --- | --- |
| Compra | 3% del tramo ETH bruto | 100% parte del equipo; la asignación a los muros es explícitamente nula |
| Venta | 15% de los ETH brutos de salida | 12% hacia los muros, 3% hacia el equipo |

En entrada exacta, la tasa de compra está **incluida** en el importe aportado y se redondea al wei superior. En salida exacta, se añade por encima del tramo del pool, de modo que la tasa respecto al total sigue siendo del 3%.

Para una venta de salida exacta, la tasa vale `ceil(salida × 1500 / 8500)`: el pool produce la salida solicitada **más** la tasa. Para una venta de entrada exacta, vale `ceil(bruto × 15%)`. En el reparto, la parte del equipo se redondea hacia abajo y **todo el remanente en wei va a los muros**.

En las fuentes actuales del dapp, la interfaz exige leer estos porcentajes en la cadena antes de autorizar un swap: mientras no estén verificados, el botón permanece en espera.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-34 | Compra confirmada | Leer `BuyTaxed(ethIn, toFloor, toTeam)` | `toFloor` vale cero; `toTeam` vale el 3% de la entrada bruta, redondeado al wei superior |  |  |
| T-35 | Compra confirmada | Comparar `teamAccrued` antes y después | Aumento igual a la parte del equipo |  |  |
| T-36 | Venta confirmada | Leer `SellTaxed(ethOut, toFloor, toTeam)` | `toFloor + toTeam` es igual al 15% del bruto; `toTeam` vale el 3% del bruto; la suma es exacta al wei |  |  |
| T-37 | `teamAccrued` no nulo, llamada directa | Llamar a `claimTeam()` desde cualquier cuenta | Los fondos van a la dirección fija del equipo; `TeamPaid(amount, cumulative)` emitido; `teamAccrued` vuelve a cero |  |  |
| T-38 | `teamAccrued` nulo, llamada directa | Llamar a `claimTeam()` | La llamada no revierte y no transfiere nada |  |  |
| T-39 | Una compra y después una venta del mismo importe | Comparar el ETH inicial y el ETH final, sin contar el gas | El factor conservado se aproxima a `0,97 × 0,85 = 0,8245`; la diferencia se explica por las comisiones LP, el impacto y los redondeos |  |  |
| T-40 | Dos ventas de tamaños muy distintos | Comparar las tasas respecto a los brutos | El porcentaje sigue siendo del 15% en ambos casos; ni escalones ni exenciones |  |  |

## 5. Muros automáticos

En cada venta, tanto en entrada exacta como en salida exacta, el hook llama a `_collectCrossedWalls()` y después a `_placeWall()`. Primero vacía todos los muros que el precio ha atravesado por completo, del más cercano al más lejano, y después coloca todos los ETH pendientes en el objetivo `0,4 × precio actual + 0,6 × precio de lanzamiento`, calculado sobre el precio **después** de la venta y redondeado al tick. Si ese objetivo no está estrictamente por encima del tick del pool, lo que ocurre en el precio de lanzamiento o por debajo, el muro se coloca un 1% por debajo del precio actual.

Un muro vaciado suma sus CUBIT a `pendingAbsorbedTokens` y devuelve sus ETH restantes, comisiones y residuos, a `pendingFloorEth`. Un muro solo parcialmente consumido permanece en su sitio. Solo un importe demasiado pequeño para crear liquidez y el caso extremo de un precio en lo más alto del rango de ticks, donde ningún muro cabe por debajo del precio, dejan fondos esperando en `pendingFloorEth`: la venta nunca se rechaza por ello. Después, el router CUBIT llama a `deliverAbsorbed()` dentro de un try/catch.

La referencia `floorPrice()` del Lens describe el **último muro financiado**, no un mínimo global. Cada muro atravesado cuesta unos 185 000 gas: una venta atraviesa como máximo unos 88 muros dentro del límite de 16 777 216 gas de una transacción.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-41 | Precio por encima del precio de lanzamiento | Vender y después leer los muros | `WallFunded(id, lower, addedEth, liquidity)` emitido; se crea o engrosa un muro en el tick objetivo con los ETH pendientes, incluido el 12% de la venta, salvo redondeos; `pendingFloorEth` solo conserva el remanente no colocado |  |  |
| T-42 | Situación anterior | Recalcular el objetivo a partir del precio **después** de la venta y del precio de lanzamiento | El `lower` del muro corresponde al objetivo 40/60 calculado sobre ese precio, redondeado al tick |  |  |
| T-43 | Dos ventas cuyo objetivo cae en el mismo tick | Leer `wallCount()` y `walls(id)` | Un solo muro: los dos `WallFunded` llevan el mismo `id`, la liquidez aumenta y no se crea ningún identificador |  |  |
| T-44 | Varios muros en ticks diferentes | Vender y comprar varias veces y después volver a leer `walls(id)` | El `lower` de cada muro no cambia; ningún muro se desplaza |  |  |
| T-45 | Muro activo por debajo del precio | Vender un importe que consume parcialmente el muro sin atravesarlo | El muro sigue activo con ETH y CUBIT; ningún `WallAbsorbed`; `pendingAbsorbedTokens` sin cambios |  |  |
| T-46 | Muro parcialmente consumido | Comprar hasta volver a pasar por encima del muro | El muro ha revendido sus CUBIT y ha recuperado ETH; su identificador y su tick no cambian |  |  |
| T-47 | Muro activo, venta mediante el router CUBIT | Vender un importe que atraviesa totalmente el muro | `WallAbsorbed(id, cubit, ethRemaining)` y `TokensAbsorbed(amount, pendingAbsorbedTokens)` y, después, `AbsorbedDelivered(sink, amount)` y `RewardReserveFunded` en la misma transacción; `rewardReserve()` aumenta en esos CUBIT; `pendingAbsorbedTokens` vuelve a cero; `totalSupply()` y `totalBurned()` no cambian |  |  |
| T-48 | Precio cercano al precio de lanzamiento, objetivo 40/60 no situado por debajo del mercado | Vender un importe pequeño que pueda atenderse y después leer los muros | La venta se completa; `WallFunded` emitido; el muro se coloca un 1% por debajo del precio después de la venta, redondeado al tick; `pendingFloorEth` solo conserva el remanente no colocado |  |  |
| T-49 | Situación de T-48 | Vender de nuevo un importe pequeño que pueda atenderse y después leer `pendingFloorEth` | `WallFunded` emitido un 1% por debajo del nuevo precio; `pendingFloorEth` solo conserva un residuo de redondeo: no se acumula nada de una venta a otra |  |  |
| T-50 | Router de terceros compatible | Vender atravesando totalmente un muro por una ruta de terceros y después llamar a `deliverAbsorbed()` desde una cuenta cualquiera | Tasas aplicadas; `TokensAbsorbed` emitido y los CUBIT permanecen en `pendingAbsorbedTokens` hasta la llamada, que emite `AbsorbedDelivered` |  |  |
| T-51 | Varios muros financiados | Leer `floorPrice()` y `netFloorPrice()` del Lens, y después `wallAmountsPage(0, 500)` y las páginas siguientes hasta `activeWallCount`, todas en el mismo bloque | Referencia del último muro financiado, presentada como tal; los CUBIT de los muros son la suma de las páginas más `pendingAbsorbedTokens`, añadido una sola vez |  |  |
| T-52 | Hijo Forge, muro totalmente atravesado | Leer `absorbedTokenSink()` del hook hijo y después los eventos de la venta | Destino igual a `governanceVault()` de la Forge; `AbsorbedDelivered` emitido; lote `Deposited(token, from, amount, unlockAt)` bloqueado 30 días |  |  |
| T-106 | Muchos muros que atravesar en una sola venta | Estimar el gas de la venta y después enviarla | Unos 185 000 gas por muro atravesado; más allá de unos 88 muros, la venta supera 16 777 216 gas y falla sin pérdidas: dividirla |  |  |
| T-107 | Despliegue de ensayo en el que el destino de los CUBIT rechaza el envío | Vender atravesando un muro mediante el router CUBIT y después volver a llamar a `deliverAbsorbed()` | La venta se completa; los CUBIT permanecen en `pendingAbsorbedTokens`; la llamada está abierta a cualquier cuenta y falla mientras el destino rechace el envío |  |  |

## 6. mCUBIT Vault

El Vault paga una recompensa **en CUBIT**, tomada únicamente de `rewardReserve`. Vale `DAILY_REWARD_BPS = 300`, es decir, el 3% del depósito por periodo de 24 horas (`REWARD_PERIOD`), calculada a prorrata y **limitada a un periodo**: más allá, el excedente se pierde. Nunca supera el saldo de la reserva y nunca se paga sobre el principal.

Cada depósito reinicia un bloqueo de **24 horas** (`LOCK_DURATION`) sobre toda la posición de la cartera; la retirada antes del vencimiento se rechaza con `Locked`. Un depósito, una retirada o una reclamación paga primero la recompensa acumulada y reinicia el periodo. Cualquier cuenta puede alimentar la reserva con `fundRewardReserve(amount)`. El vencimiento se evalúa con el timestamp de la cadena, no con el reloj del navegador.

La recompensa es **únicamente en CUBIT**, reclamada con `claimCubit()`: el Vault no expone ninguna función de recompensa en WETH.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-53 | Vault disponible, CUBIT en cartera | Autorizar y después depositar | `Staked(user, amount, unlockAt)` emitido; `unlockAt` igual al timestamp del bloque más 24 horas |  |  |
| T-54 | Posición existente | Depositar de nuevo antes del vencimiento | El bloqueo se **reinicia para toda la posición**; la recompensa acumulada, si no es nula, se paga con `CubitRewardClaimed` y el periodo se reinicia |  |  |
| T-55 | Bloqueo en curso | Solicitar una retirada | Rechazo `Locked` |  |  |
| T-56 | Bloqueo vencido | Retirar una parte del depósito | Retirada parcial aceptada; `Withdrawn` emitido; la recompensa acumulada se paga primero; el saldo restante sigue depositado |  |  |
| T-57 | Depósito de 1 000 CUBIT, reserva suficiente | Leer `pendingCubit` después de 12 horas y después de 24 horas | Unos 15 CUBIT y después 30 CUBIT |  |  |
| T-58 | Situación anterior | Esperar 48 horas sin reclamar y después leer `pendingCubit` | Siguen siendo 30 CUBIT: el segundo día se pierde |  |  |
| T-59 | Recompensa acumulada | Llamar a `claimCubit()` | CUBIT transferidos; `CubitRewardClaimed` emitido; `rewardReserve` disminuye en el importe pagado; `pendingCubit` vuelve a cero |  |  |
| T-60 | Despliegue de ensayo con una reserva pequeña | Reclamar una recompensa superior a la reserva | Solo se paga el saldo de la reserva; la reserva cae a cero; el principal no se toca |  |  |
| T-61 | Llamada directa | Llamar a `fundRewardReserve(0)` y después a `fundRewardReserve(x)` desde una cuenta cualquiera tras la autorización | Rechazo `InvalidAmount` y después `RewardReserveFunded(from, x)`; `rewardReserve` aumenta en `x` |  |  |
| T-62 | Llamada directa | Comparar `token.balanceOf(vault)` con `totalStaked + rewardReserve` en varios momentos | El saldo del Vault nunca es inferior a esa suma |  |  |
| T-63 | Importe nulo, llamada directa | Llamar a `stake(0)` y después a `withdraw(0)` | Rechazo `InvalidAmount` en ambos casos |  |  |
| T-64 | Vault no conectado al registro actual | Intentar un depósito | Rechazo `Inactive` |  |  |
| T-65 | Posición abierta | Leer la duración del bloqueo mostrada | Visualización en horas, derivada de `LOCK_DURATION`: 24 horas |  |  |
| T-66 | Dapp abierto | Buscar un recorrido de recompensa en WETH | Ninguno: solo se ofrece la recompensa en CUBIT |  |  |

## 7. Vault de gobernanza del launchpad

El vault de gobernanza recibe las comisiones de lanzamiento de la Forge, en ETH, y los tokens absorbidos por los muros de los hijos Forge. **Cada depósito queda bloqueado 30 días** (`LOCK_DURATION`) a partir de su propia recepción. **Solo el desplegador** puede reclamar, para siempre y sin posibilidad de transferir este derecho, y solo los lotes cuya fecha ha pasado, del más antiguo al más reciente. El ETH se contabiliza bajo la clave `ETH()`, la dirección cero. Vuelve a leer la ABI del despliegue probado antes de las pruebas de aceptación. El desplegador puede extender el bloqueo de todos los depósitos, presentes y futuros, con `extendLock`; `lockExtension()` solo crece y se suma a cada fecha.

El envío automático desde los muros de los hijos se verifica con T-52, y el depósito de la comisión de lanzamiento con T-81. Los casos T-67 a T-73 depositan tokens de prueba mediante llamada directa; T-108 reclama el ETH de una comisión.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-67 | Token de prueba, llamada directa | Autorizar y después llamar a `deposit(token, amount)` | `Deposited(token, from, amount, unlockAt)` emitido; `unlockAt` igual al timestamp del bloque más 30 días; `held(token)` aumenta en la misma cantidad |  |  |
| T-68 | Depósito de menos de 30 días | Llamar a `claim(token, n)` desde el desplegador | Rechazo `NothingToClaim` |  |  |
| T-69 | Lote desbloqueado | Llamar a `claim(token, n)` desde otra cuenta | Rechazo `NotDeployer` |  |  |
| T-70 | Un depósito al día durante 7 días | Reclamar cada día a partir del 30.º día siguiente al primer depósito | Sale un lote por día, del más antiguo al más reciente; el último sale 30 días después del séptimo depósito; `Claimed(token, amount, tranches)` en cada reclamación |  |  |
| T-71 | Varios lotes desbloqueados | Llamar a `claim(token, 1)` | Se paga un solo lote; el siguiente sigue siendo reclamable |  |  |
| T-72 | Tokens enviados mediante simple transferencia | Llamar a `lockUntracked(token)` y después volver a llamarla sin nueva transferencia | Nuevo lote bloqueado 30 días a partir de la primera llamada; la segunda llamada se rechaza con `NothingToLock` |  |  |
| T-73 | Lotes bloqueados y desbloqueados | Leer `claimable(token)` y `locked(token)` | El importe reclamable más el importe bloqueado es igual a `held(token)` |  |  |
| T-108 | Comisión de lanzamiento de T-81 depositada hace más de 30 días | Llamar a `claim(address(0), 1)` desde otra cuenta y después desde el desplegador | Rechazo `NotDeployer` y después ETH pagados al desplegador; `Claimed(address(0), amount, 1)` emitido; `held(address(0))` disminuye en el importe pagado |  |  |
| T-109 | Lotes bloqueados | Llamar a `extendLock(extra)` desde otra cuenta y después desde el desplegador | Rechazo `NotDeployer` y después `LockExtended(extra, lockExtension)` emitido; cada fecha leída con `tranche(token, i)` se retrasa `extra`; ninguna función acorta el bloqueo |  |  |

## 8. Forge

La Forge es un launchpad público, presentado como lanzamiento futuro. No forma parte del lanzamiento de CUBIT: se añade después, con su vault de gobernanza. Anota sus direcciones una vez añadido el launchpad.

Cualquier cuenta lanza un hijo pagando la comisión exacta. Un hijo Forge deposita toda su oferta en su banda, la Forge recibe la dirección del vault de gobernanza en su construcción y cada lanzamiento paga su comisión de 0,005 ETH a ese vault, que la conserva: quien lanza no la recupera nunca. Los salts de despliegue están ligados a quien lanza.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-81 | Forge disponible, cualquier cuenta | Lanzar un hijo con la comisión exacta de 0,005 ETH | `ChildLaunched(token, hook, launcher, team, fee)` emitido; el `BandBootstrapped` del hijo indica un depósito igual a toda su oferta, salvo redondeos; el vault de gobernanza emite `Deposited(address(0), forge, fee, unlockAt)`, con `unlockAt` igual al timestamp del bloque más 30 días y la eventual extensión; `pendingFloorEth` del hook padre sin cambios |  |  |
| T-82 | Forge disponible | Intentar un lanzamiento con un valor incorrecto, un nombre vacío, un equipo nulo u otra plantilla | Rechazo: `wrong launch fee`, `invalid name`, `invalid team` o `template mismatch` |  |  |
| T-110 | Salts de un lanzamiento vistos por otra cuenta | Lanzar desde una segunda cuenta con los mismos salts | Las direcciones del primer lanzamiento no se ocupan: los salts están ligados a quien lanza, y el segundo lanzamiento se rechaza con `child deployment failed` si su dirección de hook no lleva los permisos |  |  |

## 9. Sustituciones y poderes

La autoridad del registro puede sustituir cuatro direcciones periféricas en cualquier momento, sin demora: Vault, router, Lens y Forge. Cada sustitución emite `ModuleUpdated`, **incrementa `moduleRevision`** y cierra la funcionalidad correspondiente hasta que el equipo la vuelva a abrir: Vault, Momentum o Forge; sustituir el router no cierra ninguna funcionalidad. Un candidato ya registrado, conectado a otro hook o a otro token, o que ya tenga stake, se rechaza con `InvalidModule`.

El hook no tiene **ningún administrador**, y nadie puede poner en pausa los swaps ni el mecanismo de los muros. La dirección del equipo conserva poderes permanentes: recibe la parte del equipo de las tasas y sustituye y después activa los módulos del registro.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-83 | Depósitos y reserva en el Vault actual | Sustituir el Vault | Los CUBIT depositados, la reserva de recompensas y los vencimientos **permanecen en el Vault antiguo**; no se mueve ningún fondo |  |  |
| T-84 | Vault sustituido | En el Vault antiguo, reclamar, retirar y después intentar un depósito | La reclamación y la retirada siguen disponibles; el nuevo depósito se rechaza con `Inactive` |  |  |
| T-85 | Candidato ya registrado, o con stake | Intentar la rotación | Rechazo `InvalidModule` |  |  |
| T-86 | Sustitución realizada | Leer `moduleRevision()` y el evento; tras una sustitución del Vault, intentar un depósito en el nuevo Vault | Revisión incrementada; `ModuleUpdated(module, previous, current, revision)` coincide; el depósito se rechaza con `Inactive` hasta la reactivación del Vault |  |  |
| T-87 | Autorización concedida al router antiguo | Sustituir el router y después intentar una venta | La autorización antigua no vale para el nuevo spender; se solicita una nueva autorización |  |  |
| T-88 | Router sustituido | Intercambiar a través del router antiguo | El intercambio sigue siendo posible y se aplican las tasas del hook; la dapp usa el nuevo router |  |  |
| T-89 | Llamada directa | Inspeccionar la ABI del hook desplegado | Ninguna función permite suspender los swaps ni el mecanismo de los muros; el hook no tiene ningún administrador |  |  |
| T-90 | Llamada directa | Leer `snapshot()` del Lens y después las páginas de muros en el mismo bloque | El snapshot solo contiene campos de mercado, banda, muros y cuentas, la oferta total, la reserva de recompensas, el número de muros activos, el bloque de lectura y el mejor muro: ningún total de muros, y su coste no depende del número de muros; la oferta en circulación es igual a `totalSupply` menos los CUBIT de los muros y `rewardReserve`, y los CUBIT en manos de los holders son esa oferta menos `bandTokens` |  |  |
| T-91 | En cualquier momento después del lanzamiento | Comprar y vender | Los swaps funcionan con normalidad: ninguna cuenta puede bloquearlos |  |  |

## 10. Casos de rechazo esperados

Esta tabla sirve de referencia durante todas las pruebas de aceptación. Los muros automáticos no añaden rechazos a la venta: un muro que no puede colocarse deja los fondos pendientes, y un envío fallido deja los CUBIT pendientes.

> **Punto de atención.** En las fuentes actuales del dapp, los errores de contrato no se traducen: un rechazo on-chain puede mostrarse como un mensaje en bruto, truncado en pantalla. **Para cada rechazo provocado, anota el texto exacto mostrado** y valora si es comprensible.

| Error | Qué lo provoca | Qué debería mostrar la aplicación |
| --- | --- | --- |
| `ExternalLiquidityForbidden` | Aportación de liquidez por un tercero | Operación imposible: el protocolo es el único proveedor de liquidez |
| `SupplyNotDeposited` | Inicialización con un depósito inferior al 80% de la oferta | Lanzamiento imposible, depósito insuficiente |
| `Expired` | Fecha límite de la transacción superada | Cotización caducada, hay que calcular una nueva |
| `TooLittleReceived(received, minimum)` | Salida inferior al mínimo aceptado | Protección de slippage activada |
| `TooMuchRequested(required, maximum)` | Entrada superior al límite aceptado | Protección del límite de entrada activada |
| `IncompleteInput` | Entrada exacta no consumida por completo | Importe demasiado grande para la liquidez disponible |
| `InsufficientOutput` | Salida exacta no servida por completo | El libro no puede servir esta salida |
| `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` | Parámetros de orden no válidos, o importe nulo enviado al Vault | Error de introducción de datos, sin código en bruto |
| `Inactive`, `Locked` | Vault no conectado al registro actual, o retirada antes del vencimiento | Módulo no disponible, o fecha de desbloqueo |
| `NotDeployer`, `NothingToClaim`, `NothingToLock`, `NothingToExtend` | Reclamación o extensión en el vault de gobernanza por un tercero, reclamación antes del vencimiento, bloqueo sin saldo nuevo, extensión nula | Acción reservada, nada que reclamar, nada que bloquear o nada que extender |
| `NotAuthority`, `InvalidModule` | Sustitución solicitada por un tercero, o candidato incompatible | Sustitución rechazada, con el motivo |

También se anotan los rechazos propios de la aplicación: cotización caducada, contexto de swap modificado, cartera en otra cadena, cuenta cambiada, revisión de módulos cambiada, porcentajes de tasas todavía no verificados.

## 11. Aplicación

Estos casos se realizan con el dapp. Los comportamientos de interfaz citados proceden de sus fuentes y se verifican durante las pruebas de aceptación.

| Caso | Condiciones previas | Pasos | Resultado esperado | Resultado observado | Gravedad |
| --- | --- | --- | --- | --- | --- |
| T-92 | Dapp abierto | Recorrer los diez idiomas del selector | Cada idioma muestra un contenido traducido, sin textos ausentes ni desbordamientos; los nombres de productos se mantienen en inglés por decisión propia |  |  |
| T-93 | Idioma elegido | Recargar y después reducir la ventana por debajo de 640 px | La elección se conserva de una sesión a otra; por debajo de 640 px, el selector solo muestra la bandera |  |  |
| T-94 | Idioma distinto del inglés | Comparar el título de inicio con la versión inglesa | El título se reduce intencionadamente fuera del inglés; no debe desbordarse ni cortarse |  |  |
| T-95 | Pantalla de unos 400 px | Recorrer cada pantalla | Ningún desbordamiento horizontal; las zonas anchas se desplazan dentro de su propio contenedor; los botones siguen siendo accesibles |  |  |
| T-96 | Ventana entre 768 y 1279 px | Abrir la navegación | Se utiliza el menú compacto hasta 1279 px; se cierra después de navegar |  |  |
| T-97 | Transacción confirmada | Comparar cada importe mostrado con los valores on-chain en el mismo bloque | Los importes coinciden; los redondeos de visualización no modifican el importe firmado |  |  |
| T-98 | Operación en preparación | Cambiar de red en la cartera en mitad del recorrido | La cotización se invalida y la firma se rechaza fuera de la red esperada; el botón propone primero el cambio de red y después exige una segunda acción para intercambiar |  |  |
| T-99 | Operación en preparación | Cambiar de cuenta en la cartera en mitad del recorrido | Saldos, autorización y cotización se recalculan para la nueva cuenta; se rechaza una firma preparada para la cuenta anterior |  |  |
| T-100 | Autorización concedida, swap no firmado | Dejar que la revisión de los módulos cambie entre ambas acciones | La aplicación revalida el contexto y no encadena silenciosamente con un nuevo spender |  |  |
| T-101 | RPC no disponible o lectura antigua | Cortar el acceso al RPC y observar | El estado se señala como no verificado y las acciones se desactivan |  |  |
| T-102 | Transacción enviada | Seguir el hash y después el recibo | La interfaz distingue “enviada” y “exitosa”; los eventos pueden verificarse en un explorador de Sepolia |  |  |
| T-103 | Un rechazo on-chain provocado | Anotar el texto mostrado, completo | El mensaje debe seguir siendo comprensible para un usuario; registrar cualquier código técnico en bruto o mensaje truncado |  |  |
| T-104 | Idiomas chino, coreano y japonés | Mostrar estos idiomas sin acceso a un servicio de fuentes externo | Los caracteres se muestran correctamente: el sitio sirve las fuentes |  |  |
| T-105 | Pantalla Proof abierta | Leer la banda, los muros y los fondos pendientes | `bandEth`, `bandTokens`, los muros, los ETH pendientes y los CUBIT pendientes de envío se muestran por separado; ninguna pantalla presenta ladder, keepers ni quema de los muros |  |  |

## 12. Hoja de registro

Cada tabla de las secciones anteriores **es** la hoja de registro de su sección: rellena las columnas “Resultado observado” y “Gravedad” a medida que avanzan los casos. Para el resultado observado, anota como mínimo el hash de transacción o el bloque de lectura y, después, lo que se ha constatado.

Resumen que debe adjuntarse al informe:

| Sección | Casos | Conformes | Desviaciones | Gravedad máxima |
| --- | --- | --- | --- | --- |
| 1. Preparación | T-01 a T-06 |  |  |  |
| 2. Lanzamiento y banda | T-07 a T-16 |  |  |  |
| 3. Compra y venta | T-17 a T-33 |  |  |  |
| 4. Tasas y contabilidad | T-34 a T-40 |  |  |  |
| 5. Muros automáticos | T-41 a T-52, T-106 y T-107 |  |  |  |
| 6. mCUBIT Vault | T-53 a T-66 |  |  |  |
| 7. Vault de gobernanza | T-67 a T-73, T-108 y T-109 |  |  |  |
| 8. Forge | T-81, T-82 y T-110 |  |  |  |
| 9. Sustituciones y poderes | T-83 a T-91 |  |  |  |
| 10. Casos de rechazo | Referencia transversal |  |  |  |
| 11. Aplicación | T-92 a T-105 |  |  |  |

Una desviación se refiere **al número del caso**, nunca solo a una captura de pantalla. Adjunta la red, la dirección del despliegue, el bloque, el hash y la versión de la aplicación.

## Límites de este plan

Este plan describe lo que prevén el código de la nueva versión y las decisiones del 14 de septiembre de 2026. **No constituye una validación**: unas pruebas de aceptación superadas en Sepolia no sustituyen las campañas de pruebas.

Los puntos “por confirmar durante la prueba” deben observarse y después incorporarse a esta página.

<p class="source-note">Fuentes: <code>contracts/src/CubitHook.sol</code>, <code>CubitLens.sol</code>, <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>libraries/BandLib.sol</code>, <code>libraries/WallLib.sol</code>, <code>periphery/CubitRouter.sol</code>, <code>CubitV2.sol</code>, <code>CubitVault.sol</code>, <code>CubitGovernanceVault.sol</code>, <code>CubitForge.sol</code>, <code>CubitLaunch.sol</code>, los recorridos actuales de <code>dapp/src</code> y las decisiones de diseño del 14 de septiembre de 2026 recogidas en <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
