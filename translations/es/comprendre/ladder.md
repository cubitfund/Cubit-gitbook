---
description: "Una sola banda amplia, colocada en el lanzamiento con el 80% de la oferta y nunca retirada: la liquidez de trading de CUBIT."
section: "01 / ENTENDER"
reading: "4 MIN DE LECTURA"
search:
  keywords: ["banda", "band", "liquidez", "TIDE", "curva", "x·y=k", "lanzamiento", "FDV", "ladder"]
---

# La banda de liquidez

La liquidez de trading de CUBIT se concentra en **una sola banda amplia**, según el modelo de TIDE. El hook la coloca en el lanzamiento y nunca la retira. Sustituye al antiguo ladder.

## Qué contiene la banda

| Parámetro | Valor elegido |
| --- | --- |
| Depósito | 80% de la oferta, es decir, 16,8 millones de CUBIT |
| Composición en el lanzamiento | 100% CUBIT, ningún ETH |
| Rango de precios | Todos los precios por encima del precio de lanzamiento |
| FDV de lanzamiento | 3,75 ETH, es decir, 3 ETH de profundidad para la banda |
| Retirada | Ninguna: la posición nunca se retira |

El límite inferior de la banda corresponde al precio de lanzamiento, redondeado al tick, de modo que la posición no contiene ningún ETH al principio. Por encima, cubre toda la curva de precios del pool.

## Una curva x·y=k

Las compras y las ventas siguen la curva de producto constante de la banda. Una compra deposita ETH en ella y retira CUBIT: el precio sube. Una venta hace lo contrario: el precio baja.

Con una FDV de lanzamiento de 3,75 ETH, los 16,8 millones de CUBIT valen **3 ETH al precio de lanzamiento**. Al principio, la banda se comporta como un pool x·y=k de 16,8 millones de CUBIT frente a 3 ETH. Estos 3 ETH son **virtuales**: fijan la pendiente de la curva, pero la banda solo contiene realmente los ETH aportados por los compradores.

## Qué no garantiza la banda

Los ETH que los vendedores pueden retirar de la banda son los que los compradores depositaron en ella. Cuando el precio vuelve al precio de lanzamiento, la banda solo contiene CUBIT: ya no puede recomprarlos por debajo de ese precio.

Por debajo del precio de lanzamiento, una venta solo puede atenderse con ETH todavía presentes en los muros. La profundidad de 3 ETH no es ni una reserva de ETH depositada por el protocolo ni un precio mínimo.

## Qué desapareció con el ladder

La banda sustituye al antiguo libro móvil. Se suprimen:

- el ladder, sus bandas sucesivas y su reserva de tokens;
- el cushion en ETH;
- `rebalance`, `raiseFloor`, el sweep hacia los muros y las recompensas de los keepers.

No se necesita ninguna llamada de mantenimiento para que el mercado funcione: ya no hay keeper.

## La banda de un hijo Forge

Un mercado hijo creado por la Forge sigue el mismo modelo, con una diferencia: **deposita el 100% de su oferta en su banda**. No tiene reserva de vault ni asignación al equipo. El hook exige un depósito de al menos el 80% de la oferta y coloca la totalidad del depósito en la banda. [Momentum y Forge](../v2/momentum-forge.md).

## Verificar la banda

La vista `band()` del hook devuelve los ticks y la liquidez de la posición; el evento `BandBootstrapped` se emite en el lanzamiento. El Lens expone `bandEth` y `bandTokens`, los ETH y los CUBIT que mantiene la banda al precio actual, sin contar las comisiones LP. [Contratos e integración](../developper/integration.md).

<p class="source-note">Fuentes: <code>CubitHook._bootstrap</code>, <code>afterInitialize</code>, <code>band()</code>, <code>MIN_POOL_SUPPLY</code>, <code>CubitLens.bandEth</code> / <code>bandTokens</code> y <code>periphery/CubitForge.sol</code>. Decisiones de diseño del 14 de septiembre de 2026.</p>
