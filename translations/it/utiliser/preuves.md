---
description: "Distinguere mercato, banda, obiettivo, muri, fondi in attesa e dati on-chain nella dashboard CUBIT."
section: "02 / USARE"
reading: "4 MIN DI LETTURA"
search:
  keywords: ["proof", "prove", "dashboard", "dati", "dati", "floor", "simulazione", "profondità", "banda"]
---

# Leggere i dati della dapp

La pagina Proof serve a riconciliare le cifre mostrate con gli stati e gli eventi del protocollo. Inizia da **rete, deployment, versione e blocco di lettura** prima di interpretare un importo.

> La dapp pubblica legge il deployment Ethereum in servizio e la sua ABI. I dati seguenti descrivono ciò che un’interfaccia deve distinguere.

## Le cifre da distinguere

| Dato | Cosa descrive |
| --- | --- |
| Prezzo di mercato | Prezzo corrente del pool, distinto dal risultato netto per una quantità precisa |
| ETH della banda | ETH realmente detenuti dalla banda al prezzo corrente, apportati dagli acquirenti |
| CUBIT della banda | CUBIT che la banda offre ancora all’acquisto |
| Obiettivo del prossimo muro | Livello calcolato con il prezzo corrente, distinto da una posizione finanziata |
| Muri attivi | Posizioni già finanziate, ciascuna con ID, tick e liquidità residua |
| ETH in attesa | Fondi dei muri rimasti non collocati: polvere troppo piccola per creare una posizione, o prezzo in cima all’intervallo di tick |
| CUBIT in attesa di invio | CUBIT dei muri attraversati, isolati nell’hook fino al loro invio al vault |
| Riserva di ricompense | CUBIT detenuti dal vault per pagare i depositanti, distinti dai depositi |
| Offerta in circolazione | Offerta totale meno i CUBIT dei muri, quelli in attesa di invio e la riserva di ricompense dei vault; i CUBIT depositati nel vault restano in circolazione |

Il livello di un muro e gli ETH rimasti vanno letti insieme. Gli ETH della banda e quelli dei muri appartengono a due libri distinti.

## Cosa cambia con la nuova versione

La vecchia vista presentava un ladder, un cushion, una coda di burn e una schermata di manutenzione. La nuova versione li sostituisce con un’unica banda, muri collocati e svuotati a ogni vendita e una riserva di ricompense nel vault. Non esiste più una pagina Keepers.

Il nome storico `floorPrice` descrive l’ultimo muro finanziato: non va letto come un minimo globale del mercato. Un nuovo muro può essere collocato più in basso del precedente quando il prezzo è sceso.

I nuovi campi sono descritti nell’[integrazione](../developper/integration.md). La dapp collegata a Ethereum legge i campi della versione attuale.

## Prezzo lordo, prezzo netto e quotazione

Un riferimento lordo rappresenta un livello di prezzo della posizione. Un riferimento netto può includere un limite dell’intervallo, le commissioni LP, la tassa di vendita e un’ipotesi sulle commissioni di protocollo v4.

La vendita reale dipende dalla quantità, dalle posizioni attraversate, dagli arrotondamenti e dal gas. Un riferimento “net floor” non calcola il rendimento del tuo wallet e non sostituisce una quotazione.

## Le modalità dei dati

| Visualizzazione | Interpretazione |
| --- | --- |
| On-chain, blocco identificato | Dati letti sul deployment indicato |
| Caricamento | Prima lettura ancora incompleta |
| Dati obsoleti o RPC non funzionante | Ultimo stato noto; non è un’autorizzazione a firmare |
| Simulazione o dimostrazione | Illustrazione locale del meccanismo |

Per i rilasci futuri, verifica la disponibilità annunciata e gli indirizzi dei moduli proposti all’utente.

## Ripetere la verifica

Verifica le identità di token, hook e pool, poi i moduli correnti del registro e la sua `moduleRevision`. Riconcilia gli eventi con l’hash della transazione e il loro blocco canonico.

La pagina Proof permette di seguire tasse e muri. Uno screenshot o un vecchio rapporto non sostituisce questa identificazione della versione. [Stato reale delle versioni](../securite/etat.md).

<p class="source-note">Fonti: <code>CubitLens.sol</code>, <code>interfaces/ICubitLens.sol</code> e, per il frontend, <code>dapp/src/chain/snapshot.ts</code>, <code>releases.ts</code> e <code>events.ts</code>.</p>
