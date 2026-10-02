---
description: "Le fasi della riprogettazione, i prossimi rilasci CUBIT, le relative finestre e le condizioni di validazione."
section: "05 / VERIFICARE"
reading: "5 MIN DI LETTURA"
search:
  keywords: ["roadmap", "calendario", "apertura", "V1", "V2", "riprogettazione", "fasi", "fasi", "launchpad"]
---

# Roadmap e condizioni di rilascio

Il calendario descrive un’intenzione di pubblicazione. **La cadenza dei rilasci non sostituisce la validazione del codice.** Una funzionalità che sposta fondi deve essere preparata, testata e accettata prima dell’apertura.

I riferimenti `roadmapdev.md` e la precedente roadmap della dapp contengono regole superate. Questa pagina riprende le tappe distinguendo il lavoro deciso, il codice scritto e le versioni già attestate.

## Il prerequisito attuale

Il protocollo è in corso di riprogettazione: **un’unica banda di liquidità** sostituisce il ladder, **i muri vengono collocati e svuotati a ogni vendita** e il vault versa una ricompensa in CUBIT da una riserva. La FDV di lancio scelta è di **3,75 ETH**.

Questa nuova versione è distribuita sulla rete principale Ethereum, mercato aperto dal 22 settembre 2026. Il deployment Sepolia serve per i test.

## Le fasi della riprogettazione

| Fase | Contenuto | Stato |
| --- | --- | --- |
| 1 | Banda ampia al lancio; rimozione del ladder, di `rebalance`, di `raiseFloor` e dei keeper | Implementata e testata in locale |
| Vault | Vault al 3% al giorno in CUBIT e vault di governance del launchpad | Implementati e testati in locale |
| 2 | Muri creati a ogni vendita; CUBIT dei muri attraversati verso il vault; token dei figli verso il vault di governance | Implementata e testata in locale |
| 3 | Pulizia: rimozione del flusso WETH, della pausa e del guardian, e degli errori inutilizzati | Implementata e testata in locale |
| 4 | Lancio in una transazione: 80% nella banda, 20% nella riserva del vault, acquisto di 0,1 ETH | Implementata e testata in locale |
| 5 | Riscrittura dei test e degli invarianti | Non ancora eseguita |

## Le tappe

| Tappa | Funzione | Stato e condizione |
| --- | --- | --- |
| G0 | Mercato V1 | Nuova versione distribuita su Ethereum, mercato aperto il 22 settembre 2026 al blocco 26.035.793 |
| 23 settembre 2026 | Momentum | Aperto: pagina dell’app in sola lettura con i muri attivi, parzialmente consumati e attraversati di ogni token |
| 23 settembre 2026 | Forge pubblica | Aperta: launchpad aperto a tutti, aggiunto quel giorno con il suo vault di governance, commissione di lancio di 0,005 ETH |
| 26 settembre 2026 | mCUBIT Vault | Aperto: blocco di 24 ore, ricompensa del 3% al giorno in CUBIT dalla riserva |
| Da definire | Token del launchpad | Non ancora progettato; le disponibilità del vault di governance gli serviranno da NAV |

Nessuna funzionalità si apre da sola: il team ha aperto Momentum e la Forge il 23 settembre 2026, poi il Vault il 26 settembre 2026, con transazioni esplicite. L’amministrazione dei moduli da parte dell’indirizzo del team è permanente.

## Condizioni per il Vault

La contabilità delle ricompense deve reggere a depositi, prelievi, riscossioni, tetto di un giorno, arrotondamenti e sostituzioni, con zero creazione di CUBIT, nessun pagamento dal capitale e nessun accesso ai fondi dei muri. La riserva è alimentata al lancio, poi dai muri attraversati.

## Condizioni per Momentum e Forge

Momentum resta di sola lettura: i muri attivi, parzialmente consumati e attraversati di ogni token. La Forge deve conservare l’isolamento dei figli e il controllo del template; l’invio dei token dei loro muri al vault di governance è in servizio su Ethereum dal 23 settembre 2026. Nulla si apre con il trascorrere del tempo: il team ha aggiunto il launchpad, poi lo ha aperto, con transazioni esplicite.

## Condizioni per una versione di produzione

La release deve pubblicare identità, parametri di compilazione, librerie collegate, bytecode attesi e permessi. I test devono riguardare le fonti finali ed essere collegati a quella release.

L’adattamento della dapp, compresa la suddivisione delle vendite che attraversano molti muri, i percorsi con wallet reali, gli aggregatori, i servizi e il monitoraggio completano i test locali. Un deployment non costituisce un’accettazione automatica di queste nuove modifiche.

## Gli annunci storici da riclassificare

Un “floor che sale soltanto”, il superamento del punto di pareggio a una capitalizzazione prestabilita, un token “deflazionistico” grazie al burn dei muri o un’“immutabilità totale” non descrivono la nuova versione e i suoi permessi.

Le comunicazioni devono indicare il muro finanziato, il suo obiettivo, i fondi collocati e la versione del protocollo. I risultati storici restano consultabili come tali nelle [fonti](sources.md).
