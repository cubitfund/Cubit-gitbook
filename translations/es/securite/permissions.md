---
description: "Las identidades fijas del núcleo, la ausencia de administrador del hook y los poderes permanentes de la dirección del equipo sobre los módulos del registro."
section: "05 / VERIFICAR"
reading: "5 MIN DE LECTURA"
search:
  keywords: ["permisos", "equipo", "setters", "sustitución", "administrador", "authority", "admin", "gobernanza"]
---

# Permisos y sustituciones

CUBIT distingue un núcleo de identidades fijas, sin administrador, y una dirección del equipo que administra los módulos periféricos. **Los poderes de la dirección del equipo son permanentes.**

## Qué permanece fijo

El token, el hook principal, el PoolManager, el poolId y el anclaje del registro no se sustituyen mediante los setters periféricos.

El token autoriza a su hook mediante una conexión única. Las tasas del núcleo, la FDV de lanzamiento y la geometría de la banda no tienen setter, y la banda nunca se retira una vez colocada. Una política nueva que modifique el núcleo exige una versión nueva, su validación y despliegue; no actualiza automáticamente un pool antiguo.

## Ningún administrador del hook

El hook no tiene **ningún administrador**, y nadie puede poner en pausa los swaps ni el mecanismo de los muros.

Por tanto, ninguna dirección puede suspender una venta ni la colocación de un muro. Las reglas del hook se aplican tal como se desplegaron.

## El papel del equipo

La dirección del equipo, `TEAM_ADDRESS`, está fijada en el hook y actúa como `authority()` del registro `CubitV2`. Sus poderes son permanentes: recibe la parte del equipo de las tasas, un 3% en la compra y un 3% en la venta, y sustituye y después activa los módulos del registro. Puede sustituir el Vault, el router, el Lens o la Forge **en cualquier momento e inmediatamente**, sin plazo de aviso. Las cuatro direcciones sustituibles son:

| Setter | Principales controles de conexión | Consecuencia |
| --- | --- | --- |
| `setVault(next)` | Código presente, mismo hook y mismo token, Vault nuevo sin stake | Nuevo contrato de referencia para futuros depósitos y para los CUBIT absorbidos enviados después |
| `setRouter(next)` | Código presente, mismo hook/PoolManager/poolId | Router actual sustituido: el que usa la dapp |
| `setLens(next)` | Código presente, mismo hook/PoolManager/poolId/token | Contrato de lectura actual sustituido |
| `setForge(next)` | Código presente, mismo hook, vault de gobernanza con código | Launchpad de referencia, ausente en el lanzamiento, registrado o sustituido para futuros lanzamientos, junto con el vault de gobernanza que recibe sus comisiones |

Cada cambio emite `ModuleUpdated`, incrementa `moduleRevision` y cierra la funcionalidad correspondiente hasta que el equipo la vuelva a abrir: sustituir el Vault, el Lens o la Forge cierra, respectivamente, el Vault, Momentum o la Forge; sustituir el router no cierra ninguna funcionalidad. Comprueba la nueva dirección y su código antes de una operación.

## El alcance de una sustitución

Una sustitución surte efecto en su propia transacción. Permite elegir:

- adónde van los CUBIT absorbidos por los muros de CUBIT en los envíos siguientes: el hook los entrega al Vault registrado;
- adónde van las futuras comisiones de lanzamiento: la Forge registrada las paga a su propio vault de gobernanza;
- qué router usa la dapp.

No toca:

- el núcleo: token, hook, banda, muros y tasas;
- los saldos ya presentes en los vaults existentes, principal y reserva de recompensas.

El equipo protege la clave privada de esta dirección.

## Los límites de los controles de compatibilidad

Los getters que declaran las direcciones correctas demuestran la conexión esperada, no la seguridad de todo el código candidato. No prueban la ausencia de proxy ni de comportamiento malicioso en una implementación futura.

Por tanto, el equipo elige el código periférico utilizado para las operaciones futuras. Esta capacidad exige verificar cada sustitución, su bytecode y sus interacciones.

## Los fondos ya depositados

Sustituir un Vault no transfiere ni los CUBIT depositados ni la reserva de recompensas del contrato antiguo. Sus posiciones, plazos y salidas permanecen en ese Vault antiguo. El registro conserva la lista de Vaults y el frontend debe seguir exponiendo esas posiciones.

Un router antiguo sigue pudiendo usarse para intercambiar y sigue sujeto a las tasas del hook; una autorización concedida al router antiguo no vale para el nuevo.

Sustituir Forge afecta a los lanzamientos futuros; los hijos ya creados conservan sus contratos y el vault de gobernanza de la Forge que los lanzó.

Estos setters no reparan retroactivamente un contrato defectuoso ni mueven fondos que pueda mantener. La posibilidad de llamar a una salida on-chain y su disponibilidad en el frontend deben comprobarse por separado.

## El vault de gobernanza del launchpad

El vault de gobernanza no tiene administrador ni salida anticipada. Recibe las comisiones de lanzamiento en ETH y los tokens absorbidos por los muros de los hijos: cada depósito queda bloqueado allí 30 días a partir de su recepción y, después, **solo su desplegador** puede reclamarlo. Este derecho vale para siempre y ninguna función permite transferirlo: supone una confianza explícita en esa cuenta. Ese desplegador puede extender el bloqueo de todo el vault, depósitos presentes y futuros, cuando quiera; ninguna función lo acorta.

## Autorizaciones y firmas

Una autorización está vinculada a un **spender concreto**. No sigue la dirección actual del registro. El frontend debe revalidar la operación cuando cambian la revisión o los módulos, especialmente entre una autorización y un swap.

Cada acción del protocolo es una transacción: comprueba su dirección de destino y la cadena antes de firmarla.

<p class="source-note">Fuentes: <code>CubitV2.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>contracts/docs/MODULE_SETTERS.md</code> y los controles del frontend <code>releases.ts</code> / <code>vault.ts</code>.</p>
