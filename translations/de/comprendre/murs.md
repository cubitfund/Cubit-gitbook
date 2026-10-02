---
description: "Die Formel bestimmt den Standort der Wall; die Verkäufe bestimmen ihre Größe. Bei jedem Verkauf berechnetes Ziel, Beispiele und an ihrem Tick feste Walls."
section: "01 / VERSTEHEN"
reading: "7 MIN + EIN INTERAKTIVES BEISPIEL"
search:
  keywords: [Wall, Walls, Ziel, Preis, Tiefe, Kapazität, Rücklauf, Formel, Verkauf, 16200, 44200, 28200]
---

# Das Ziel und die festen Walls

**Die Formel bestimmt den Standort der Wall; die Verkäufe bestimmen ihre Größe.** Eine Wall ist eine mit ETH finanzierte LP-Position an einem festgelegten Tick unterhalb des aktuellen Preises.

## Die Formel bei jedem Verkauf

`M` sei die Marktkapitalisierung nach dem Verkauf und `B` die Startbasis, jeweils in derselben Einheit:

<div class="formula">cible = M − (M − B) × 0,6<span class="line-break"></span>= 0,4 × M + 0,6 × B</div>

Der Koeffizient nimmt **60 % des Abstands zwischen Markt und Basis** zurück. Er erhält somit 40 % dieses Abstands oberhalb der Basis. Bei einer beispielhaften Basis `B = 7 000`:

| Markt nach dem Verkauf | Berechnung | Ziel der Wall |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0,6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0,6 | **44 200** |
| Rückkehr auf 60 000 | 60 000 − 53 000 × 0,6 | **28 200** |

Die dritte Berechnung geht von **60 000** aus, auch wenn der Markt zuvor 100 000 erreicht hat. Es gibt keine am historischen Höchststand ausgerichtete Sperre gegen ein Absinken. Das Ziel wird **bei jedem Verkauf** anhand des Preises neu berechnet, den dieser Verkauf hinterlässt: Es gibt keine Reserve mehr, die angesammelt und dann durch einen Wartungsaufruf platziert wird.

## Den Markt verändern

Das folgende Beispiel behält zwei bestehende Walls bei 16,2k und 44,2k bei und berechnet anschließend das Ziel der nächsten Wall. Die Werte verwenden dieselbe Kapitalisierungseinheit mit einer beispielhaften Basis von 7 000. Dieses Schema simuliert weder die Aufnahme noch Guthaben oder eine Transaktion.

<section class="wall-lab" aria-label="Lernrechner für das Ziel">
  <header><span>DAS ZIEL NACH DEM VERKAUF</span><span>FESTE BASIS: 7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">Markt nach dem Verkauf <output id="market-value" for="market-cap">60 000 Einheiten</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">Zurück auf 60k</button></div>
  </div>
  <div class="wall-levels" aria-label="Vergleich der Kapitalisierungsniveaus">
    <div class="level-row"><span>Bestehende Wall A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16,2k</b></div>
    <div class="level-row"><span>Bestehende Wall B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44,2k</b></div>
    <div class="level-row new-target"><span>Neues Ziel</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28,2k</b></div>
    <div class="level-row market"><span>Aktueller Markt</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>Ziel der nächsten Wall</span><strong id="target-value">28 200 Einheiten</strong></div>
  <p class="lab-explanation">Nur neue Finanzierungen folgen dem aktuellen Ziel. Die bestehenden Walls bleiben an ihrem Tick; die an jedem Niveau noch verfügbare ETH-Menge muss getrennt abgelesen werden.</p>
</section>

## Eine Wall pro Tick, nie verschoben

Einmal platziert, bleiben die ETH einer Wall an ihren Tick gebunden. Ein steigender oder fallender Markt verschiebt eine bestehende Wall nicht zum neuen Ziel.

- Eine Finanzierung, deren Ziel auf den Tick einer bestehenden Wall fällt, **verstärkt diese Wall**, statt eine zweite zu erstellen.
- Ein Verkauf kann eine Wall teilweise aufbrauchen: Ein Teil ihrer ETH kauft dann CUBIT zurück.
- Eine nur teilweise aufgebrauchte Wall **bleibt bestehen**. Steigt der Preis wieder, verkauft sie ihre CUBIT und füllt sich wieder mit ETH auf.
- Eine **vollständig durchlaufene** Wall wird von dem Verkauf geleert, der sie durchlaufen hat: Ihre CUBIT gehen ohne Burn an die Belohnungsreserve des Vaults, und ihre restlichen ETH fließen zurück zu den wartenden Mitteln.

