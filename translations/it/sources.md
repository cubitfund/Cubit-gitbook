---
description: "Ambito delle letture, gerarchia dei documenti, fonti della direzione artistica e metodo di manutenzione del GitBook."
section: "05 / VERIFICARE"
reading: "RIFERIMENTI DELLA GUIDA"
search:
  keywords: ["fonti", "riferimenti", "riferimenti", "documentazione", "HonKit", "specifica", "versione", "redesign"]
---

# Fonti e metodo

Questa guida è stata redatta a partire dal codice locale e dalle decisioni di design rese definitive il **14 settembre 2026**. I file citati di seguito sono percorsi del repository, non endpoint di rete.

La nuova versione è descritta sulla base del branch `redesign/tide-lp-autowalls-vault`. I riferimenti storici al codice indicano la revisione `991fca9` del protocollo, conservata nel branch `work/v1-v2-fixed-walls`. La documentazione pubblicata non costituisce una validazione dei contratti descritti.

## Ordine di lettura

Il riferimento della nuova versione è **`contracts/docs/REDESIGN_HANDOFF.md`**. Questo documento registra le decisioni di design e la loro attuazione nel codice; prevale sui documenti precedenti.

Le tasse restano invariate: **3% sugli acquisti per il team** e **15% sulle vendite: 12% per i muri e 3% per il team**. La liquidità di trading è un’unica banda, i muri vengono collocati e svuotati a ogni vendita e la FDV di lancio scelta è di **3,75 ETH**.

Il documento **`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** esprimeva la base di lancio in **7 000 USD di FDV** su 21 milioni di token. La nuova versione fissa la FDV direttamente in ETH; questa guida non stabilisce alcuna corrispondenza tra questi due riferimenti.

Per sapere cosa funziona realmente, bisogna poi collegare codice, risultati di validazione e deployment della stessa versione.

Un commento del codice non sostituisce una decisione confermata. Viceversa, una decisione non prova che un’implementazione o una rete la esegua.

## Il codice letto

| Fonte | Utilizzo nella guida |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | Decisioni definitive e attuazione nel codice |
| `contracts/src/CubitToken.sol` | Offerta fissa e diritto di burn |
| `contracts/src/CubitHook.sol` | Tasse, banda, muri, conti e collegamento V2 |
| `contracts/src/libraries/BandLib.sol` | Geometria, prezzi, tick e obiettivo dei muri |
| `contracts/src/libraries/WallLib.sol` | Muri per tick: finanziamento e svuotamento dei muri attraversati |
| `contracts/src/CubitLens.sol` e interfacce | Prezzi, banda, muri, saldi, offerta in circolazione, CUBIT detenuti e miglior muro |
| `contracts/src/periphery/CubitRouter.sol` | Swap, limiti, approvazioni e invio dei CUBIT assorbiti |
| `contracts/src/periphery/CubitV2.sol` | Identità dei moduli e sostituzioni |
| `contracts/src/periphery/CubitVault.sol` | Blocco, ricompensa giornaliera e riserva |
| `contracts/src/periphery/CubitGovernanceVault.sol` | Depositi bloccati per 30 giorni e riscossione da parte del deployer |
| `contracts/src/periphery/CubitForge.sol` | Launchpad pubblico, isolamento dei figli e indirizzo del vault di governance |
| `contracts/src/periphery/CubitLaunch.sol` | Lancio in una transazione: banda, riserva del vault e acquisto del deployer |
| `dapp/src/chain` | Individuazione, quotazioni, contesto di firma e vecchi Vault |
| `dapp/src/pages/Momentum.tsx` | Pagina Momentum in sola lettura: muri attivi, parzialmente consumati e attraversati |
| `services/` e relativi README | Relay degli eventi e vecchio keeper |
| `contracts/foundry.toml` e manifest dei pacchetti | Comandi e parametri di build |

## Rapporti e documenti storici

Il rapporto di riferimento della vecchia versione è `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md`. Descrive il ladder, la manutenzione tramite keeper e il burn dei muri, sostituiti nella nuova versione.

`roadmapdev.md` e i documenti storici della specifica sono serviti a comprendere l’intenzione e le tappe V1/V2. I testi originali sono stati archiviati in `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/`. I passaggi su un unico muro monotono, il collocamento E/C, il ladder, i keeper o la scomparsa totale dei diritti amministrativi non costituiscono la regola della nuova versione.

`contracts/docs/STRICT_BURN.md` spiega l’evoluzione storica del burn dei token assorbiti, abbandonato nella nuova versione. `contracts/docs/MODULE_SETTERS.md` documenta la sostituzione dei componenti periferici. Nessun vecchio numero di test viene presentato qui come risultato di validazione della nuova versione.

La precedente pagina roadmap della dapp è un riferimento editoriale datato; il suo contenuto non va usato da solo per integrare la nuova versione.

## La direzione artistica

Il tema adatta le decisioni già presenti nella dapp:

| Fonte visiva | Elementi ripresi |
| --- | --- |
| `dapp/src/index.css` | Crema `#f5f1e8`, inchiostro `#111312`, viola `#5b4bff`, lime `#c7ff3d`, arancione `#ff704d`, carta `#ede7d8` |
| `dapp/src/index.css` | Titoli Archivo di peso elevato e larghezza estesa; etichette Martian Mono; texture discreta |
| `dapp/src/components/primitives.tsx` | Bordi netti, ombre sfalsate, pannelli e stati |
| `dapp/src/components/Header.tsx` | Marchio tipografico, quadrato viola, navigazione e distinzione degli stati |
| `dapp/src/ui.tsx` | Motivo a stella occasionale ed etichette a spaziatura fissa |

I font vengono copiati localmente durante la build con le rispettive licenze. La guida riprende il linguaggio grafico della dapp senza riutilizzare slogan diventati obsoleti.

## La documentazione

Il motore scelto è **HonKit 6.2.2**, fork del motore GitBook dedicato alla creazione di libri e documentazione da Markdown. Sommario, generazione statica, ricerca e navigazione tra pagine provengono da questo framework. Il tema CUBIT ne estende template e stili. [Documentazione ufficiale HonKit](https://honkit.netlify.app/).

L’installazione locale e i comandi `serve` / `build` seguono la [documentazione introduttiva ufficiale](https://honkit.netlify.app/setup.html). La [configurazione del libro](https://honkit.netlify.app/config.html) precisa tra l’altro la radice dei contenuti e gli stili. La release 6.2.2 identifica la versione usata.

Il README nella radice di `gitbook/` descrive installazione, comandi, controlli browser e limiti degli strumenti. Le validazioni di questo sito verificano il libro; non validano i contratti del protocollo.

## Mantenere questa guida

Per una nuova release, inizia aggiornando lo stato delle versioni e il riferimento normativo. Sincronizza poi regole, API e percorsi realmente collegati. Conserva l’indicazione storica quando un vecchio risultato non riguarda le fonti finali.

Aggiungi una pagina in `docs/`, inseriscila in `SUMMARY.md` e ricostruisci il libro. Le fonti di questa documentazione vengono selezionate esplicitamente; configurazioni private, chiavi, RPC autenticati e dump di transazioni non fanno parte del sito.
