---
description: "3% sull’acquisto, 15% sulla vendita di cui il 12% per i muri, commissioni LP previste allo 0,01%: capire le basi di calcolo."
section: "01 / CAPIRE"
reading: "5 MIN DI LETTURA"
search:
  keywords: ["tasse", "commissioni", "fee", "percentuale", "acquisto", "vendita", "team", "team", "muri"]
---

# Tasse e circolazione degli ETH

Le **tasse dell’hook** e le **commissioni LP del pool** corrispondono a due operazioni diverse. Non si applicano alla stessa base e non si sommano come un’unica tassa.

Queste aliquote sono quelle della nuova versione e si applicano nel pool Ethereum collegato. Verifica lo [stato delle versioni](../securite/etat.md) e la quotazione del pool utilizzato.

## La tassa sull’acquisto

La tassa totale è il **3% dell’ingresso lordo in ETH**, interamente destinato alla quota del team. Nel caso exact-input è inclusa nell’importo fornito al router.

| Per un acquisto di 1 ETH | Importo | Destinazione |
| --- | --- | --- |
| Componente dello swap | 0,97 ETH | Pool, poi commissioni LP e conversione in CUBIT |
| Quota del team | 0,03 ETH | Contabilità del team |

Per un acquisto exact-output, se la componente del pool richiede `x` ETH, il totale prima del gas è circa `x / 0,97`, con arrotondamenti interi. Il router applica il limite d’ingresso scelto dall’utente e rimborsa l’eccedenza.

## La tassa sulla vendita

La tassa totale è il **15% degli ETH lordi in uscita**: **12% per i muri e 3% per il team**.

| Per un’uscita lorda di 1 ETH | Importo | Destinazione |
| --- | --- | --- |
| ETH netti del venditore | 0,85 ETH | Wallet del destinatario |
| Finanziamento dei muri | 0,12 ETH | Muro collocato all’obiettivo di questa vendita, oppure l’1% sotto il prezzo corrente al prezzo di lancio o al di sotto |
| Quota del team | 0,03 ETH | Contabilità del team |

Il venditore riceve quindi **0,85 ETH**, prima del costo del gas pagato separatamente. Per puntare a un’uscita netta di `x` ETH in exact-output, il pool deve fornire circa `x / 0,85` ETH lordi, con arrotondamenti interi e secondo la quotazione effettiva.

Le **vendite finanziano direttamente i muri**. Il 12% e il 3% sono calcolati sugli ETH lordi della vendita: non si tratta del 12% del 15% di tassa. La quota del team va interamente al team.

## Le commissioni LP

Il parametro `fee` di Uniswap v4 è espresso in milionesimi:

| Versione | Parametro | Percentuale LP |
| --- | --- | --- |
| Nuova versione | `100` | **0,01%** |

Il `tickSpacing` e la larghezza di un muro sono parametri geometrici, non un’altra espressione della commissione LP. Il pool CUBIT usa una spaziatura di 10 tick nelle fonti lette.

Le commissioni LP si applicano alla componente dello swap secondo la meccanica del pool. Una quotazione reale tiene conto di arrotondamenti, tick attraversati, liquidità ed eventuali commissioni di protocollo v4. **Non applicare una seconda volta la tassa a una quotazione già netta.**

## Dove va il 12%

A ogni vendita, l’hook svuota prima i muri che il prezzo ha interamente attraversato, poi colloca tutti gli ETH in attesa, compreso questo 12%, in un muro situato all’obiettivo calcolato sul prezzo dopo la vendita. Se a quel tick esiste già un muro, questo viene ispessito. Al prezzo di lancio o al di sotto, questo obiettivo passa il più delle volte sopra il mercato: il muro viene allora collocato l’1% sotto il prezzo corrente. Solo una polvere troppo piccola per creare liquidità, un surplus quando si raggiunge il tetto di liquidità di un tick, e il caso estremo di un prezzo in cima all’intervallo di tick restano in `pendingFloorEth`, fino a una vendita successiva.

Non c’è più alcuno sweep: il vecchio trasferimento di una quota degli ETH del ladder verso i muri è scomparso insieme al ladder. [L’obiettivo e i muri fissi](murs.md).

## Le entrate previste per la V2

| Modulo | Entrata | Cosa non la finanzia |
| --- | --- | --- |
| Vault | Riserva di CUBIT: 20% dell’offerta al lancio, poi i CUBIT dei muri interamente attraversati | Capitale depositato, creazione di CUBIT, commissioni LP; nessuna ricompensa in WETH |
| Forge | Commissione di lancio di 0,005 ETH, versata in ETH al vault di governance del launchpad e mai restituita a chi lancia | Prelievo dei fondi dei muri per un figlio |

Le commissioni della Forge vengono incassate dalla sua apertura, il 23 settembre 2026. La riserva del Vault paga le ricompense dall’apertura del Vault, il 26 settembre 2026. Il loro importo dipende dall’attività reale.

## Un’andata e ritorno non costa esattamente il 18%

Isolando soltanto le tasse proporzionali, a prezzo costante e senza impatto o altri costi, il fattore conservato è `0,97 × 0,85 = 0,8245`. La perdita corrispondente è quindi il **17,55%**, non una somma meccanica di 15 e 3 applicata allo stesso importo.

Un’operazione reale di andata e ritorno aggiunge commissioni del pool, gas ed evoluzione del prezzo. L’importo netto restituito dalla quotazione rimane il riferimento per una specifica transazione. [Comprare e vendere](../utiliser/swaps.md).

<p class="source-note">Ripartizione delle tasse: decisioni di design del 14 settembre 2026. Codice: <code>CubitHook._creditBuyTax</code>, <code>_creditSellTax</code>, <code>_placeWall</code> e <code>periphery/CubitRouter.sol</code>.</p>
