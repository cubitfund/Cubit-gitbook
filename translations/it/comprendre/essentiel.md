---
description: "I concetti essenziali: token CUBIT, hook Uniswap v4, banda di liquidità e muri finanziati in ETH a ogni vendita."
section: "01 / CAPIRE"
reading: "5 MIN DI LETTURA"
---

# CUBIT in 5 minuti

CUBIT è un token ERC-20 associato a un mercato ETH/CUBIT su Uniswap v4. Il protocollo fornisce direttamente la liquidità del proprio pool: il suo **hook** ne è l’unico fornitore e applica le tasse secondo le regole del contratto.

L’offerta è fissata a **21 milioni di CUBIT**, creati una sola volta. Non esiste una funzione che permetta di crearne altri. Nella nuova versione, i CUBIT riacquistati dai muri **non vengono più bruciati**: confluiscono nella riserva di ricompense del vault.

> Questa pagina descrive la nuova versione. Consulta lo [stato delle versioni](../securite/etat.md).

## I due libri del mercato

| Libro | Ruolo | Cosa può cambiare |
| --- | --- | --- |
| Banda | Un’unica posizione ampia, collocata al lancio con l’80% dell’offerta; vende CUBIT agli acquirenti e ne riacquista dai venditori | La sua ripartizione tra CUBIT ed ETH segue il prezzo; la posizione non viene mai ritirata |
| Muri | Posizioni in ETH collocate sotto il prezzo corrente e finanziate dalle vendite | Il loro contenuto cambia quando il prezzo le attraversa; il loro tick non cambia mai |

I saldi del team e la riserva di ricompense del vault vengono contabilizzati separatamente. Un saldo totale non basta quindi a descrivere gli ETH realmente disponibili nei muri.

## Cosa finanziano gli swap

Per un **acquisto exact-input di 1 ETH**, escluso il gas:

- **0,97 ETH** entra nella componente dello swap diretta al pool, prima delle sue commissioni LP.
- **0,03 ETH** va al compartimento del team.

Per una **vendita che produce 1 ETH lordo**, **0,85 ETH** va al venditore, **0,12 ETH** finanzia i muri e **0,03 ETH** va al team. Il gas viene pagato separatamente.

La nuova versione prevede **commissioni LP dello 0,01%**. Questa commissione del pool è distinta dalle tasse del 3% sull’acquisto e del 15% sulla vendita. [Le tasse in dettaglio](taxes.md).

## Come compaiono i muri

A **ogni vendita**, l’hook svuota prima i muri che il prezzo ha interamente attraversato, poi colloca gli ETH in attesa, compreso il 12% della vendita, in un muro all’obiettivo `0,4 × prezzo corrente + 0,6 × prezzo di lancio`, calcolato sul prezzo dopo la vendita e arrotondato al tick. Due finanziamenti che cadono sullo stesso tick si sommano in un unico muro. Nessun muro viene spostato in seguito.

Al prezzo di lancio o al di sotto, questo obiettivo sarebbe sopra il mercato: il muro viene allora collocato l’1% sotto il prezzo corrente, invece di lasciare i fondi in attesa di una vendita successiva. Non serve alcuna chiamata di manutenzione: la creazione e lo svuotamento dei muri fanno parte della vendita stessa.

**La formula sceglie la posizione del muro; le vendite ne determinano la dimensione.** Un livello mostrato non prova che tutti i possessori possano vendere a quel livello. [L’obiettivo e i muri fissi](murs.md).

## Cosa succede al lancio

Il lancio avviene in un’unica transazione:

- l’**80% dell’offerta**, ossia 16,8 milioni di CUBIT, viene depositato nella banda;
- il **20%**, ossia 4,2 milioni di CUBIT, alimenta la riserva di ricompense del vault;
- il deployer effettua un **acquisto di 0,1 ETH**, tassato al 3% come ogni acquisto, i cui CUBIT non sono bloccati.

Non ci sono né airdrop né allocazioni al team. [La banda di liquidità](ladder.md).

## V1 e V2

La **V1** è il mercato: token, hook, banda, muri e swap. La **V2** aggiunge Vault, Momentum e Forge, che il team apre quando lo decide: Momentum e la Forge sono aperti dal 23 settembre 2026, il Vault dal 26 settembre 2026.

L’indirizzo del team riceve la quota del team sulle tasse e sostituisce e poi attiva i moduli periferici compatibili del registro; questi poteri sono permanenti. L’hook non ha alcun amministratore: nessuno può mettere in pausa gli swap né il meccanismo dei muri, e il nucleo del pool conserva le proprie identità fisse.

Le prossime fasi figurano nella [roadmap](../roadmap.md).

<p class="source-note">Fonti del repository: <code>contracts/src/CubitToken.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitV2.sol</code> e le decisioni di design del 14 settembre 2026 registrate in <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
