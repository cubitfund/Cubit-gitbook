---
description: "La formula sceglie la posizione del muro; le vendite ne determinano la dimensione. Obiettivo calcolato a ogni vendita, esempi e muri fissati al loro tick."
section: "01 / CAPIRE"
reading: "7 MIN + UN ESEMPIO INTERATTIVO"
search:
  keywords: ["muro", "muri", "obiettivo", "prezzo", "profondità", "capacita", "capacità", "ritracciamento", "formula", "vendita", "16200", "44200", "28200"]
---

# L’obiettivo e i muri fissi

**La formula sceglie la posizione del muro; le vendite ne determinano la dimensione.** Un muro è una posizione LP finanziata in ETH a un tick determinato, sotto il prezzo corrente.

## La formula a ogni vendita

Siano `M` la capitalizzazione di mercato dopo la vendita e `B` la base di lancio, espresse nella stessa unità:

<div class="formula">obiettivo = M − (M − B) × 0,6<span class="line-break"></span>= 0,4 × M + 0,6 × B</div>

Il coefficiente ritraccia il **60% dello scarto tra mercato e base**. Conserva quindi il 40% di questo scarto sopra la base. Con una base illustrativa `B = 7 000`:

| Mercato dopo la vendita | Calcolo | Obiettivo del muro |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0,6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0,6 | **44 200** |
| Ritorno a 60 000 | 60 000 − 53 000 × 0,6 | **28 200** |

Il terzo calcolo riparte da **60 000**, anche se il mercato ha raggiunto in precedenza 100 000. Non esiste un meccanismo a cricchetto basato sul massimo storico. L’obiettivo viene ricalcolato **a ogni vendita**, sul prezzo lasciato da quella vendita: non esiste più una riserva accumulata e poi collocata da una chiamata di manutenzione.

## Varia il mercato

L’esempio seguente mantiene due vecchi muri a 16,2k e 44,2k, poi calcola l’obiettivo del prossimo muro. I valori usano la stessa unità di capitalizzazione, con una base illustrativa di 7 000. Questo schema non simula né l’assorbimento, né i saldi, né una transazione.

<section class="wall-lab" aria-label="Calcolatore didattico dell’obiettivo">
  <header><span>L’OBIETTIVO DOPO LA VENDITA</span><span>BASE FISSA: 7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">Mercato dopo la vendita <output id="market-value" for="market-cap">60 000 unità</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">Ritorno a 60k</button></div>
  </div>
  <div class="wall-levels" aria-label="Confronto dei livelli di capitalizzazione">
    <div class="level-row"><span>Vecchio muro A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16,2k</b></div>
    <div class="level-row"><span>Vecchio muro B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44,2k</b></div>
    <div class="level-row new-target"><span>Nuovo obiettivo</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28,2k</b></div>
    <div class="level-row market"><span>Mercato attuale</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>Obiettivo del prossimo muro</span><strong id="target-value">28 200 unità</strong></div>
  <p class="lab-explanation">Solo i nuovi finanziamenti seguono l’obiettivo corrente. I vecchi muri restano al loro tick; la quantità di ETH ancora disponibile a ogni livello va letta separatamente.</p>
</section>

## Un muro per tick, mai spostato

Una volta collocati, gli ETH di un muro restano legati al suo tick. Un mercato in salita o in discesa non sposta un vecchio muro verso il nuovo obiettivo.

- Un finanziamento il cui obiettivo cade sul tick di un muro esistente **ispessisce quel muro** invece di crearne un secondo.
- Una vendita può consumare parzialmente un muro: una parte dei suoi ETH riacquista allora CUBIT.
- Un muro solo parzialmente consumato **resta al suo posto**. Se il prezzo risale, rivende i suoi CUBIT e si ricarica di ETH.
- Un muro **interamente attraversato** viene svuotato dalla vendita che lo ha attraversato: i suoi CUBIT vanno alla riserva di ricompense del vault, senza burn, e i suoi ETH residui tornano ai fondi in attesa.

Gli identificatori dei muri sono permanenti. Un indice dei tick permette di ritrovare i muri toccati da una vendita. [Muri attraversati e riserva del vault](burn.md).

## Quando l’obiettivo non è collocabile

Un muro è una posizione al 100% in ETH: deve trovarsi sotto il prezzo corrente. Quando il prezzo è pari o inferiore al prezzo di lancio, la formula dà un obiettivo pari o superiore al mercato, che non può essere finanziato con soli ETH.

In questo caso, l’hook colloca il muro **l’1% sotto il prezzo corrente**, arrotondato al tick, invece di lasciare i fondi in attesa. Altrimenti, fondi accumulati potrebbero essere collocati tutti insieme a un prezzo gonfiato da una transazione che compra subito prima e poi vende i suoi CUBIT in quel muro. L’hook decide sul tick arrotondato, non sull’obiettivo esatto: vicino al prezzo di lancio, l’obiettivo 40/60 arrotondato può restare appena sotto il mercato ed essere usato così com’è, quindi più vicino dell’1%.

Attendono in `pendingFloorEth` solo un importo troppo piccolo per creare una posizione, cioè polvere, un eventuale surplus quando il muro mirato raggiunge il tetto di liquidità di un tick, un limite di Uniswap v4, e il caso estremo di un prezzo in cima all’intervallo di tick, dove nessun muro trova posto sotto il prezzo. Una vendita successiva li colloca. La vendita stessa non viene mai rifiutata per questo motivo.

## Gli ETH realmente collocati

L’hook colloca tutti gli ETH in attesa, compreso il 12% di ogni vendita, nella posizione corrispondente all’obiettivo. Le vendite successive possono consumare questi ETH: la riserva di ogni muro è finita. Un muro può essere finanziato senza attendere la copertura dell’intera offerta.

## Dal prezzo di lancio ai tick

Il contratto lavora con prezzi in ETH per CUBIT: `obiettivo = 0,4 × prezzo corrente + 0,6 × prezzo di lancio`. Il prezzo di lancio deriva dalla **FDV di lancio fissata al deployment**, divisa per i 21 milioni di CUBIT. La nuova versione adotta **3,75 ETH** di FDV; questo prezzo resta poi fisso e non segue il dollaro.

Gli esempi in unità di questa pagina applicano la stessa formula a una capitalizzazione. La loro base di 7 000 è illustrativa: non è una conversione dei 3,75 ETH scelti.

I tick arrotondano poi il livello eseguibile. ETH è `currency0`, quindi **un prezzo CUBIT più alto corrisponde a un tick del pool più basso**. L’obiettivo matematico, il tick effettivamente collocato e il prezzo netto di una vendita possono differire.

## Cosa deve mostrare l’interfaccia

Un’interfaccia deve distinguere il mercato corrente, la banda, il prossimo obiettivo, ogni muro attivo e la sua profondità, nonché gli ETH e i CUBIT in attesa. Una sola linea “floor” non riassume l’intero libro.

Il riferimento storico `floorPrice` descrive l’**ultimo muro finanziato**, che può essere più basso del precedente. Non va interpretato come un minimo globale garantito. [Leggere i dati della dapp](../utiliser/preuves.md).

<p class="source-note">Fonti: decisioni di design del 14 settembre 2026, <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> e <code>CubitHook._placeWall</code>.</p>
