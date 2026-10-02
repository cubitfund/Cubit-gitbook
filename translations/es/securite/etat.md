---
description: "Estado al 26 de septiembre de 2026: nueva versión desplegada en Ethereum, mercado abierto, Vault, Momentum y Forge abiertos."
section: "05 / VERIFICAR"
reading: "4 MIN DE LECTURA"
search:
  keywords: ["versión", "estado", "Ethereum", "mainnet", "testnet", "Sepolia", "validación", "auditoría", "desplegado", "redesign"]
---

# Estado real de las versiones

**Esta guía describe la nueva versión de CUBIT.** El dapp conectado utiliza el despliegue Ethereum de esta versión, con un 0,01% de comisiones LP. El mercado está abierto desde el 22 de septiembre de 2026, en el bloque 26 035 793.

Esta edición de la guía está fechada el **26 de septiembre de 2026**. Se apoya en las decisiones de diseño, el código de la nueva versión y los informes del repositorio.

## Tres estados distintos

| Alcance | Estado descrito por esta edición |
| --- | --- |
| Decisiones de diseño, fijadas el 14 de septiembre de 2026 | Compra 3% equipo; venta 15% (12% muros, 3% equipo); banda única del 80% de la oferta; muros creados en cada venta; CUBIT de los muros atravesados hacia la reserva del vault; vault al 3% diario; FDV de lanzamiento de 3,75 ETH |
| Código de la nueva versión | Componentes enumerados en la tabla siguiente |
| Ethereum conectado al dapp | Versión actual: compra 3%, venta 15% de los cuales 12% para los muros, fee LP 100 = 0,01%, banda única del 80% y muros colocados en cada venta, con registro V2 y módulos sustituibles |

Cambiar las fuentes locales no cambia los contratos ya desplegados. Una sincronización de documentación no mueve los fondos de un pool antiguo.

## Los componentes en producción

| Parte | Estado |
| --- | --- |
| Banda amplia en el lanzamiento, retirada del ladder y del mantenimiento | En producción en Ethereum |
| Muros colocados y vaciados en cada venta, envío de sus CUBIT al vault | En producción en Ethereum |
| Vault al 3% diario en CUBIT, pagado por la reserva | En producción en Ethereum desde el 26 de septiembre de 2026 |
| Vault de gobernanza del launchpad: comisiones de lanzamiento en ETH y tokens de los hijos Forge | En producción en Ethereum desde el 23 de septiembre de 2026 |
| Momentum: muros activos, parcialmente consumidos y atravesados de cada token | En producción en Ethereum desde el 23 de septiembre de 2026 |
| Forge pública: mercados hijos aislados, comisión de lanzamiento de 0,005 ETH | En producción en Ethereum desde el 23 de septiembre de 2026 |
| Recompensa del Vault únicamente en CUBIT, hook sin administrador | En el código desplegado en Ethereum |
| Lanzamiento en una transacción: 80% en la banda, 20% en la reserva del vault y compra de 0,1 ETH | En producción en Ethereum |

Estos componentes están desplegados en Ethereum desde el 22 de septiembre de 2026; el launchpad y Momentum, desde el 23 de septiembre de 2026. Los depósitos del Vault están abiertos desde el 26 de septiembre de 2026. Están cubiertos por las pruebas Foundry, el fuzzing, los invariantes, el análisis estático y la verificación simbólica del repositorio. Las etapas siguientes figuran en el [roadmap](../roadmap.md).

## Qué acreditan los informes históricos

El informe Sepolia describe el despliegue de una versión anterior, verificaciones de runtimes y conexiones, compras y ventas de aceptación, una colocación de muro y controles de rechazo de acciones inelegibles.

Estas pruebas pertenecen a esa versión. No prueban la banda, ni los muros creados en cada venta, ni el nuevo vault.

En la revisión histórica `991fca9`, la suite Solidity completa contaba con **133 pruebas superadas y 15 fallidas de un total de 148**. Estos resultados y sus límites figuran en el informe del estado publicado. No son contadores de validación de la nueva versión.

## Qué no constituye una validación completa

Una compilación correcta verifica la producción de bytecode. Por sí sola, no demuestra los invariantes contables, el comportamiento de un conjunto de muros atravesados, la coherencia del frontend ni una transacción en la red elegida.

Del mismo modo, comparar hashes de runtimes no significa que las fuentes se hayan publicado en un explorador. Las pruebas automatizadas del frontend no sustituyen pruebas de aceptación con una cartera real de navegador o móvil.

Una validación completa de la nueva versión abarca también la separación de cuentas, la ausencia de sobreextracción del vault, la llegada a la reserva de los CUBIT de los muros vaciados y la imposibilidad de que un actor extraiga los ETH de los muros a un tipo de cambio favorable.

## Qué fuente seguir

Para la nueva versión, la referencia es el documento de traspaso `contracts/docs/REDESIGN_HANDOFF.md` de la rama `redesign/tide-lp-autowalls-vault`. Recoge las decisiones fijadas y su implementación en el código.

Para el historial, el punto de partida sigue siendo el informe francés de la revisión `991fca9`. Los manifiestos públicos de `contracts/deployments/` identifican los despliegues existentes.

La [página Fuentes](../sources.md) precisa el orden de lectura y los documentos que se han vuelto históricos.
