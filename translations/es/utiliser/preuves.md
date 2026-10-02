---
description: "Distinguir mercado, banda, objetivo, muros, fondos pendientes y datos on-chain en el panel CUBIT."
section: "02 / USAR"
reading: "4 MIN DE LECTURA"
search:
  keywords: ["proof", "pruebas", "panel", "datos", "floor", "simulación", "profundidad", "banda"]
---

# Leer los datos del dapp

La página Proof permite conciliar las cifras mostradas con los estados y eventos del protocolo. Empieza por la **red, el despliegue, la versión y el bloque de lectura** antes de interpretar un importe.

> El dapp público lee el despliegue Ethereum en servicio y su ABI. Los datos siguientes describen lo que debe distinguir una interfaz.

## Las cifras que deben distinguirse

| Dato | Qué describe |
| --- | --- |
| Precio de mercado | Precio actual del pool, distinto del resultado neto para una cantidad concreta |
| ETH de la banda | ETH que la banda mantiene realmente al precio actual, aportados por los compradores |
| CUBIT de la banda | CUBIT que la banda todavía ofrece a la compra |
| Objetivo del próximo muro | Nivel calculado con el precio actual, distinto de una posición financiada |
| Muros activos | Posiciones ya financiadas, cada una con su ID, su tick y su liquidez restante |
| ETH pendientes | Fondos de los muros que quedaron sin colocar: residuo demasiado pequeño para crear una posición, o precio en lo más alto del rango de ticks |
| CUBIT pendientes de envío | CUBIT de los muros atravesados, aislados en el hook hasta su envío al vault |
| Reserva de recompensas | CUBIT que mantiene el vault para pagar a los depositantes, distintos de los depósitos |
| Oferta en circulación | Oferta total menos los CUBIT de los muros, los que esperan su envío y la reserva de recompensas de los vaults; los CUBIT depositados en el vault siguen en circulación |

El nivel de un muro y sus ETH restantes deben leerse juntos. Los ETH de la banda y los de los muros pertenecen a dos libros distintos.

## Qué cambia con la nueva versión

La vista antigua presentaba un ladder, un cushion, una cola de quema y una pantalla de mantenimiento. La nueva versión los sustituye por una banda única, muros colocados y vaciados en cada venta y una reserva de recompensas en el vault. Ya no hay página Keepers.

El nombre histórico `floorPrice` describe el último muro financiado: no debe leerse como un mínimo global del mercado. Un muro nuevo puede colocarse por debajo del anterior cuando el precio ha bajado.

Los campos nuevos se detallan en la [integración](../developper/integration.md). El dapp conectado a Ethereum lee los campos de la versión actual.

## Precio bruto, precio neto y cotización

Una referencia bruta representa un nivel de precio de la posición. Una referencia neta puede incorporar un límite de rango, las comisiones LP, la tasa de venta y una hipótesis sobre las comisiones de protocolo v4.

La venta real depende de la cantidad, las posiciones atravesadas, los redondeos y el gas. Una referencia “net floor” no calcula el rendimiento de tu cartera ni sustituye una cotización.

## Los modos de datos

| Visualización | Interpretación |
| --- | --- |
| On-chain, bloque identificado | Datos leídos en el despliegue indicado |
| Cargando | Primera lectura todavía incompleta |
| Datos obsoletos o fallo RPC | Último estado conocido; no es autorización para firmar |
| Simulación o demostración | Ilustración local del mecanismo |

Para futuros lanzamientos, comprueba la disponibilidad anunciada y las direcciones de los módulos ofrecidos al usuario.

## Repetir la verificación

Comprueba las identidades del token, hook y pool, después los módulos actuales del registro y su `moduleRevision`. Concilia los eventos con el hash de transacción y su bloque canónico.

La página Proof permite seguir las tasas y los muros. Una captura de pantalla o un informe antiguo no sustituye esta identificación de versión. [Estado real de las versiones](../securite/etat.md).

<p class="source-note">Fuentes: <code>CubitLens.sol</code>, <code>interfaces/ICubitLens.sol</code> y, para el frontend, <code>dapp/src/chain/snapshot.ts</code>, <code>releases.ts</code> y <code>events.ts</code>.</p>
