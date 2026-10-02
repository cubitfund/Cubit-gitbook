---
description: "3% en la compra, 15% en la venta, del cual el 12% para los muros, un 0,01% de comisiones LP previsto: entender las bases de cálculo."
section: "01 / ENTENDER"
reading: "5 MIN DE LECTURA"
search:
  keywords: ["tasas", "comisiones", "fee", "porcentaje", "compra", "venta", "equipo", "muros"]
---

# Tasas y circulación de ETH

Las **tasas del hook** y las **comisiones LP del pool** corresponden a dos operaciones diferentes. No utilizan la misma base ni se suman como una tasa única.

Estos porcentajes son los de la nueva versión y se aplican en el pool Ethereum conectado. Comprueba el [estado de las versiones](../securite/etat.md) y la cotización del pool utilizado.

## La tasa de compra

La tasa total es del **3% de la entrada bruta de ETH**, destinada íntegramente a la parte del equipo. En exact-input, está incluida en el importe entregado al router.

| Para una compra de 1 ETH | Importe | Destino |
| --- | --- | --- |
| Tramo del swap | 0,97 ETH | Pool, después comisiones LP y conversión a CUBIT |
| Parte del equipo | 0,03 ETH | Contabilidad del equipo |

Para una compra exact-output, si el tramo del pool requiere `x` ETH, el total antes del gas es aproximadamente `x / 0,97`, con redondeos enteros. El router aplica el límite de entrada elegido por el usuario y devuelve el excedente.

## La tasa de venta

La tasa total es del **15% de los ETH brutos de salida**: **12% para los muros y 3% para el equipo**.

| Para una salida bruta de 1 ETH | Importe | Destino |
| --- | --- | --- |
| ETH netos del vendedor | 0,85 ETH | Cartera del destinatario |
| Financiación de los muros | 0,12 ETH | Muro colocado en el objetivo de esta venta, o un 1% por debajo del precio actual en el precio de lanzamiento o por debajo |
| Parte del equipo | 0,03 ETH | Contabilidad del equipo |

El vendedor recibe, por tanto, **0,85 ETH**, antes del coste de gas pagado por separado. Para buscar una salida neta de `x` ETH en exact-output, el pool debe proporcionar aproximadamente `x / 0,85` ETH brutos, con redondeos enteros y según la cotización real.

Las **ventas financian directamente los muros**. El 12% y el 3% se calculan sobre los ETH brutos de la venta: no se trata del 12% del 15% de tasa. La parte del equipo va íntegramente al equipo.

## Las comisiones LP

El parámetro `fee` de Uniswap v4 se expresa en millonésimas:

| Versión | Parámetro | Porcentaje LP |
| --- | --- | --- |
| Nueva versión | `100` | **0,01%** |

El `tickSpacing` y la anchura de un muro son parámetros de geometría, no otra expresión de la comisión LP. El pool CUBIT utiliza un espaciado de 10 ticks en las fuentes leídas.

Las comisiones LP se aplican al tramo del swap según la mecánica del pool. Una cotización real tiene en cuenta los redondeos, los ticks cruzados, la liquidez y las posibles comisiones de protocolo v4. **No apliques una segunda vez la tasa a una cotización que ya sea neta.**

## Adónde va el 12%

En cada venta, el hook vacía primero los muros que el precio ha atravesado por completo y, después, coloca todos los ETH pendientes, incluido este 12%, en un muro situado en el objetivo calculado sobre el precio después de la venta. Si ya existe un muro en ese tick, se engrosa. En el precio de lanzamiento o por debajo, este objetivo queda casi siempre por encima del mercado: el muro se coloca entonces un 1% por debajo del precio actual. Solo un residuo demasiado pequeño para crear liquidez, un excedente cuando se alcanza el techo de liquidez de un tick, y el caso extremo de un precio en lo más alto del rango de ticks permanecen en `pendingFloorEth`, hasta una venta siguiente.

Ya no hay sweep: la antigua transferencia de una parte de los ETH del ladder a los muros desapareció con el ladder. [El objetivo y los muros fijos](murs.md).

## Los ingresos previstos para la V2

| Módulo | Ingreso | Qué no sirve de financiación |
| --- | --- | --- |
| Vault | Reserva de CUBIT: el 20% de la oferta en el lanzamiento y, después, los CUBIT de los muros totalmente atravesados | Principal depositado, creación de CUBIT, comisiones LP; ninguna recompensa en WETH |
| Forge | Comisión de lanzamiento de 0,005 ETH, pagada en ETH al vault de gobernanza del launchpad y nunca devuelta a quien lanza | Retirada de los fondos de los muros para un hijo |

Las comisiones de la Forge se cobran desde su apertura, el 23 de septiembre de 2026. La reserva del Vault paga las recompensas desde la apertura del Vault, el 26 de septiembre de 2026. Su importe depende de la actividad real.

## Una operación de ida y vuelta no cuesta exactamente el 18%

Aislando únicamente las tasas proporcionales, a precio constante, sin impacto ni otros costes, el factor conservado es `0,97 × 0,85 = 0,8245`. La pérdida correspondiente es, por tanto, del **17,55%**, no una suma mecánica de 15 y 3 aplicada al mismo importe.

Una operación real de ida y vuelta añade las comisiones del pool, el gas y la evolución del precio. El importe neto devuelto por la cotización sigue siendo la referencia para una transacción concreta. [Comprar y vender](../utiliser/swaps.md).

<p class="source-note">Distribución de tasas: decisiones de diseño del 14 de septiembre de 2026. Código: <code>CubitHook._creditBuyTax</code>, <code>_creditSellTax</code>, <code>_placeWall</code> y <code>periphery/CubitRouter.sol</code>.</p>
