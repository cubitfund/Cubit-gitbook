---
description: "Momentum ofrece una vista de solo lectura del mercado. La Forge es un launchpad público; sus comisiones de lanzamiento y los tokens absorbidos por los muros de los hijos pasan al vault de gobernanza del launchpad."
section: "03 / MÓDULOS V2"
reading: "5 MIN DE LECTURA"
search:
  keywords: ["momentum", "forge", "hijo", "launchpad", "público", "gobernanza", "NAV", "bloqueo", "30 días", "extensión"]
---

# Momentum y Forge

Estos dos módulos tienen funciones distintas: **Momentum hace visible el estado del mercado**, mientras que **la Forge permite a cualquiera lanzar un mercado hijo aislado**.

## Momentum: observar el mercado

Momentum es una página de la app: para cada token muestra los muros activos, los muros parcialmente consumidos y el historial de muros atravesados, a partir de los eventos del hook y de las lecturas del Lens. Está abierta desde el 23 de septiembre de 2026.

Es una función **de solo lectura**, sin poder para retirar ETH de los muros ni modificar las reglas del núcleo. Un cambio de visualización no es una orden de negociación.

La geometría realmente utilizada sigue siendo la del hook. No puede inventarla un componente del frontend.

## Forge: un launchpad público

La Forge está **abierta a todos**: cualquier cuenta lanza un mercado hijo pagando la comisión de lanzamiento exacta. No formaba parte del lanzamiento de CUBIT: el equipo la añadió el 23 de septiembre de 2026, con su vault de gobernanza, y la abrió el mismo día.

Cada hijo recibe su token, su hook, sus identidades de pool y sus propias reservas. La plantilla de creación del hook está controlada por un hash fijado en el constructor de Forge. Los salts de despliegue están ligados a quien lanza: dos lanzamientos del mismo bloque no se invalidan entre sí, y copiar los salts de otra cuenta no permite quedarse con su lanzamiento.

Un hijo **deposita el 100% de su oferta en su banda**. No tiene reserva de vault ni asignación al equipo. Se comprueban el nombre, el símbolo, la dirección del equipo, el salt de despliegue y el código aportado. Como el del padre, el hook de un hijo no tiene ningún administrador. Crear un hijo no concede permisos sobre el pool CUBIT padre. Los parámetros son impuestos: la misma valoración de lanzamiento, la misma oferta y las mismas tasas para cada hijo.

## El vault de gobernanza del launchpad

El **vault de gobernanza del launchpad** recibe las comisiones de lanzamiento de la Forge, en ETH, y los tokens absorbidos por los muros de los hijos, que no van al vault de staking del padre:

- cada depósito queda bloqueado allí **30 días a partir de su contabilización**, más la eventual extensión: es inmediata para un depósito, una comisión de lanzamiento o una entrega de un hijo, y solo se produce al llamar a `lockUntracked` para tokens enviados directamente al vault;
- **el desplegador puede extender el bloqueo** de todo el vault, depósitos presentes y futuros, tokens y ETH, con `extendLock`, cuando quiera; ninguna función acorta un bloqueo;
- por ejemplo, 10 tokens recibidos cada día durante 7 días salen en 7 lotes, uno por día, el último al cabo de 1 mes y 7 días;
- **solo el desplegador** de ese vault puede reclamar los lotes desbloqueados, para siempre: ninguna función permite transferir este derecho;
- sus activos están destinados a servir de referencia de valor, o NAV, para el token del launchpad.

La Forge recibe la dirección de este vault en su construcción, en `governanceVault`. El hook de un hijo la encuentra a través de la Forge que desplegó su token y, después, `deliverAbsorbed()` transfiere allí los tokens de los muros vaciados y los bloquea con `lockUntracked`.

## La comisión de lanzamiento

Cada lanzamiento paga su comisión al vault de gobernanza del launchpad, en ETH, mediante `depositEth()` y en la misma transacción. La comisión pasa entonces a pertenecer a la gobernanza: **quien lanza no la recupera nunca** y **solo el desplegador** del vault puede reclamarla con `claim`. La comisión no financia los muros de CUBIT. Como todo depósito recibido por este vault, sigue después la regla de bloqueo descrita más arriba.

El importe de `launchFee()` se fija al construir cada Forge: vale **0,005 ETH**, es decir 5 × 10^15 wei, y es inmutable. Cambiar la comisión exige, por tanto, una nueva Forge; lee siempre el importe on-chain del contrato realmente utilizado.

## Si se sustituye Forge

El equipo puede sustituir la Forge en cualquier momento, sin demora. La sustitución cambia la factory de referencia para futuros lanzamientos y, con ella, el vault de gobernanza que recibe sus comisiones; desactiva la Forge hasta su reactivación. Los hijos ya creados conservan sus propios contratos y fondos. Un launchpad v2 puede así fijar otros parámetros para sus propios lanzamientos.

Las comprobaciones de compatibilidad del registro no sustituyen una revisión de la plantilla y la factory.

## Un launchpad v2

Los parámetros de los hijos los impone la Forge registrada. Una Forge de sustitución, un launchpad v2, puede fijar otros; el equipo la abre cuando lo decide.

Los hijos ya lanzados siguen funcionando en sus propios pools, y los tokens absorbidos por sus muros siguen yendo al vault de gobernanza de la Forge que los lanzó.

<p class="source-note">Fuentes: decisiones de diseño del 14 y 15 de septiembre de 2026, <code>periphery/CubitForge.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>CubitHook.absorbedTokenSink</code>, <code>CubitV2.setForge</code> y <code>dapp/src/pages/Momentum.tsx</code>.</p>
