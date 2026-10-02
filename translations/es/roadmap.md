---
description: "Las etapas del rediseño, los próximos lanzamientos CUBIT, sus ventanas y las condiciones de validación."
section: "05 / VERIFICAR"
reading: "5 MIN DE LECTURA"
search:
  keywords: ["roadmap", "calendario", "apertura", "V1", "V2", "rediseño", "etapas", "launchpad"]
---

# Roadmap y condiciones de lanzamiento

El calendario describe una intención de publicación. **La cadencia de lanzamientos no sustituye la validación del código.** Una función que mueve fondos debe prepararse, probarse y aceptarse antes de abrirse.

Las referencias `roadmapdev.md` y el antiguo roadmap del dapp contienen reglas obsoletas. Esta página retoma los hitos distinguiendo el trabajo decidido, el código escrito y las versiones ya acreditadas.

## El requisito previo actual

El protocolo está en pleno rediseño: **una banda de liquidez única** sustituye al ladder, **los muros se colocan y se vacían en cada venta** y el vault paga una recompensa en CUBIT desde una reserva. La FDV de lanzamiento elegida es de **3,75 ETH**.

Esta nueva versión está desplegada en la red principal Ethereum, mercado abierto desde el 22 de septiembre de 2026. El despliegue Sepolia sirve para las pruebas.

## Las etapas del rediseño

| Etapa | Contenido | Estado |
| --- | --- | --- |
| 1 | Banda amplia en el lanzamiento; retirada del ladder, de `rebalance`, de `raiseFloor` y de los keepers | Programada y probada en local |
| Vaults | Vault al 3% diario en CUBIT y vault de gobernanza del launchpad | Programados y probados en local |
| 2 | Muros creados en cada venta; CUBIT de los muros atravesados hacia el vault; tokens de los hijos hacia el vault de gobernanza | Programada y probada en local |
| 3 | Limpieza: retirada del flujo WETH, de la pausa y del guardian, y de los errores sin uso | Programada y probada en local |
| 4 | Lanzamiento en una transacción: 80% en la banda, 20% en la reserva del vault, compra de 0,1 ETH | Programada y probada en local |
| 5 | Reescritura de las pruebas y de los invariantes | Todavía no realizada |

## Los hitos

| Hito | Función | Estado y condición |
| --- | --- | --- |
| D0 | Mercado V1 | Nueva versión desplegada en Ethereum, mercado abierto el 22 de septiembre de 2026 en el bloque 26 035 793 |
| 23 de septiembre de 2026 | Momentum | Abierto: página de la app de solo lectura con los muros activos, parcialmente consumidos y atravesados de cada token |
| 23 de septiembre de 2026 | Forge pública | Abierta: launchpad abierto a todos, añadido ese día con su vault de gobernanza, comisión de lanzamiento de 0,005 ETH |
| 26 de septiembre de 2026 | mCUBIT Vault | Abierto: bloqueo de 24 h, recompensa del 3% diario en CUBIT desde la reserva |
| Por definir | Token del launchpad | Todavía no diseñado; los activos del vault de gobernanza le servirán de NAV |

Ninguna función se abre sola: el equipo abrió Momentum y la Forge el 23 de septiembre de 2026 y, después, el Vault el 26 de septiembre de 2026, mediante transacciones explícitas. La administración de los módulos por parte de la dirección del equipo es permanente.

## Condiciones para el Vault

La contabilidad de recompensas debe resistir depósitos, retiradas, reclamaciones, el tope de un día, redondeos y sustituciones, sin crear CUBIT, sin pagos desde el principal y sin acceso a los fondos de los muros. La reserva se alimenta en el lanzamiento y, después, con los muros atravesados.

## Condiciones para Momentum y Forge

Momentum sigue siendo de solo lectura: los muros activos, parcialmente consumidos y atravesados de cada token. La Forge debe mantener el aislamiento de los hijos y el control de la plantilla; el envío de los tokens de sus muros al vault de gobernanza está en servicio en Ethereum desde el 23 de septiembre de 2026. Nada se abre con el paso del tiempo: el equipo añadió el launchpad y después lo abrió, mediante transacciones explícitas.

## Condiciones para una versión de producción

La versión debe publicar sus identidades, parámetros de compilación, bibliotecas vinculadas, bytecodes esperados y permisos. Las pruebas deben cubrir las fuentes finales y estar vinculadas a esa versión.

La adaptación del dapp, incluida la división de las ventas que atraviesan muchos muros, los recorridos de carteras reales, los agregadores, los servicios y la supervisión complementan las pruebas locales. Un despliegue no constituye una aceptación automática de estos cambios nuevos.

## Los anuncios históricos que deben reclasificarse

Un “floor que solo sube”, un cruce del punto de equilibrio a una capitalización predeterminada, un token “deflacionario” por la quema de los muros o una “inmutabilidad total” no describen la nueva versión y sus permisos.

Las comunicaciones deben indicar el muro financiado, su objetivo, los fondos colocados y la versión del protocolo. Los resultados históricos siguen disponibles como tales en las [fuentes](sources.md).
