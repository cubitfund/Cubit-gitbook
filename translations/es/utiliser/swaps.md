---
description: "El recorrido de compra y venta CUBIT: versión del pool, cotización neta, slippage, autorizaciones y recibo de transacción."
section: "02 / USAR"
reading: "5 MIN DE LECTURA"
---

# Comprar y vender

El dapp ofrece intercambios ETH/CUBIT mediante el router del despliegue seleccionado. Las tasas se aplican en el hook; el importe estimado a recibir debe ser ya neto de las tasas incluidas en la cotización.

> El dapp conectado a Ethereum utiliza la versión actual, con **un 0,01% de comisiones LP**, y lee la ABI de esa versión. Mientras el mercado no esté abierto, no es posible ningún intercambio. Una demostración o un modo de simulación no es un estado on-chain.

## Antes de preparar un swap

Comprueba la red de la cartera, el despliegue mostrado y el bloque de los datos. Reserva ETH para el gas además del importe que vas a intercambiar. El dapp debe señalar un RPC no disponible o datos obsoletos e impedir una firma basada en un estado no verificado.

Un cambio de cuenta, red, importe o dirección del router exige una cotización nueva. Las direcciones periféricas pueden cambiar mediante el registro V2.

## Comprar CUBIT

1. Elige un importe en ETH. En exact-input, la tasa de compra del 3% está incluida en ese importe.
2. Lee la cantidad neta estimada de CUBIT, las comisiones y el mínimo recibido fijado por la tolerancia de slippage.
3. Comprueba la simulación y los detalles presentados por la cartera, y firma.
4. Espera un recibo exitoso y la actualización de los saldos on-chain.

La compra utiliza ETH nativo mediante `msg.value`. El router CUBIT no utiliza Permit2 para este recorrido. En la nueva versión, una compra retira CUBIT de la banda siguiendo su curva x·y=k.

## Vender CUBIT

La venta puede requerir una **autorización ERC-20** que permita al router transferir la cantidad de CUBIT elegida. El frontend prepara una autorización del importe solicitado.

Tras confirmar la autorización, el dapp vuelve a comprobar la cuenta, la red, la revisión del registro y la actualidad de la cotización antes del swap. La autorización y la venta son dos transacciones distintas cuando el permiso previo era insuficiente.

La venta devuelve ETH netos de la tasa del 15%: el 12% de los ETH brutos financia los muros y el 3% va al equipo. En la nueva versión, la venta vacía los muros que atraviesa por completo y coloca los ETH pendientes en un muro; después, el router CUBIT envía los CUBIT absorbidos a la reserva del vault.

## El mínimo recibido y la fecha límite

El **slippage** limita la desviación aceptada respecto a la cotización. Una tasa ya incluida en la cotización no justifica añadir arbitrariamente 15 puntos de slippage.

En las fuentes del frontend leídas, una cotización permanece actual durante **30 segundos**. La fecha límite de la transacción se calcula a partir del timestamp de la cadena. Estos controles pueden impedir la firma después de una larga espera de autorización; en ese caso, hay que revisar una cotización actualizada.

Una transacción rechazada por los límites protege el importe mínimo o máximo acordado. Su fallo no significa que deba eliminarse ese límite.

## Si la transacción no se completa

| Situación | Acción útil |
| --- | --- |
| Red incorrecta o cuenta modificada | Volver al contexto deseado y solicitar una nueva cotización |
| Cotización caducada | Recalcular el importe neto y el mínimo recibido |
| Router o revisión modificados | Revisar la dirección actual y la nueva acción; la autorización antigua sigue vinculada al spender antiguo |
| Liquidez insuficiente | Comprobar una cotización para un importe menor y las posiciones presentes |
| Venta que atraviesa un número muy elevado de muros | Dividir la venta: más allá de unos 88 muros atravesados, supera el límite de gas de una transacción |
| RPC no disponible | Esperar una lectura on-chain válida antes de firmar |
| Transacción ya enviada | Comprobar el hash y el recibo antes de preparar otra |

El router rechaza una entrada no consumida por completo y una salida exacta no servida completamente. La EVM revierte los fondos gastados en una transacción revertida, excepto el gas.

## Comprobar el resultado

Un hash significa que se ha enviado la transacción; solo el recibo informa de su éxito. Comprueba la red del explorador, el estado, el destinatario y los eventos `BuyTaxed` o `SellTaxed`.

Los precios de referencia de los muros no sustituyen la cotización de una orden concreta. [Leer los datos del dapp](preuves.md).

<p class="source-note">Fuentes: <code>dapp/src/chain/swap.ts</code>, <code>executeSwap.ts</code>, <code>deployment.ts</code> y <code>contracts/src/periphery/CubitRouter.sol</code>. Las pruebas de aceptación con carteras de navegador y móvil siguen siendo distintas de las pruebas automatizadas.</p>
