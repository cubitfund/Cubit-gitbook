---
description: "Depósito CUBIT intransferible, bloqueo de 24 h y recompensa del 3% al día en CUBIT, pagada únicamente por una reserva y limitada a un día."
section: "03 / MÓDULOS V2"
reading: "5 MIN DE LECTURA"
search:
  keywords: ["vault", "staking", "stake", "bloqueo", "lock", "retirada", "recompensa", "reserva", "claim", "mCUBIT"]
---

# mCUBIT Vault

El Vault permite depositar CUBIT en una posición **intransferible** y recibir una recompensa **en CUBIT**. Su modelo no crea CUBIT ni concede ningún derecho sobre los fondos de los muros.

El nombre mCUBIT designa esta experiencia de depósito; el código no crea un token de recibo ERC-20 libremente transferible.

> **Abierto en Ethereum desde el 26 de septiembre de 2026.**

## De dónde procede la recompensa

La recompensa se paga **únicamente desde la reserva de recompensas** del Vault, nunca desde el principal depositado. Esta reserva se alimenta con:

- el **20% de la oferta**, es decir, 4,2 millones de CUBIT, aportado en el lanzamiento;
- los **CUBIT de los muros totalmente atravesados**, enviados por `deliverAbsorbed()` después de las ventas;
- cualquier aportación voluntaria: cualquier cuenta puede añadir CUBIT a la reserva con `fundRewardReserve(amount)`.

La reserva es finita: cuando se vacía, las recompensas se detienen. **La recompensa es únicamente en CUBIT**, reclamada con `claimCubit()`, y no se garantiza ningún rendimiento.

## La tasa y su tope

La recompensa es del **3% del depósito al día**, calculada a prorrata del tiempo transcurrido desde la última reclamación.

El importe reclamable está **limitado a un día**: tras 24 horas sin reclamar, deja de aumentar. Para recibir la recompensa completa hay que reclamar cada día; **el excedente no reclamado se pierde**.

| Tiempo desde la última reclamación | Importe reclamable por 1 000 CUBIT depositados |
| --- | --- |
| 12 horas | 15 CUBIT |
| 24 horas | 30 CUBIT |
| 48 horas | 30 CUBIT: el segundo día se pierde |

Estos importes suponen una reserva suficiente. Si la reserva contiene menos que el importe debido, solo se paga su saldo.

## Depositar CUBIT

1. Comprueba la dirección del Vault ofrecido y su conexión al protocolo.
2. Autoriza al Vault a transferir el importe elegido.
3. Llama a `stake(amount)` y espera la confirmación.
4. Lee `balanceOf(account)`, `unlockAt(account)` y `pendingCubit(account)` en el contrato de depósito.

**Cada depósito adicional reinicia el bloqueo de 24 h de toda la posición de esa cartera en ese Vault.** También paga la recompensa acumulada hasta ese momento y reinicia el día de cómputo.

Los CUBIT depositados siguen siendo tokens existentes. Un depósito no es una quema ni una reducción de la oferta.

## Reclamar y retirar

`claimCubit()` paga la recompensa acumulada y reinicia el día de cómputo. El bloqueo de retirada no impide esta reclamación.

`withdraw(amount)` devuelve los CUBIT depositados cuando el timestamp de la cadena alcanza `unlockAt`. La retirada puede ser parcial; primero paga la recompensa acumulada.

Nadie puede suspender estas salidas. Siguen sujetas a las reglas y al funcionamiento correcto del contrato que mantiene la posición.

## Si se sustituye el Vault

El equipo puede sustituir el Vault en cualquier momento, sin demora. La sustitución afecta al contrato ofrecido para los depósitos nuevos y al que recibe los CUBIT absorbidos enviados después. **Los CUBIT depositados, la reserva de recompensas y las fechas de desbloqueo ya registrados permanecen en el Vault antiguo.** La sustitución no mueve los fondos del usuario.

El registro conserva la lista de los Vaults sucesivos. Comprueba la dirección seleccionada antes de leer un saldo, reclamar o retirar. Una autorización del Vault anterior no autoriza al nuevo.

El registro exige un Vault nuevo conectado al mismo hook y al mismo token, sin stake. La sustitución desactiva el Vault: el nuevo contrato solo acepta depósitos tras su reactivación.

## Los límites del módulo

La recompensa depende del saldo de la reserva: una tasa del 3% al día puede agotarla, y entonces los pagos se detienen. Los controles de sustitución verifican la compatibilidad declarada de las direcciones; no prueban la seguridad de todo código sustituto. La contabilidad de la reserva, el tope de un día, la llegada de los CUBIT de los muros y las salidas de los Vaults antiguos deben validarse en cada lanzamiento.

<p class="source-note">Fuentes: <code>periphery/CubitVault.sol</code> (<code>pendingCubit</code>, <code>claimCubit</code>, <code>fundRewardReserve</code>, <code>DAILY_REWARD_BPS</code>, <code>REWARD_PERIOD</code>, <code>LOCK_DURATION</code>), <code>CubitHook.deliverAbsorbed</code>, <code>CubitV2.setVault</code> y las decisiones de diseño del 14 de septiembre de 2026.</p>
