---
description: "Limiti concreti: profondità finita della banda e dei muri, gas dei muri attraversati, riserva di ricompense, integrazioni, sostituzione dei moduli e prove di versione."
section: "05 / VERIFICARE"
reading: "5 MIN DI LETTURA"
search:
  keywords: ["sicurezza", "sicurezza", "rischi", "limiti", "perdite", "audit", "riserva", "riserva", "estrazione", "gas"]
---

# Rischi e limiti

La banda e i muri sono posizioni LP. La loro presenza definisce una liquidità disponibile, senza rendere il risultato di un’operazione indipendente dal prezzo, dalle commissioni o dallo stato del pool.

> I limiti seguenti non sono esaustivi. Il codice può contenere errori che i test non hanno rilevato.

## Prezzo ed esecuzione

La banda detiene soltanto gli ETH apportati dagli acquirenti: la sua profondità di 3 ETH al lancio è virtuale. Quando il prezzo torna al prezzo di lancio, contiene soltanto CUBIT. I muri, invece, contengono soltanto gli ETH che le vendite vi hanno collocato.

Mercato, obiettivo del prossimo muro, prezzo di un muro e importo netto ottenuto da una vendita sono dati distinti. Usa una quotazione per l’importo previsto. Una forte variazione tra quotazione ed esecuzione può provocare un rifiuto per il minimo ricevuto o il limite d’ingresso; tasse, commissioni del pool e gas restano costi reali.

## Muri e contabilità

Ogni muro attraversato costa circa 185 000 gas alla vendita che lo svuota. Poiché una transazione è limitata a 16 777 216 gas da EIP-7825, una vendita attraversa al massimo circa 88 muri: oltre, fallisce senza perdite e deve essere suddivisa in più vendite. Un invio non riuscito dei CUBIT assorbiti non blocca la vendita: restano isolati nell’hook e chiunque può rilanciare l’invio.

Nessuna prova pubblicata garantisce che un attore non possa estrarre gli ETH accumulati nei muri a un tasso favorevole, per esempio comprando presto e poi vendendo nei muri finanziati da altre vendite.

La separazione dei conti deve restare valida dopo acquisti, vendite, assorbimenti, ricompense e sostituzioni. La dimensione dei contratti, il linking delle librerie e i parametri di compilazione rientrano anch’essi nell’ambito della verifica.

## Vault e riserva

La ricompensa del 3% al giorno è pagata da una riserva finita: a questo ritmo la riserva può esaurirsi e i versamenti interrompersi. Una ricompensa non riscossa oltre un giorno va persa.

I CUBIT versati come ricompense sono negoziabili: la loro eventuale vendita pesa sul mercato come qualsiasi altra vendita. Le commissioni di lancio della Forge e i token dei muri dei figli sono destinati al vault di governance, di cui solo il deployer può riscuotere i lotti sbloccati, per sempre e senza trasferimento possibile.

## Integrazioni e moduli

Un router di terze parti non chiama necessariamente `deliverAbsorbed()` dopo una vendita: i CUBIT assorbiti restano allora in attesa fino a una chiamata pubblica. La compatibilità di un aggregatore va testata con le tasse dell’hook e la versione del pool.

I moduli sostituibili introducono fiducia nelle future decisioni del team: può sostituirli immediatamente, senza ritardo, e protegge la chiave privata del suo indirizzo. I controlli dei getter non dimostrano la sicurezza del codice scelto. Un nuovo indirizzo richiede una nuova revisione dell’approvazione o della firma.

L’hook non ha alcun amministratore: nessuno può mettere in pausa gli swap né il meccanismo dei muri, nemmeno in caso di incidente. L’indirizzo del team conserva invece poteri permanenti sui moduli del registro.

## Frontend e dati

Una visualizzazione può usare una simulazione, un vecchio manifest o dati obsoleti; la dapp attuale legge la versione in servizio. L’interfaccia deve identificare rete e blocchi, segnalare i guasti e impedire una firma a partire da un contesto diventato incoerente.

Le cifre in USD dipendono dalla conversione scelta: la FDV di lancio è fissata in ETH e non segue il dollaro.

## Cosa permettono di affermare i test

I test e le campagne di invarianti forniscono prove per i casi, gli stati e la revisione effettivamente esplorati. Le campagne storiche riguardano il vecchio modello e non validano la nuova versione. Una lunga campagna riuscita non è una prova formale generale.

Questa edizione non garantisce l’assenza di perdite. Lo [stato reale delle versioni](etat.md) dettaglia cosa è stato testato, e la [roadmap](../roadmap.md) le fasi successive.

<p class="source-note">Fonti: <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>CubitHook.sol</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code> e, per lo storico, <code>audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md</code>.</p>
