---
description: "La fórmula elige la ubicación del muro; las ventas determinan su tamaño. Objetivo calculado en cada venta, ejemplos y muros fijados en su tick."
section: "01 / ENTENDER"
reading: "7 MIN + UN EJEMPLO INTERACTIVO"
search:
  keywords: ["muro", "muros", "objetivo", "precio", "profundidad", "capacidad", "retroceso", "fórmula", "venta", "16200", "44200", "28200"]
---

# El objetivo y los muros fijos

**La fórmula elige la ubicación del muro; las ventas determinan su tamaño.** Un muro es una posición LP financiada en ETH en un tick determinado, por debajo del precio actual.

## La fórmula en cada venta

Sean `M` la capitalización del mercado después de la venta y `B` la base de lanzamiento, expresadas en la misma unidad:

<div class="formula">objetivo = M − (M − B) × 0,6<span class="line-break"></span>= 0,4 × M + 0,6 × B</div>

El coeficiente retrocede **el 60% de la diferencia entre el mercado y la base**. Conserva, por tanto, el 40% de esa diferencia por encima de la base. Con una base ilustrativa `B = 7 000`:

| Mercado después de la venta | Cálculo | Objetivo del muro |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0,6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0,6 | **44 200** |
| Vuelta a 60 000 | 60 000 − 53 000 × 0,6 | **28 200** |

El tercer cálculo parte de **60 000**, aunque el mercado haya alcanzado antes 100 000. No existe un bloqueo basado en el máximo histórico. El objetivo se recalcula **en cada venta**, sobre el precio que deja esa venta: ya no hay una reserva acumulada que después se coloca mediante una llamada de mantenimiento.

## Varía el mercado

El ejemplo siguiente mantiene dos muros antiguos en 16,2k y 44,2k y calcula el objetivo del próximo muro. Los valores utilizan una misma unidad de capitalización, con una base ilustrativa de 7 000. Este esquema no simula absorción, saldos ni una transacción.

<section class="wall-lab" aria-label="Calculadora didáctica del objetivo">
  <header><span>EL OBJETIVO DESPUÉS DE LA VENTA</span><span>BASE FIJA: 7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">Mercado después de la venta <output id="market-value" for="market-cap">60 000 unidades</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">Vuelta a 60k</button></div>
  </div>
  <div class="wall-levels" aria-label="Comparación de los niveles de capitalización">
    <div class="level-row"><span>Muro antiguo A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16,2k</b></div>
    <div class="level-row"><span>Muro antiguo B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44,2k</b></div>
    <div class="level-row new-target"><span>Nuevo objetivo</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28,2k</b></div>
    <div class="level-row market"><span>Mercado actual</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>Objetivo del próximo muro</span><strong id="target-value">28 200 unidades</strong></div>
  <p class="lab-explanation">Solo las nuevas financiaciones siguen el objetivo actual. Los muros antiguos permanecen en su tick; la cantidad de ETH aún disponible en cada nivel debe leerse por separado.</p>
</section>

## Un muro por tick, nunca desplazado

Una vez colocados, los ETH de un muro siguen vinculados a su tick. Un mercado alcista o bajista no desplaza un muro antiguo hacia el nuevo objetivo.

- Una financiación cuyo objetivo cae en el tick de un muro existente **engrosa ese muro** en lugar de crear un segundo.
- Una venta puede consumir parcialmente un muro: una parte de sus ETH recompra entonces CUBIT.
- Un muro solo parcialmente consumido **permanece en su sitio**. Si el precio vuelve a subir, revende sus CUBIT y se recarga de ETH.
- Un muro **totalmente atravesado** es vaciado por la venta que lo ha atravesado: sus CUBIT van a la reserva de recompensas del vault, sin quema, y sus ETH restantes vuelven a los fondos pendientes.

Los identificadores de los muros son permanentes. Un índice de ticks permite encontrar los muros alcanzados por una venta. [Muros atravesados y reserva del vault](burn.md).

## Cuando el objetivo no es colocable

Un muro es una posición 100% ETH: debe situarse por debajo del precio actual. Cuando el precio está en el precio de lanzamiento o por debajo, la fórmula da un objetivo igual o superior al mercado, que no puede financiarse únicamente con ETH.

En ese caso, el hook coloca el muro **un 1% por debajo del precio actual**, redondeado al tick, en lugar de dejar que los fondos esperen. De lo contrario, unos fondos acumulados podrían colocarse de una sola vez a un precio inflado por una transacción que compra justo antes y después vende sus CUBIT en ese muro. El hook decide sobre el tick redondeado, no sobre el objetivo exacto: cerca del precio de lanzamiento, el objetivo 40/60 redondeado puede quedar justo por debajo del mercado y usarse tal cual, es decir, más cerca que un 1%.

Solo esperan en `pendingFloorEth` un importe demasiado pequeño para crear una posición, es decir, un residuo, un posible excedente cuando el muro objetivo alcanza el techo de liquidez de un tick, un límite de Uniswap v4, y el caso extremo de un precio en lo más alto del rango de ticks, donde ningún muro cabe por debajo del precio. Una venta siguiente los coloca. La venta en sí nunca se rechaza por este motivo.

## Los ETH realmente colocados

El hook coloca todos los ETH pendientes, incluido el 12% de cada venta, en la posición correspondiente al objetivo. Las ventas siguientes pueden consumir esos ETH: la reserva de cada muro es finita. Un muro puede financiarse sin esperar a cubrir toda la oferta.

## Del precio de lanzamiento a los ticks

El contrato trabaja con precios en ETH por CUBIT: `objetivo = 0,4 × precio actual + 0,6 × precio de lanzamiento`. El precio de lanzamiento se deriva de la **FDV de lanzamiento fijada en el despliegue**, dividida entre los 21 millones de CUBIT. La nueva versión elige **3,75 ETH** de FDV; ese precio queda después fijo y no sigue al dólar.

Los ejemplos en unidades de esta página aplican la misma fórmula a una capitalización. Su base de 7 000 es ilustrativa: no es una conversión de los 3,75 ETH elegidos.

Los ticks redondean después el nivel ejecutable. ETH es `currency0`, por lo que **un precio CUBIT más alto corresponde a un tick del pool más bajo**. El objetivo matemático, el tick realmente colocado y el precio neto de una venta pueden ser diferentes.

## Qué debe mostrar la interfaz

Una interfaz debe distinguir el mercado actual, la banda, el próximo objetivo, cada muro activo y su profundidad, así como los ETH y los CUBIT pendientes. Una sola línea “floor” no resume todo el libro.

La referencia histórica `floorPrice` describe el **último muro financiado**, que puede estar por debajo del anterior. No debe interpretarse como un mínimo global garantizado. [Leer los datos del dapp](../utiliser/preuves.md).

<p class="source-note">Fuentes: decisiones de diseño del 14 de septiembre de 2026, <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> y <code>CubitHook._placeWall</code>.</p>
