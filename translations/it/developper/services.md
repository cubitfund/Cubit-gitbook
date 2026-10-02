---
description: "Gestire il relay degli eventi: dry-run, cursori, revisioni dei moduli e vocabolario dei muri; il keeper non ha più alcuna utilità."
section: "04 / SVILUPPARE"
reading: "4 MIN DI LETTURA"
---

# Servizi e gestione operativa

Il repository contiene due processi Node: un **keeper**, che appartiene al vecchio modello, e un **relay degli eventi** che può preparare pubblicazioni. Una configurazione locale non prova che un servizio sia operativo in modo continuo.

## Niente più keeper nella nuova versione

Il vecchio keeper chiamava `rebalance`, `raiseFloor` e il burn dei token assorbiti. Queste funzioni di manutenzione sono scomparse: la banda non viene mai riorganizzata, i muri vengono collocati e svuotati durante le vendite e il router CUBIT invia i CUBIT assorbiti al vault.

Il servizio `services/keeper` resta nel repository, ma non ha più ragion d’essere e non va messo in esercizio sulla nuova versione. Nessun premio viene versato: se dei CUBIT assorbiti restano in attesa, per esempio dopo una vendita passata per un altro router, qualunque account può chiamare `deliverAbsorbed()`.

## Il relay degli eventi

`services/floor-bot` legge gli eventi, prepara un testo e conserva un cursore insieme alle chiavi di deduplicazione `transactionHash:logIndex`.

Le modalità dry-run e pubblicazione hanno stati separati. I cursori includono il contesto di catena e hook; sui network previsti dal servizio si usano blocchi finalizzati. Una riorganizzazione o un checkpoint incoerente va riconciliato prima della ripresa.

Il relay salva un `pendingPost` prima della pubblicazione. Se il servizio esterno accetta il messaggio ma il processo si arresta prima di registrare il successo, bisogna verificare che il messaggio esista prima di riprovare: un database locale e un social network non possono effettuare un commit insieme.

Il GitBook non esegue pubblicazioni. La messa in funzione reale del relay richiede configurazione e autorizzazione operative distinte.

## Evoluzione dei moduli

Il Lens corrente viene risolto dal registro. Conserva l’identità del nucleo e il contesto della revisione durante tutta l’operazione.

I servizi leggono le ABI e gli eventi della versione descritta. Un relay adattato al vecchio modello non va presentato come validato per la nuova versione senza il relativo collaudo.

## Adattare il vocabolario ai muri

Il vecchio relay annunciava eventi `FloorRaised`, che non esistono più. Nella nuova versione, un muro può essere creato o ispessito a ogni vendita (`WallFunded`), talvolta a un prezzo inferiore al muro precedente, e un muro interamente attraversato viene svuotato (`WallAbsorbed`) prima che i suoi CUBIT vadano alla riserva del vault (`AbsorbedDelivered`).

Il relay deve quindi citare il **muro interessato, il suo livello e i fondi aggiunti o assorbiti**, senza dedurre un aumento globale dal nome di un evento. I vecchi messaggi “il floor sale sempre” non descrivono questa politica, e nessun annuncio deve presentare i muri come una garanzia di prezzo.

## Controlli operativi utili

Segui errori RPC, scostamenti di configurazione, cursori, età dell’ultimo blocco elaborato e pubblicazioni in attesa. Conserva i registri di ripristino e le identità di versione, senza dati privati di firma.

Una supervisione che riavvia i processi non sostituisce la risoluzione di un checkpoint incoerente o di un cambio di registro.

<p class="source-note">Fonti: <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> e <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
