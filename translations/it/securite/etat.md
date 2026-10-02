---
description: "Stato al 26 settembre 2026: nuova versione distribuita su Ethereum, mercato aperto, Vault, Momentum e Forge aperti."
section: "05 / VERIFICARE"
reading: "4 MIN DI LETTURA"
search:
  keywords: ["versione", "stato", "Ethereum", "mainnet", "testnet", "Sepolia", "validazione", "audit", "distribuito", "distribuito", "redesign"]
---

# Stato reale delle versioni

**Questa guida descrive la nuova versione di CUBIT.** La dapp collegata usa il deployment Ethereum di questa versione, con commissioni LP dello 0,01%. Il mercato è aperto dal 22 settembre 2026, al blocco 26.035.793.

Questa edizione della guida è datata **26 settembre 2026**. Si basa sulle decisioni di design, sul codice della nuova versione e sui rapporti del repository.

## Tre stati distinti

| Ambito | Stato descritto da questa edizione |
| --- | --- |
| Decisioni di design, rese definitive il 14 settembre 2026 | Acquisto 3% team; vendita 15% (12% muri, 3% team); banda unica con l’80% dell’offerta; muri creati a ogni vendita; CUBIT dei muri attraversati verso la riserva del vault; vault al 3% al giorno; FDV di lancio di 3,75 ETH |
| Codice della nuova versione | Componenti elencati nella tabella seguente |
| Ethereum collegato alla dapp | Versione attuale: acquisto 3%, vendita 15% di cui 12% per i muri, fee LP 100 = 0,01%, banda unica dell’80% e muri posati a ogni vendita, con registro V2 e moduli sostituibili |

Modificare le fonti locali non cambia i contratti già distribuiti. Sincronizzare la documentazione non sposta i fondi di un vecchio pool.

## I componenti in produzione

| Parte | Stato |
| --- | --- |
| Banda ampia al lancio, rimozione del ladder e della manutenzione | In produzione su Ethereum |
| Muri collocati e svuotati a ogni vendita, invio dei loro CUBIT al vault | In produzione su Ethereum |
| Vault al 3% al giorno in CUBIT, pagato dalla riserva | In produzione su Ethereum dal 26 settembre 2026 |
| Vault di governance del launchpad: commissioni di lancio in ETH e token dei figli Forge | In produzione su Ethereum dal 23 settembre 2026 |
| Momentum: muri attivi, parzialmente consumati e attraversati di ogni token | In produzione su Ethereum dal 23 settembre 2026 |
| Forge pubblica: mercati figli isolati, commissione di lancio di 0,005 ETH | In produzione su Ethereum dal 23 settembre 2026 |
| Ricompensa del Vault esclusivamente in CUBIT, hook senza amministratore | Nel codice distribuito su Ethereum |
| Lancio in una transazione: 80% nella banda, 20% nella riserva del vault e acquisto di 0,1 ETH | In produzione su Ethereum |

Questi componenti sono distribuiti su Ethereum dal 22 settembre 2026, il launchpad e Momentum dal 23 settembre 2026; i depositi del Vault sono aperti dal 26 settembre 2026. Sono coperti dai test Foundry, dal fuzzing, dagli invarianti, dall’analisi statica e dalla verifica simbolica del repository. Le fasi successive figurano nella [roadmap](../roadmap.md).

## Cosa attestano i rapporti storici

Il rapporto Sepolia descrive il deployment di una versione precedente, verifiche di runtime e collegamenti, acquisti e vendite di collaudo, un collocamento del muro e controlli del rifiuto di azioni inammissibili.

Queste prove appartengono a quella versione. Non testano né la banda, né i muri creati a ogni vendita, né il nuovo vault.

Alla revisione storica `991fca9`, la suite Solidity completa contava **133 test superati e 15 falliti su 148**. Questi risultati e i loro limiti sono riportati nel rapporto sullo stato pubblicato. Non sono contatori di validazione della nuova versione.

## Cosa non costituisce una validazione completa

Una compilazione riuscita verifica la produzione di bytecode. Da sola non dimostra gli invarianti contabili, il comportamento di un insieme di muri attraversati, la coerenza del frontend o una transazione sulla rete scelta.

Allo stesso modo, confrontare hash dei runtime non significa che le fonti siano state pubblicate su un explorer. I test automatizzati del frontend non sostituiscono un collaudo con un wallet browser o mobile reale.

Una validazione completa della nuova versione copre anche la separazione dei conti, l’assenza di sovra-estrazione dal vault, l’arrivo nella riserva dei CUBIT dei muri svuotati e l’impossibilità per un attore di estrarre gli ETH dei muri a un tasso favorevole.

## Quale fonte seguire

Per la nuova versione, il riferimento è il documento di passaggio di consegne `contracts/docs/REDESIGN_HANDOFF.md` del branch `redesign/tide-lp-autowalls-vault`. Registra le decisioni definitive e la loro attuazione nel codice.

Per lo storico, il punto di partenza resta il rapporto francese della revisione `991fca9`. I manifest pubblici in `contracts/deployments/` identificano i deployment esistenti.

La [pagina Fonti](../sources.md) precisa l’ordine di lettura e i documenti diventati storici.
