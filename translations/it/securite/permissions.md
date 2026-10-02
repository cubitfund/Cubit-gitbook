---
description: "Le identità fisse del nucleo, l’assenza di un amministratore dell’hook e i poteri permanenti dell’indirizzo del team sui moduli del registro."
section: "05 / VERIFICARE"
reading: "5 MIN DI LETTURA"
search:
  keywords: ["permessi", "team", "team", "setter", "sostituzione", "amministratore", "authority", "admin", "governance"]
---

# Permessi e sostituzioni

CUBIT distingue un nucleo con identità fisse, senza amministratore, e un indirizzo del team che amministra i moduli periferici. **I poteri dell’indirizzo del team sono permanenti.**

## Cosa resta fisso

Token, hook principale, PoolManager, poolId e ancoraggio del registro non vengono sostituiti dai setter periferici.

Il token autorizza il proprio hook tramite un collegamento unico. Le aliquote del nucleo, la FDV di lancio e la geometria della banda non hanno setter, e la banda non viene mai ritirata una volta collocata. Una nuova politica che modifica il nucleo richiede una nuova versione, la sua validazione e il deployment; non aggiorna automaticamente un vecchio pool.

## Nessun amministratore dell’hook

L’hook non ha **alcun amministratore** e nessuno può mettere in pausa gli swap né il meccanismo dei muri.

Nessun indirizzo può quindi sospendere una vendita o il collocamento di un muro. Le regole dell’hook si applicano così come sono state distribuite.

## Il ruolo del team

L’indirizzo del team, `TEAM_ADDRESS`, è fissato nell’hook e funge da `authority()` per il registro `CubitV2`. I suoi poteri sono permanenti: riceve la quota del team sulle tasse, il 3% sull’acquisto e il 3% sulla vendita, e sostituisce e poi attiva i moduli del registro. Può sostituire il Vault, il router, il Lens o la Forge **in qualsiasi momento e immediatamente**, senza preavviso. I quattro indirizzi sostituibili sono:

| Setter | Principali controlli di collegamento | Conseguenza |
| --- | --- | --- |
| `setVault(next)` | Codice presente, stesso hook e stesso token, Vault nuovo senza stake | Nuovo contratto di riferimento per i depositi futuri e per i CUBIT assorbiti inviati in seguito |
| `setRouter(next)` | Codice presente, stesso hook/PoolManager/poolId | Router corrente sostituito: quello usato dalla dapp |
| `setLens(next)` | Codice presente, stesso hook/PoolManager/poolId/token | Contratto di lettura corrente sostituito |
| `setForge(next)` | Codice presente, stesso hook, vault di governance con codice | Launchpad di riferimento, assente al lancio, registrato o sostituito per i lanci futuri, insieme al vault di governance che riceve le loro commissioni |

Ogni modifica emette `ModuleUpdated`, incrementa `moduleRevision` e chiude la funzionalità interessata finché il team non la riapre: sostituire il Vault, il Lens o la Forge chiude rispettivamente il Vault, Momentum o la Forge; sostituire il router non chiude alcuna funzionalità. Verifica il nuovo indirizzo e il suo codice prima di un’operazione.

## La portata di una sostituzione

Una sostituzione ha effetto con la sua stessa transazione. Permette di scegliere:

- dove vanno i CUBIT assorbiti dai muri di CUBIT negli invii successivi: l’hook li consegna al Vault registrato;
- dove vanno le future commissioni di lancio: la Forge registrata le versa al proprio vault di governance;
- quale router usa la dapp.

Non tocca:

- il nucleo: token, hook, banda, muri e tasse;
- i saldi già presenti nei vault esistenti, capitale e riserva di ricompense.

Il team protegge la chiave privata di questo indirizzo.

## I limiti dei controlli di compatibilità

Getter che dichiarano gli indirizzi corretti dimostrano il collegamento previsto, non la sicurezza di tutto il codice candidato. Non provano l’assenza di proxy o comportamenti malevoli in un’implementazione futura.

Il team sceglie quindi il codice periferico usato per le operazioni future. Questa capacità impone di verificare ogni sostituzione, il bytecode e le interazioni.

## I fondi già depositati

Una sostituzione del Vault non trasferisce né i CUBIT depositati né la riserva di ricompense del vecchio contratto. Posizioni, scadenze e uscite restano in quel vecchio Vault. Il registro conserva l’elenco dei Vault e il frontend deve continuare a esporre quelle posizioni.

Un vecchio router resta utilizzabile per gli swap e resta soggetto alle tasse dell’hook; un’approvazione concessa al vecchio router non vale per quello nuovo.

Sostituire Forge riguarda i lanci futuri; i figli già creati mantengono i propri contratti e il vault di governance della Forge che li ha lanciati.

Questi setter non riparano retroattivamente un contratto difettoso e non spostano i fondi che detiene. La possibilità di chiamare un’uscita on-chain e la sua disponibilità nel frontend vanno verificate separatamente.

## Il vault di governance del launchpad

Il vault di governance non ha né amministratore né uscita anticipata. Riceve le commissioni di lancio in ETH e i token assorbiti dai muri dei figli: ogni deposito vi resta bloccato per 30 giorni dalla sua ricezione, poi **solo il suo deployer** può riscuoterlo. Questo diritto vale per sempre e nessuna funzione permette di trasferirlo: è una fiducia esplicita riposta in quell’account. Quel deployer può estendere il blocco di tutto il vault, depositi presenti e futuri, quando vuole; nessuna funzione lo accorcia.

## Approvazioni e firme

Un’approvazione è legata a uno **spender preciso**. Non segue l’indirizzo corrente del registro. Il frontend deve rivalidare l’operazione quando revisione o moduli cambiano, in particolare tra un’approvazione e uno swap.

Ogni azione del protocollo è una transazione: verifica il suo indirizzo di destinazione e la catena prima di firmarla.

<p class="source-note">Fonti: <code>CubitV2.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>contracts/docs/MODULE_SETTERS.md</code> e i controlli frontend <code>releases.ts</code> / <code>vault.ts</code>.</p>