Die Kennungen der Walls sind dauerhaft. Ein Tick-Index ermöglicht es, die von einem Verkauf betroffenen Walls wiederzufinden. [Durchlaufene Walls und Vault-Reserve](burn.md).

## Wenn das Ziel nicht platzierbar ist

Eine Wall ist eine Position aus 100 % ETH: Sie muss unterhalb des aktuellen Preises liegen. Liegt der Preis auf oder unter dem Startpreis, ergibt die Formel ein Ziel auf oder über dem Markt, das nicht rein in ETH finanziert werden kann.

In diesem Fall platziert der Hook die Wall **1 % unter dem aktuellen Preis**, auf den Tick gerundet, statt die Mittel warten zu lassen. Andernfalls könnten angesammelte Mittel auf einmal zu einem Preis platziert werden, den eine Transaktion durch einen Kauf unmittelbar davor hochgetrieben hat, um anschließend ihre CUBIT in diese Wall zu verkaufen. Der Hook entscheidet anhand des gerundeten Ticks, nicht anhand des exakten Ziels: Nahe dem Startpreis kann das gerundete 40/60-Ziel noch knapp unter dem Markt liegen und unverändert verwendet werden, also näher als 1 %.

Nur ein Betrag, der zu klein ist, um eine Position zu erzeugen, also Staub, ein möglicher Überschuss, wenn die angesteuerte Wall die Liquiditätsobergrenze eines Ticks erreicht — eine Grenze von Uniswap v4 —, und der Extremfall eines Preises ganz oben im Tick-Bereich, wo keine Wall unter den Preis passt, warten in `pendingFloorEth`. Ein späterer Verkauf platziert sie. Der Verkauf selbst wird aus diesem Grund nie abgelehnt.

## Die tatsächlich platzierten ETH

Der Hook platziert alle wartenden ETH, darunter die 12 % jedes Verkaufs, in der Position, die dem Ziel entspricht. Spätere Verkäufe können diese ETH aufbrauchen: Die Reserve jeder Wall ist endlich. Eine Wall kann finanziert werden, ohne auf eine Deckung des gesamten Angebots zu warten.

## Vom Startpreis zu den Ticks

Der Vertrag arbeitet mit Preisen in ETH pro CUBIT: `cible = 0,4 × prix courant + 0,6 × prix de lancement`. Der Startpreis ergibt sich aus der **beim Deployment festgelegten Start-FDV**, geteilt durch die 21 Millionen CUBIT. Die neue Version legt **3,75 ETH** FDV fest; dieser Preis bleibt danach fest und folgt nicht dem Dollar.

Die Beispiele in Einheiten auf dieser Seite wenden dieselbe Formel auf eine Kapitalisierung an. Ihre Basis von 7 000 dient der Veranschaulichung: Sie ist keine Umrechnung der festgelegten 3,75 ETH.

Ticks runden anschließend das ausführbare Niveau. ETH ist `currency0`, daher entspricht **ein höherer CUBIT-Preis einem niedrigeren Pool-Tick**. Das mathematische Ziel, der tatsächlich platzierte Tick und der Nettopreis eines Verkaufs können voneinander abweichen.

## Was die Oberfläche anzeigen muss

Eine Oberfläche muss den aktuellen Markt, das Band, das nächste Ziel, jede aktive Wall samt ihrer Tiefe sowie die wartenden ETH und CUBIT unterscheiden. Eine einzelne Zeile „floor“ fasst das gesamte Buch nicht zusammen.

Die historische Referenz `floorPrice` beschreibt die **zuletzt finanzierte Wall**, die niedriger als ihre Vorgängerin liegen kann. Sie darf nicht als garantiertes globales Minimum verstanden werden. [Die Daten der dApp lesen](../utiliser/preuves.md).

<p class="source-note">Quellen: Designentscheidungen vom 14. September 2026, <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> und <code>CubitHook._placeWall</code>.</p>
