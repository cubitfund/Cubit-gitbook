---
description: "Respuestas a preguntas frecuentes sobre la banda, los muros financiados en cada venta, las comisiones, el Vault, los permisos y las versiones."
section: "05 / VERIFICAR"
reading: "RESPUESTAS RÁPIDAS"
---

# Preguntas frecuentes

## ¿Qué es exactamente un muro?

Una posición de liquidez financiada en ETH dentro del pool, en un tick determinado por debajo del precio actual. La fórmula elige su ubicación y el 12% de las ventas determina su tamaño.

## ¿Qué es la banda?

La posición única de trading: el 80% de la oferta, colocada en el lanzamiento, que cubre todos los precios por encima del precio de lanzamiento y nunca se retira. Las compras y las ventas siguen su curva x·y=k. [La banda de liquidez](comprendre/ladder.md).

## ¿El objetivo sigue el máximo histórico?

No. Utiliza el precio que deja cada venta: `0,4 × precio actual + 0,6 × precio de lanzamiento`. Para una base ilustrativa de 7 000, una vuelta de 100k a 60k da **28,2k**. [Consulta el cálculo](comprendre/murs.md).

## ¿Los muros antiguos bajan con el objetivo nuevo?

No. Un muro permanece en su tick. Una financiación que cae en el mismo tick lo engrosa; una venta puede, sin embargo, consumir sus ETH.

## ¿El 12% se coloca en cada venta?

Sí: cada venta coloca los ETH pendientes, incluido su 12%, en un muro en el objetivo calculado sobre el precio después de la venta. En el precio de lanzamiento o por debajo, este objetivo quedaría por encima del mercado: el muro se coloca entonces un 1% por debajo del precio actual. Solo un residuo demasiado pequeño para crear una posición y el caso extremo de un precio en lo más alto del rango de ticks esperan a una venta siguiente.

## ¿Las comisiones LP están incluidas en el 15%?

No. El 15% es la tasa del hook en la venta; la tasa de compra es del 3%. La comisión LP de la nueva versión es del 0,01%, con una base de cálculo propia del pool. El pool Ethereum conectado aplica esa misma comisión. [Detalle de las comisiones](comprendre/taxes.md).

## ¿Qué ocurre con un muro atravesado?

Un muro solo parcialmente consumido permanece en su sitio y se recarga de ETH si el precio vuelve a subir. Un muro totalmente atravesado es vaciado por la venta que lo ha atravesado: sus CUBIT pasan a la reserva de recompensas del vault. [Consulta la explicación](comprendre/burn.md).

## ¿Una venta puede atravesar un número ilimitado de muros?

No. Cada muro atravesado cuesta unos 185 000 gas, y una transacción está limitada a 16 777 216 gas: una venta atraviesa como máximo unos 88 muros. Más allá, falla sin pérdidas y debe dividirse. [Riesgos y límites](securite/risques.md).

## ¿CUBIT es deflacionario?

Ya no en la nueva versión. La oferta sigue fijada en 21 millones sin emisión, pero los CUBIT recomprados por los muros ya no se queman: alimentan la reserva de recompensas del vault.

## ¿Todavía hacen falta keepers?

No. `rebalance` y `raiseFloor` se han suprimido, y los muros se colocan y se vacían durante las ventas. No se paga ninguna recompensa a quien llama.

## ¿Alguien puede bloquear las ventas?

No. El hook no tiene ningún administrador, y nadie puede poner en pausa los swaps ni el mecanismo de los muros.

## ¿El equipo conserva poderes?

Sí, de forma permanente. La dirección del equipo recibe la parte del equipo de las tasas y puede sustituir en cualquier momento, sin demora, los módulos periféricos del registro y después activarlos. Estas sustituciones no afectan ni al núcleo ni a los saldos ya presentes en los vaults. [Los permisos](securite/permissions.md).

## ¿Están disponibles las funciones V2?

Sí: Momentum y la Forge desde el 23 de septiembre de 2026; el Vault, desde el 26 de septiembre de 2026. [Las funciones V2](v2/prochaines-fonctionnalites.md).

## ¿Qué ocurre si no reclamo mi recompensa cada día?

El importe reclamable tiene un tope de un día, es decir, el 3% del depósito. Tras 24 horas sin reclamar, el excedente se pierde. La recompensa también está limitada por el saldo de la reserva.

## ¿Un depósito nuevo prolonga el bloqueo del Vault?

Sí. Un depósito adicional reinicia el bloqueo de 24 h de toda la posición de esa cartera en ese contrato. La recompensa acumulada puede reclamarse independientemente del bloqueo de retirada.

## ¿Qué ocurre con mis fondos si se sustituye el Vault?

Permanecen en el Vault antiguo, con su reserva de recompensas y tu fecha de desbloqueo. Selecciona ese contrato antiguo para leer tu posición y efectuar sus salidas. Los fondos no se transfieren automáticamente al módulo nuevo.

## ¿Adónde van los tokens absorbidos por los muros de un hijo Forge?

Al vault de gobernanza del launchpad, que también recibe las comisiones de lanzamiento de la Forge, en ETH. Cada depósito queda bloqueado allí 30 días a partir de su contabilización —inmediata para un depósito o una comisión de lanzamiento, y al llamar a `lockUntracked` para tokens enviados directamente—, más la eventual extensión, y, después, solo el desplegador de ese vault puede reclamarlo: este derecho es definitivo y no puede transferirse. Ese desplegador puede extender el bloqueo, nunca acortarlo. [Momentum y Forge](v2/momentum-forge.md).

## ¿Quién puede lanzar un token en la Forge?

Cualquier cuenta, pagando la comisión de lanzamiento exacta de 0,005 ETH, que va al vault de gobernanza y nunca se devuelve. La Forge no formaba parte del lanzamiento de CUBIT: el equipo añadió el launchpad y lo abrió el 23 de septiembre de 2026. [Momentum y Forge](v2/momentum-forge.md).
