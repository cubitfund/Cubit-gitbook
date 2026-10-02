---
description: "Risposte alle domande frequenti su banda, muri finanziati a ogni vendita, commissioni, Vault, permessi e versioni."
section: "05 / VERIFICARE"
reading: "RISPOSTE RAPIDE"
---

# Domande frequenti

## Cos’è concretamente un muro?

Una posizione di liquidità finanziata in ETH nel pool, a un tick determinato sotto il prezzo corrente. La formula ne sceglie la posizione e il 12% delle vendite ne determina la dimensione.

## Cos’è la banda?

L’unica posizione di trading: l’80% dell’offerta, collocata al lancio, che copre tutti i prezzi sopra il prezzo di lancio e non viene mai ritirata. Acquisti e vendite seguono la sua curva x·y=k. [La banda di liquidità](comprendre/ladder.md).

## L’obiettivo segue il massimo storico?

No. Usa il prezzo lasciato da ogni vendita: `0,4 × prezzo corrente + 0,6 × prezzo di lancio`. Per una base illustrativa di 7 000, un ritorno da 100k a 60k dà **28,2k**. [Consulta il calcolo](comprendre/murs.md).

## I vecchi muri scendono con il nuovo obiettivo?

No. Un muro resta al suo tick. Un finanziamento che cade sullo stesso tick lo ispessisce; una vendita può tuttavia consumarne gli ETH.

## Il 12% viene collocato a ogni vendita?

Sì: ogni vendita colloca gli ETH in attesa, compreso il suo 12%, in un muro all’obiettivo calcolato sul prezzo dopo la vendita. Al prezzo di lancio o al di sotto, questo obiettivo sarebbe sopra il mercato: il muro viene allora collocato l’1% sotto il prezzo corrente. Solo una polvere troppo piccola per creare una posizione e il caso estremo di un prezzo in cima all’intervallo di tick attendono una vendita successiva.

## Le commissioni LP sono incluse nel 15%?

No. Il 15% è la tassa dell’hook sulla vendita; la tassa d’acquisto è del 3%. La commissione LP della nuova versione è dello 0,01%, con una base di calcolo propria del pool. Il pool Ethereum collegato applica la stessa aliquota. [Dettaglio delle commissioni](comprendre/taxes.md).

## Cosa diventa un muro attraversato?

Un muro solo parzialmente consumato resta al suo posto e si ricarica di ETH se il prezzo risale. Un muro interamente attraversato viene svuotato dalla vendita che lo ha attraversato: i suoi CUBIT confluiscono nella riserva di ricompense del vault. [Consulta la spiegazione](comprendre/burn.md).

## Una vendita può attraversare un numero illimitato di muri?

No. Ogni muro attraversato costa circa 185 000 gas e una transazione è limitata a 16 777 216 gas: una vendita attraversa al massimo circa 88 muri. Oltre, fallisce senza perdite e deve essere suddivisa. [Rischi e limiti](securite/risques.md).

## CUBIT è deflazionistico?

Non più nella nuova versione. L’offerta resta fissata a 21 milioni senza mint, ma i CUBIT riacquistati dai muri non vengono più bruciati: alimentano la riserva di ricompense del vault.

## Servono ancora i keeper?

No. `rebalance` e `raiseFloor` sono stati rimossi e i muri vengono collocati e svuotati durante le vendite. Nessun premio viene versato a un chiamante.

## Qualcuno può bloccare le vendite?

No. L’hook non ha alcun amministratore e nessuno può mettere in pausa gli swap né il meccanismo dei muri.

## Il team conserva dei poteri?

Sì, in modo permanente. L’indirizzo del team riceve la quota del team sulle tasse e può sostituire in qualsiasi momento, senza ritardo, i moduli periferici del registro e poi attivarli. Queste sostituzioni non toccano né il nucleo né i saldi già presenti nei vault. [I permessi](securite/permissions.md).

## Le funzioni V2 sono disponibili?

Sì: Momentum e la Forge dal 23 settembre 2026, il Vault dal 26 settembre 2026. [Le funzionalità V2](v2/prochaines-fonctionnalites.md).

## Cosa succede se non riscuoto la ricompensa ogni giorno?

L’importo riscuotibile è limitato a un giorno, ossia al 3% del deposito. Oltre 24 ore senza riscossione, l’eccedenza va persa. La ricompensa è inoltre limitata dal saldo della riserva.

## Un nuovo deposito prolunga il blocco del Vault?

Sì. Un deposito aggiuntivo riavvia il blocco di 24 ore dell’intera posizione di quel wallet in quel contratto. La ricompensa maturata può essere riscossa indipendentemente dal blocco del prelievo.

## Cosa succede ai miei fondi se il Vault viene sostituito?

Restano nel vecchio Vault, con la sua riserva di ricompense e la tua data di sblocco. Seleziona quel vecchio contratto per leggere la posizione ed eseguire le uscite. I fondi non vengono trasferiti automaticamente al nuovo modulo.

## Dove vanno i token assorbiti dai muri di un figlio Forge?

Al vault di governance del launchpad, che riceve anche le commissioni di lancio della Forge, in ETH. Ogni deposito vi resta bloccato per 30 giorni dalla sua registrazione — immediata per un deposito o una commissione di lancio, alla chiamata di `lockUntracked` per token inviati direttamente —, più l’eventuale estensione, poi solo il deployer di quel vault può riscuoterlo: questo diritto è definitivo e non può essere trasferito. Quel deployer può estendere il blocco, mai accorciarlo. [Momentum e Forge](v2/momentum-forge.md).

## Chi può lanciare un token sulla Forge?

Qualsiasi account, pagando la commissione di lancio esatta di 0,005 ETH, che va al vault di governance e non viene mai restituita. La Forge non faceva parte del lancio di CUBIT: il team ha aggiunto il launchpad e lo ha aperto il 23 settembre 2026. [Momentum e Forge](v2/momentum-forge.md).
