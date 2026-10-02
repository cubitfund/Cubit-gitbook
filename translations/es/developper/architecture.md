---
description: "Mapa del código CUBIT: contratos, banda y muros, vaults, dapp y servicios."
section: "04 / CONSTRUIR"
reading: "6 MIN DE LECTURA"
---

# Arquitectura y base de código

El repositorio reúne contratos Solidity, un dapp React/Vite y dos servicios Node. Este GitBook es autónomo en `gitbook/`: su build no lee configuración privada ni datos de red del protocolo.

> La versión descrita aquí se encuentra en la rama `redesign/tide-lp-autowalls-vault`.

## Los directorios

| Directorio | Responsabilidad |
| --- | --- |
| `contracts/src` | Token, hook, bibliotecas, interfaces y contratos periféricos |
| `contracts/test` | Pruebas Foundry históricas sobre la antigua API; pruebas de la nueva versión en `test/redesign` |
| `contracts/audit` | Arneses y campañas de verificación complementarios |
| `contracts/script` | Scripts Foundry de despliegue y escenarios reproducibles en un nodo local |
| `contracts/scripts` | Exportación ABI, controles y procedimientos de despliegue |
| `contracts/deployments` | Manifiestos públicos de versiones e historial |
| `dapp/src/chain` | Configuración, ABI, lecturas, cotizaciones y transacciones |
| `dapp/src/pages` | Swap, Proof, Staking, roadmap y módulos V2 |
| `services/shared` | Configuración compartida, clientes, ABI y seguimiento de ejecución |
| `services/keeper` | Servicio del antiguo mantenimiento, sin uso en la nueva versión |
| `services/floor-bot` | Lectura de eventos y preparación de publicaciones |
| `audit/reports` | Informes fechados y pruebas vinculadas a revisiones |
| `gitbook/docs` | Fuentes francesas de esta documentación |

## Los contratos del núcleo

| Componente | Responsabilidad |
| --- | --- |
| `CubitToken` | ERC-20 con emisión inicial única de 21 M; quema autorizada solo al hook |
| `CubitHook` | Tasas, banda de liquidez, colocación y vaciado de los muros, cuentas del equipo, conexión V2 |
| `BandLib` | Precios, conversiones y redondeos a ticks, objetivo de los muros |
| `WallLib` | Muros por tick: identificador permanente, índice de los muros activos, financiación y vaciado de los muros atravesados |
| `PoolManager` v4 | Estado del pool, posiciones de liquidez, swaps y liquidación |

El hook es el único proveedor de liquidez del pool CUBIT: se rechaza cualquier otra aportación de liquidez. Los fondos se siguen en las posiciones y mediante claims ERC-6909 del PoolManager; por tanto, el saldo de ETH nativo de la dirección del hook no basta para medir las reservas.

La banda es una posición única identificada por `BAND_SALT`. Cada muro ocupa una celda de `tickSpacing` bajo su propio salt. `WallLib` trabaja sobre el almacenamiento del hook: los claims y las posiciones siguen asignados al hook.

## Los contratos periféricos

| Componente | Responsabilidad |
| --- | --- |
| `CubitRouter` | Swaps exact-input/output, límite de slippage, fecha límite, liquidación y envío de los CUBIT absorbidos después de cada venta |
| `CubitLens` | Vistas derivadas: mercado, banda, muros, cuentas, oferta en circulación, CUBIT en manos de los holders y mejor muro |
| `CubitV2` | Registro estable de módulos, revisión e historial de los vaults |
| `CubitVault` | Depósitos CUBIT, bloqueo de 24 h y recompensa en CUBIT pagada por una reserva |
| `CubitGovernanceVault` | Vault de gobernanza del launchpad: comisiones de lanzamiento en ETH y tokens de los muros de los hijos, bloqueados 30 días por depósito, más la eventual extensión; reclamación y extensión reservadas para siempre al desplegador |
| `CubitForge` | Launchpad público de mercados hijos aislados, añadido después del lanzamiento; comisión de lanzamiento de 0,005 ETH pagada al vault de gobernanza, cuya dirección se fija en la construcción |
| `CubitLaunch` | Lanzamiento en una sola transacción: 80% de la oferta en la banda, 20% en la reserva del vault y compra del desplegador |

La dirección del equipo puede sustituir Router, Lens, Vault y Forge en el registro en cualquier momento, sin demora, y después activarlos; estos poderes son permanentes, y cada sustitución desactiva la funcionalidad correspondiente hasta su reactivación. El token, el hook, las identidades del pool y el anclaje del registro no siguen este mecanismo de sustitución, y el hook no tiene ningún administrador: nadie puede poner en pausa los swaps ni el mecanismo de los muros.

## El recorrido de una lectura

```text
Frontend o servicio
    → manifiesto público: red, núcleo, registro
    → registro en un bloque dado: módulos + revisión
    → comprobación de conexiones de los módulos
    → Lens y vistas del hook en ese mismo bloque
    → visualización o simulación de una acción
```

En el frontend, `releases.ts` resuelve los módulos y `vault.ts` conserva la lectura de los Vaults antiguos. La falta de respuesta RPC no debe autorizar una firma. La capa de datos del dapp lee la ABI de la versión en servicio.

## El recorrido de un swap

El frontend obtiene una cotización y después una simulación. El router abre el contexto de liquidación del PoolManager; el hook aplica las tasas sobre el tramo ETH, y el swap sigue la curva de la banda y de los muros atravesados. Después, el router liquida los deltas.

En cada venta, en `afterSwap`, el hook vacía los muros totalmente atravesados y, después, coloca los ETH pendientes en un muro en el objetivo calculado sobre el precio después de la venta, o un 1% por debajo del precio actual cuando ese objetivo no está por debajo del mercado, en el precio de lanzamiento o por debajo. Al final de la venta, el router CUBIT llama a `deliverAbsorbed()` para enviar los CUBIT absorbidos a la reserva del vault; un fallo de este envío no bloquea la venta.

Las fronteras importan: el callback del router solo es accesible al PoolManager durante la operación esperada, y el payer procede del llamante autenticado del router.

## Qué ha cambiado la nueva versión

La banda sustituye al ladder, y se suprimen `rebalance`, `raiseFloor`, el sweep y las recompensas. Los muros se colocan y se vacían durante las ventas, y los CUBIT de los muros atravesados pasan a la reserva del vault en lugar de quemarse.

La suite histórica `contracts/test` utiliza la antigua API y no compila con la nueva versión; las pruebas de la nueva versión se encuentran en `test/redesign`. Las próximas etapas figuran en el [roadmap](../roadmap.md), y los componentes probados, en el [estado de las versiones](../securite/etat.md).

<p class="source-note">Fuentes: archivos citados del repositorio, especialmente <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> y los README de los servicios.</p>
