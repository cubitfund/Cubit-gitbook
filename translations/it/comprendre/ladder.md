---
description: "Un’unica banda ampia, collocata al lancio con l’80% dell’offerta e mai ritirata: la liquidità di trading di CUBIT."
section: "01 / CAPIRE"
reading: "4 MIN DI LETTURA"
search:
  keywords: ["banda", "band", "liquidita", "liquidità", "TIDE", "curva", "x·y=k", "lancio", "FDV", "ladder"]
---

# La banda di liquidità

La liquidità di trading di CUBIT è contenuta in **un’unica banda ampia**, sul modello di TIDE. L’hook la colloca al lancio e non la ritira mai. Sostituisce il vecchio ladder.

## Cosa contiene la banda

| Parametro | Valore scelto |
| --- | --- |
| Deposito | 80% dell’offerta, ossia 16,8 milioni di CUBIT |
| Composizione al lancio | 100% CUBIT, nessun ETH |
| Intervallo di prezzo | Tutti i prezzi sopra il prezzo di lancio |
| FDV di lancio | 3,75 ETH, ossia 3 ETH di profondità per la banda |
| Ritiro | Nessuno: la posizione non viene mai ritirata |

Il limite inferiore della banda corrisponde al prezzo di lancio, arrotondato al tick, in modo che all’inizio la posizione non contenga alcun ETH. Al di sopra, copre l’intera curva di prezzo del pool.

## Una curva x·y=k

Acquisti e vendite seguono la curva a prodotto costante della banda. Un acquisto vi deposita ETH e ne preleva CUBIT: il prezzo sale. Una vendita fa il contrario: il prezzo scende.

Con una FDV di lancio di 3,75 ETH, i 16,8 milioni di CUBIT valgono **3 ETH al prezzo di lancio**. All’inizio, la banda si comporta come un pool x·y=k di 16,8 milioni di CUBIT contro 3 ETH. Questi 3 ETH sono **virtuali**: fissano la pendenza della curva, ma la banda detiene realmente solo gli ETH apportati dagli acquirenti.

## Cosa non garantisce la banda

Gli ETH che i venditori possono prelevare dalla banda sono quelli che gli acquirenti vi hanno depositato. Quando il prezzo torna al prezzo di lancio, la banda contiene soltanto CUBIT: non può più riacquistarne sotto quel prezzo.

Sotto il prezzo di lancio, una vendita può quindi essere servita solo dagli ETH ancora presenti nei muri. La profondità di 3 ETH non è né una riserva di ETH depositata dal protocollo né un prezzo minimo.

## Cosa è scomparso con il ladder

La banda sostituisce il vecchio libro mobile. Sono stati eliminati:

- il ladder, le sue bande successive e la sua riserva di token;
- il cushion in ETH;
- `rebalance`, `raiseFloor`, lo sweep verso i muri e i premi dei keeper.

Non serve alcuna chiamata di manutenzione per far funzionare il mercato: i keeper non esistono più.

## La banda di un figlio Forge

Un mercato figlio creato dalla Forge segue lo stesso modello, con una differenza: **deposita il 100% della propria offerta nella sua banda**. Non ha né riserva del vault né allocazione al team. L’hook esige un deposito di almeno l’80% dell’offerta e colloca l’intero deposito nella banda. [Momentum e Forge](../v2/momentum-forge.md).

## Verificare la banda

La vista `band()` dell’hook restituisce i tick e la liquidità della posizione; l’evento `BandBootstrapped` viene emesso al lancio. Il Lens espone `bandEth` e `bandTokens`, gli ETH e i CUBIT detenuti dalla banda al prezzo corrente, escluse le commissioni LP. [Contratti e integrazione](../developper/integration.md).

<p class="source-note">Fonti: <code>CubitHook._bootstrap</code>, <code>afterInitialize</code>, <code>band()</code>, <code>MIN_POOL_SUPPLY</code>, <code>CubitLens.bandEth</code> / <code>bandTokens</code> e <code>periphery/CubitForge.sol</code>. Decisioni di design del 14 settembre 2026.</p>
