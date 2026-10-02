---
description: "Los conceptos esenciales: token CUBIT, hook Uniswap v4, banda de liquidez y muros financiados en ETH en cada venta."
section: "01 / ENTENDER"
reading: "5 MIN DE LECTURA"
---

# CUBIT en 5 minutos

CUBIT es un token ERC-20 asociado a un mercado ETH/CUBIT en Uniswap v4. El propio protocolo aporta la liquidez de su pool: su **hook** es su único proveedor y aplica las tasas según las reglas del contrato.

La oferta está fijada en **21 millones de CUBIT**, creados una sola vez. No existe ninguna función que permita crear más. En la nueva versión, los CUBIT recomprados por los muros **ya no se queman**: pasan a la reserva de recompensas del vault.

> Esta página describe la nueva versión. Consulta el [estado de las versiones](../securite/etat.md).

## Los dos libros del mercado

| Libro | Función | Qué puede cambiar |
| --- | --- | --- |
| Banda | Una sola posición amplia, colocada en el lanzamiento con el 80% de la oferta; vende CUBIT a los compradores y recompra CUBIT a los vendedores | Su reparto entre CUBIT y ETH sigue al precio; la posición nunca se retira |
| Muros | Posiciones en ETH colocadas por debajo del precio actual y financiadas por las ventas | Su contenido cambia cuando el precio los atraviesa; su tick nunca cambia |

Los saldos del equipo y la reserva de recompensas del vault se contabilizan por separado. Por tanto, un saldo total no basta para describir los ETH realmente disponibles en los muros.

## Qué financian los swaps

Para una **compra exact-input de 1 ETH**, sin gas:

- **0,97 ETH** entra en el tramo del swap hacia el pool, antes de sus propias comisiones LP.
- **0,03 ETH** va al compartimento del equipo.

Para una **venta que produce 1 ETH bruto**, **0,85 ETH** va al vendedor, **0,12 ETH** financia los muros y **0,03 ETH** va al equipo. El gas se paga por separado.

La nueva versión prevé **un 0,01% de comisiones LP**. Esta comisión del pool es distinta de las tasas del 3% en la compra y el 15% en la venta. [Consulta las tasas en detalle](taxes.md).

## Cómo aparecen los muros

En **cada venta**, el hook vacía primero los muros que el precio ha atravesado por completo y, después, coloca los ETH pendientes, incluido el 12% de la venta, en un muro en el objetivo `0,4 × precio actual + 0,6 × precio de lanzamiento`, calculado sobre el precio después de la venta y redondeado al tick. Dos financiaciones que caen en el mismo tick se suman en un solo muro. Ningún muro se desplaza después.

En el precio de lanzamiento o por debajo, este objetivo quedaría por encima del mercado: el muro se coloca entonces un 1% por debajo del precio actual, en lugar de dejar que los fondos esperen a una venta siguiente. No se necesita ninguna llamada de mantenimiento: la creación y el vaciado de los muros forman parte de la venta.

**La fórmula elige la ubicación del muro; las ventas determinan su tamaño.** Un nivel mostrado no prueba que todos los titulares puedan vender en ese nivel. [El objetivo y los muros fijos](murs.md).

## Qué ocurre en el lanzamiento

El lanzamiento se realiza en una sola transacción:

- **el 80% de la oferta**, es decir, 16,8 millones de CUBIT, se deposita en la banda;
- **el 20%**, es decir, 4,2 millones de CUBIT, alimenta la reserva de recompensas del vault;
- el desplegador realiza una **compra de 0,1 ETH**, gravada con la tasa del 3% como cualquier compra, cuyos CUBIT no quedan bloqueados.

No hay airdrop ni asignación al equipo. [La banda de liquidez](ladder.md).

## V1 y V2

La **V1** es el mercado: token, hook, banda, muros y swaps. La **V2** añade Vault, Momentum y Forge, que el equipo abre cuando lo decide: Momentum y la Forge están abiertos desde el 23 de septiembre de 2026; el Vault, desde el 26 de septiembre de 2026.

La dirección del equipo recibe la parte del equipo de las tasas y sustituye y después activa los módulos periféricos compatibles del registro; estos poderes son permanentes. El hook no tiene ningún administrador: nadie puede poner en pausa los swaps ni el mecanismo de los muros, y el núcleo del pool conserva sus propias identidades fijas.

Las próximas etapas figuran en el [roadmap](../roadmap.md).

<p class="source-note">Fuentes del repositorio: <code>contracts/src/CubitToken.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitV2.sol</code> y las decisiones de diseño del 14 de septiembre de 2026 recogidas en <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
