---
description: "Límites concretos: profundidad finita de la banda y de los muros, gas de los muros atravesados, reserva de recompensas, integraciones, sustitución de módulos y pruebas de versión."
section: "05 / VERIFICAR"
reading: "5 MIN DE LECTURA"
search:
  keywords: ["seguridad", "riesgos", "límites", "pérdidas", "auditoría", "reserva", "extracción", "gas"]
---

# Riesgos y límites

La banda y los muros son posiciones LP. Su presencia define una liquidez disponible, sin hacer que el resultado de una operación sea independiente del precio, las comisiones o el estado del pool.

> Los límites siguientes no son exhaustivos. El código puede contener errores que las pruebas no han revelado.

## Precio y ejecución

La banda solo contiene los ETH aportados por los compradores: su profundidad de 3 ETH en el lanzamiento es virtual. Cuando el precio vuelve al precio de lanzamiento, solo contiene CUBIT. Los muros, por su parte, solo contienen los ETH que las ventas han colocado en ellos.

El mercado, el objetivo del próximo muro, el precio de un muro y el importe neto obtenido por una venta son datos distintos. Utiliza una cotización para el importe previsto. Una variación fuerte entre cotización y ejecución puede provocar un rechazo por el mínimo recibido o el límite de entrada; las tasas, las comisiones del pool y el gas siguen siendo costes reales.

## Muros y contabilidad

Cada muro atravesado cuesta unos 185 000 gas a la venta que lo vacía. Como EIP-7825 limita una transacción a 16 777 216 gas, una venta atraviesa como máximo unos 88 muros: más allá, falla sin pérdidas y debe dividirse en varias ventas. Un envío fallido de los CUBIT absorbidos no bloquea la venta: quedan aislados en el hook y cualquiera puede reintentar el envío.

Ninguna prueba publicada garantiza que un actor no pueda extraer los ETH acumulados en los muros a un tipo de cambio favorable, por ejemplo comprando pronto y vendiendo después en muros financiados por otras ventas.

La separación de cuentas debe seguir siendo válida después de compras, ventas, absorciones, recompensas y sustituciones. El tamaño de los contratos, la vinculación de las bibliotecas y los parámetros de compilación también forman parte del alcance de verificación.

## Vault y reserva

La recompensa del 3% al día se paga mediante una reserva finita: a ese ritmo, la reserva puede agotarse y los pagos detenerse. Una recompensa no reclamada más allá de un día se pierde.

Los CUBIT pagados como recompensas son negociables: su posible venta pesa sobre el mercado como cualquier otra venta. Las comisiones de lanzamiento de la Forge y los tokens de los muros de los hijos se destinan al vault de gobernanza, cuyos lotes desbloqueados solo puede reclamar el desplegador, para siempre y sin transferencia posible.

## Integraciones y módulos

Un router de terceros no llama necesariamente a `deliverAbsorbed()` después de una venta: los CUBIT absorbidos quedan entonces pendientes hasta una llamada pública. La compatibilidad de un agregador debe probarse con las tasas del hook y la versión del pool.

Los módulos sustituibles introducen confianza en las decisiones futuras del equipo: puede sustituirlos inmediatamente, sin demora, y protege la clave privada de su dirección. Las verificaciones de getters no demuestran la seguridad del código elegido. Una dirección nueva requiere revisar de nuevo la autorización o la firma.

El hook no tiene ningún administrador: nadie puede poner en pausa los swaps ni el mecanismo de los muros, ni siquiera en caso de incidente. En cambio, la dirección del equipo conserva poderes permanentes sobre los módulos del registro.

## Frontend y datos

Una pantalla puede utilizar una simulación, un manifiesto antiguo o datos obsoletos; el dapp actual lee la versión en servicio. La interfaz debe identificar la red y los bloques, señalar fallos e impedir una firma desde un contexto que haya perdido coherencia.

Las cifras en USD dependen de la conversión elegida: la FDV de lanzamiento se fija en ETH y no sigue al dólar.

## Qué permiten afirmar las pruebas

Las pruebas y campañas de invariantes aportan evidencias sobre los casos, estados y revisión realmente explorados. Las campañas históricas se refieren al modelo antiguo y no validan la nueva versión. Una campaña larga superada no es una prueba formal general.

Esta edición no garantiza la ausencia de pérdidas. El [estado real de las versiones](etat.md) detalla lo que se ha probado, y el [roadmap](../roadmap.md), las etapas siguientes.

<p class="source-note">Fuentes: <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>CubitHook.sol</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code> y, para el historial, <code>audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md</code>.</p>
