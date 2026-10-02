---
description: "Operar el retransmisor de eventos: dry-run, cursores, revisiones de módulos y vocabulario de los muros; el keeper ya no tiene uso."
section: "04 / CONSTRUIR"
reading: "4 MIN DE LECTURA"
---

# Servicios y operación

El repositorio contiene dos procesos Node: un **keeper**, que pertenece al modelo antiguo, y un **retransmisor de eventos** que puede preparar publicaciones. Una configuración local no prueba que un servicio funcione de forma continua.

## Ya no hay keeper en la nueva versión

El antiguo keeper llamaba a `rebalance`, `raiseFloor` y a la quema de los tokens absorbidos. Estas funciones de mantenimiento han desaparecido: la banda nunca se reorganiza, los muros se colocan y se vacían durante las ventas, y el router CUBIT envía los CUBIT absorbidos al vault.

El servicio `services/keeper` sigue en el repositorio, pero ya no tiene razón de ser y no debe operarse contra la nueva versión. No se paga ninguna recompensa: si quedan CUBIT absorbidos pendientes, por ejemplo después de una venta realizada a través de otro router, cualquier cuenta puede llamar a `deliverAbsorbed()`.

## El retransmisor de eventos

`services/floor-bot` lee los eventos, prepara un texto y conserva un cursor y las claves de deduplicación `transactionHash:logIndex`.

Los modos dry-run y publicación tienen estados separados. Los cursores incluyen el contexto de cadena y hook; se utilizan bloques finalizados en las redes previstas por el servicio. Una reorganización o un checkpoint incoherente debe conciliarse antes de reanudar.

El retransmisor persiste un `pendingPost` antes de publicar. Si el servicio externo acepta el mensaje pero el proceso se detiene antes de registrar el éxito, hay que verificar la existencia del mensaje antes de reintentar: una base local y una red social no pueden confirmar conjuntamente la operación.

El GitBook no publica mensajes. Poner en funcionamiento el retransmisor requiere configuración y autorización operativas separadas.

## Evolución de los módulos

El Lens actual se resuelve desde el registro. Conserva la identidad del núcleo y el contexto de revisión durante toda la operación.

Los servicios leen las ABI y los eventos de la versión descrita. Un retransmisor adaptado al modelo antiguo no debe presentarse como validado para la nueva versión sin sus pruebas de aceptación.

## Adaptar el vocabulario a los muros

El retransmisor antiguo anunciaba eventos `FloorRaised`, que ya no existen. En la nueva versión, un muro puede crearse o engrosarse en cada venta (`WallFunded`), a veces a un precio inferior al del muro anterior, y un muro totalmente atravesado se vacía (`WallAbsorbed`) antes de que sus CUBIT vayan a la reserva del vault (`AbsorbedDelivered`).

Por tanto, el retransmisor debe citar el **muro afectado, su nivel y los fondos añadidos o absorbidos**, sin deducir una subida global del nombre de un evento. Los mensajes antiguos de “el floor siempre sube” no describen esta política, y ningún anuncio debe presentar los muros como una garantía de precio.

## Controles operativos útiles

Sigue los errores RPC, las discrepancias de configuración, los cursores, la antigüedad del último bloque procesado y las publicaciones pendientes. Conserva los registros de recuperación y las identidades de versión, sin datos privados de firma.

Una supervisión que reinicia procesos no sustituye la resolución de un checkpoint incoherente ni de un cambio de registro.

<p class="source-note">Fuentes: <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> y <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
