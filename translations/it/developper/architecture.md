---
description: "Mappa del codice CUBIT: contratti, banda e muri, vault, dapp e servizi."
section: "04 / SVILUPPARE"
reading: "6 MIN DI LETTURA"
---

# Architettura e codice

Il repository riunisce contratti Solidity, una dapp React/Vite e due servizi Node. Questo GitBook è autonomo in `gitbook/`: la sua build non legge configurazioni private né dati di rete del protocollo.

> La versione descritta qui si trova nel branch `redesign/tide-lp-autowalls-vault`.

## Le directory

| Directory | Responsabilità |
| --- | --- |
| `contracts/src` | Token, hook, librerie, interfacce e contratti periferici |
| `contracts/test` | Test Foundry storici sulla vecchia API; test della nuova versione in `test/redesign` |
| `contracts/audit` | Harness e campagne di verifica complementari |
| `contracts/script` | Script Foundry di deployment e scenari rieseguibili su un nodo locale |
| `contracts/scripts` | Esportazione ABI, controlli e procedure di deployment |
| `contracts/deployments` | Manifest pubblici delle versioni e cronologia |
| `dapp/src/chain` | Configurazione, ABI, letture, quotazioni e transazioni |
| `dapp/src/pages` | Swap, Proof, Staking, roadmap e moduli V2 |
| `services/shared` | Configurazione condivisa, client, ABI e monitoraggio dell’esecuzione |
| `services/keeper` | Servizio della vecchia manutenzione, senza utilità nella nuova versione |
| `services/floor-bot` | Lettura degli eventi e preparazione delle pubblicazioni |
| `audit/reports` | Rapporti datati e prove associate alle revisioni |
| `gitbook/docs` | Fonti francesi di questa documentazione |

## I contratti del nucleo

| Componente | Responsabilità |
| --- | --- |
| `CubitToken` | ERC-20 con emissione iniziale unica di 21 M; burn riservato all’hook |
| `CubitHook` | Tasse, banda di liquidità, collocamento e svuotamento dei muri, conti del team, collegamento V2 |
| `BandLib` | Prezzi, conversioni e arrotondamenti ai tick, obiettivo dei muri |
| `WallLib` | Muri per tick: identificatore permanente, indice dei muri attivi, finanziamento e svuotamento dei muri attraversati |
| `PoolManager` v4 | Stato del pool, posizioni di liquidità, swap e regolamento |

L’hook è l’unico fornitore di liquidità del pool CUBIT: qualsiasi altra aggiunta di liquidità viene rifiutata. I fondi vengono seguiti nelle posizioni e tramite claim ERC-6909 del PoolManager; il saldo ETH nativo dell’indirizzo dell’hook non è quindi una misura sufficiente delle riserve.

La banda è un’unica posizione identificata da `BAND_SALT`. Ogni muro occupa una cella di `tickSpacing` con il proprio salt. `WallLib` lavora sullo storage dell’hook: claim e posizioni restano assegnati all’hook.

## I contratti periferici

| Componente | Responsabilità |
| --- | --- |
| `CubitRouter` | Swap exact-input/output, limite di slippage, scadenza, regolamento e invio dei CUBIT assorbiti dopo ogni vendita |
| `CubitLens` | Viste derivate: mercato, banda, muri, conti, offerta in circolazione, CUBIT detenuti e miglior muro |
| `CubitV2` | Registro stabile dei moduli, revisione e storico dei vault |
| `CubitVault` | Depositi CUBIT, blocco di 24 ore e ricompensa in CUBIT pagata da una riserva |
| `CubitGovernanceVault` | Vault di governance del launchpad: commissioni di lancio in ETH e token dei muri dei figli, bloccati per 30 giorni per deposito, più l’eventuale estensione; riscossione ed estensione riservate per sempre al deployer |
| `CubitForge` | Launchpad pubblico di mercati figli isolati, aggiunto dopo il lancio; commissione di lancio di 0,005 ETH versata al vault di governance, il cui indirizzo è fissato alla costruzione |
| `CubitLaunch` | Lancio in un’unica transazione: 80% dell’offerta nella banda, 20% nella riserva del vault e acquisto del deployer |

L’indirizzo del team può sostituire Router, Lens, Vault e Forge nel registro in qualsiasi momento, senza ritardo, e poi attivarli; questi poteri sono permanenti, e ogni sostituzione disattiva la funzionalità interessata fino alla sua riattivazione. Token, hook, identità del pool e ancoraggio del registro non seguono questo meccanismo di sostituzione, e l’hook non ha alcun amministratore: nessuno può mettere in pausa gli swap né il meccanismo dei muri.

## Il percorso di una lettura

```text
Frontend o servizio
    → manifest pubblico: rete, nucleo, registro
    → registro a un dato blocco: moduli + revisione
    → controllo dei collegamenti dei moduli
    → Lens e viste dell’hook allo stesso blocco
    → visualizzazione o simulazione di un’azione
```

Nel frontend, `releases.ts` risolve i moduli e `vault.ts` conserva la lettura dei vecchi Vault. Una risposta RPC mancante non deve autorizzare una firma. Il livello dati della dapp legge l’ABI della versione in servizio.

## Il percorso di uno swap

Il frontend ottiene una quotazione e poi una simulazione. Il router apre il contesto di regolamento del PoolManager; l’hook applica le tasse sulla componente ETH e lo swap segue la curva della banda e dei muri attraversati. Il router regola poi i delta.

A ogni vendita, in `afterSwap`, l’hook svuota i muri interamente attraversati, poi colloca gli ETH in attesa in un muro all’obiettivo calcolato sul prezzo dopo la vendita, oppure l’1% sotto il prezzo corrente quando quell’obiettivo non è sotto il mercato, al prezzo di lancio o al di sotto. Alla fine della vendita, il router CUBIT chiama `deliverAbsorbed()` per inviare i CUBIT assorbiti alla riserva del vault; un fallimento di questo invio non blocca la vendita.

I confini sono importanti: il callback del router è accessibile solo al PoolManager durante l’operazione prevista e il payer proviene dal chiamante autenticato del router.

## Cosa ha cambiato la nuova versione

La banda sostituisce il ladder, e `rebalance`, `raiseFloor`, lo sweep e i premi sono stati rimossi. I muri vengono collocati e svuotati durante le vendite, e i CUBIT dei muri attraversati confluiscono nella riserva del vault invece di essere bruciati.

La suite storica `contracts/test` usa la vecchia API e non compila con la nuova versione; i test della nuova versione si trovano in `test/redesign`. Le prossime fasi figurano nella [roadmap](../roadmap.md) e i componenti testati nello [stato delle versioni](../securite/etat.md).

<p class="source-note">Fonti: file citati del repository, in particolare <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> e i README dei servizi.</p>
