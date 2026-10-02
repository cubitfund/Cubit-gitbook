---
description: "Momentum offre una vista del mercato in sola lettura. La Forge è un launchpad pubblico; le sue commissioni di lancio e i token assorbiti dai muri dei figli confluiscono nel vault di governance del launchpad."
section: "03 / MODULI V2"
reading: "5 MIN DI LETTURA"
search:
  keywords: ["momentum", "forge", "figlio", "launchpad", "pubblico", "governance", "NAV", "lock", "30 giorni", "estensione"]
---

# Momentum e Forge

Questi due moduli hanno ruoli distinti: **Momentum rende visibile lo stato del mercato**, mentre **la Forge permette a chiunque di lanciare un mercato figlio isolato**.

## Momentum: osservare il mercato

Momentum è una pagina dell’app: per ogni token mostra i muri attivi, i muri parzialmente consumati e lo storico dei muri attraversati, a partire dagli eventi dell’hook e dalle letture del Lens. È aperta dal 23 settembre 2026.

È una funzionalità **di sola lettura**, senza potere di prelevare ETH dai muri né di modificare le regole del nucleo. Un cambio di visualizzazione non è un ordine di trading.

La geometria effettivamente usata resta quella dell’hook. Non può essere inventata da un componente del frontend.

## Forge: un launchpad pubblico

La Forge è **aperta a tutti**: qualsiasi account lancia un mercato figlio pagando la commissione di lancio esatta. Non faceva parte del lancio di CUBIT: il team l’ha aggiunta il 23 settembre 2026, con il suo vault di governance, e l’ha aperta lo stesso giorno.

Ogni figlio riceve il proprio token, il proprio hook, le identità del pool e riserve proprie. Il template di creazione dell’hook è controllato da un hash fissato nel costruttore di Forge. I salt di deployment sono legati a chi lancia: due lanci nello stesso blocco non si invalidano a vicenda, e copiare i salt di un altro account non permette di prendere il suo lancio.

Un figlio **deposita il 100% della propria offerta nella sua banda**. Non ha né riserva del vault né allocazione al team. Nome, simbolo, indirizzo del team, salt di deployment e codice fornito sono soggetti a controlli. Come quello del padre, l’hook di un figlio non ha alcun amministratore. Creare un figlio non concede permessi sul pool CUBIT padre. I parametri sono imposti: stessa valutazione di lancio, stessa offerta e stesse tasse per ogni figlio.

## Il vault di governance del launchpad

Il **vault di governance del launchpad** riceve le commissioni di lancio della Forge, in ETH, e i token assorbiti dai muri dei figli, che non vanno al vault di staking del padre:

- ogni deposito vi resta bloccato per **30 giorni a partire dalla sua registrazione**, più l’eventuale estensione: è immediata per un deposito, una commissione di lancio o una consegna di un figlio, e avviene solo alla chiamata di `lockUntracked` per token inviati direttamente al vault;
- **il deployer può estendere il blocco** di tutto il vault, depositi presenti e futuri, token ed ETH, con `extendLock`, quando vuole; nessuna funzione accorcia un blocco;
- per esempio, 10 token ricevuti ogni giorno per 7 giorni escono in 7 lotti, uno al giorno, l’ultimo a 1 mese e 7 giorni;
- **solo il deployer** di quel vault può riscuotere i lotti sbloccati, per sempre: nessuna funzione permette di trasferire questo diritto;
- le sue disponibilità sono destinate a servire da riferimento di valore, o NAV, per il token del launchpad.

La Forge riceve l’indirizzo di questo vault alla sua costruzione, in `governanceVault`. L’hook di un figlio lo ritrova tramite la Forge che ha distribuito il suo token, poi `deliverAbsorbed()` vi trasferisce i token dei muri svuotati e li blocca con `lockUntracked`.

## La commissione di lancio

Ogni lancio versa la sua commissione al vault di governance del launchpad, in ETH, tramite `depositEth()` e nella stessa transazione. La commissione appartiene da quel momento alla governance: **chi lancia non la recupera mai** e **solo il deployer** del vault può riscuoterla con `claim`. La commissione non finanzia i muri di CUBIT. Come ogni deposito ricevuto da questo vault, segue poi la regola di blocco descritta sopra.

L’importo di `launchFee()` viene fissato alla costruzione di ogni Forge: vale **0,005 ETH**, ossia 5 × 10^15 wei, ed è immutabile. Cambiare la commissione richiede quindi una nuova Forge; rileggi sempre l’importo on-chain del contratto effettivamente usato.

## Se Forge viene sostituita

Il team può sostituire la Forge in qualsiasi momento, senza ritardo. La sostituzione cambia la factory di riferimento per i lanci futuri e, con essa, il vault di governance che riceve le loro commissioni; disattiva la Forge fino alla sua riattivazione. I figli già creati conservano i propri contratti e fondi. Un launchpad v2 può così fissare altri parametri per i propri lanci.

I controlli di compatibilità del registro non sostituiscono una revisione del template e della factory.

## Un launchpad v2

I parametri dei figli sono imposti dalla Forge registrata. Una Forge sostitutiva, un launchpad v2, può fissarne altri; il team la apre quando lo decide.

I figli già lanciati continuano a funzionare sui propri pool, e i token assorbiti dai loro muri vanno sempre al vault di governance della Forge che li ha lanciati.

<p class="source-note">Fonti: decisioni di design del 14 e 15 settembre 2026, <code>periphery/CubitForge.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>CubitHook.absorbedTokenSink</code>, <code>CubitV2.setForge</code> e <code>dapp/src/pages/Momentum.tsx</code>.</p>
