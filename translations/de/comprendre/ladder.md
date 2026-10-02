---
description: "Ein einziges breites Band, beim Start mit 80 % des Angebots platziert und nie abgezogen: die Handelsliquidität von CUBIT."
section: "01 / VERSTEHEN"
reading: "4 MIN LESEZEIT"
search:
  keywords: [Band, band, Liquiditätsband, Liquidität, TIDE, Kurve, x·y=k, Start, FDV, Ladder]
---

# Das Liquiditätsband

Die Handelsliquidität von CUBIT liegt in **einem einzigen breiten Band** nach dem Vorbild von TIDE. Der Hook platziert es beim Start und zieht es nie ab. Es ersetzt die frühere Ladder.

## Was das Band enthält

| Parameter | Festgelegter Wert |
| --- | --- |
| Einlage | 80 % des Angebots, also 16,8 Millionen CUBIT |
| Zusammensetzung beim Start | 100 % CUBIT, keine ETH |
| Preisbereich | Alle Preise oberhalb des Startpreises |
| Start-FDV | 3,75 ETH, also 3 ETH Tiefe für das Band |
| Abzug | Keiner: Die Position wird nie abgezogen |

Die untere Grenze des Bandes entspricht dem auf den Tick gerundeten Startpreis, sodass die Position zu Beginn keine ETH enthält. Darüber deckt sie die gesamte Preiskurve des Pools ab.

## Eine x·y=k-Kurve

Käufe und Verkäufe folgen der Kurve mit konstantem Produkt des Bandes. Ein Kauf legt dort ETH ein und entnimmt CUBIT: Der Preis steigt. Ein Verkauf bewirkt das Gegenteil: Der Preis sinkt.

Bei einer Start-FDV von 3,75 ETH sind die 16,8 Millionen CUBIT **zum Startpreis 3 ETH wert**. Zu Beginn verhält sich das Band wie ein x·y=k-Pool aus 16,8 Millionen CUBIT gegenüber 3 ETH. Diese 3 ETH sind **virtuell**: Sie bestimmen die Steigung der Kurve, aber das Band hält tatsächlich nur die von Käufern eingebrachten ETH.

## Was das Band nicht garantiert

Die ETH, die Verkäufer aus dem Band entnehmen können, sind diejenigen, die Käufer dort eingelegt haben. Kehrt der Preis zum Startpreis zurück, enthält das Band nur noch CUBIT: Es kann unterhalb dieses Preises keine mehr zurückkaufen.

Unterhalb des Startpreises kann ein Verkauf daher nur durch ETH bedient werden, die noch in Walls vorhanden sind. Die Tiefe von 3 ETH ist weder eine vom Protokoll hinterlegte ETH-Reserve noch ein Mindestpreis.

## Was mit der Ladder verschwunden ist

Das Band ersetzt das frühere bewegliche Buch. Entfernt wurden:

- die Ladder, ihre aufeinanderfolgenden Bänder und ihre Token-Reserve;
- der Cushion in ETH;
- `rebalance`, `raiseFloor`, der Sweep in die Walls und die Keeper-Prämien.

Kein Wartungsaufruf ist nötig, damit der Markt funktioniert: Es gibt keinen Keeper mehr.

## Das Band eines Forge-Kindmarkts

Ein von der Forge erstellter Kindmarkt folgt demselben Modell, mit einem Unterschied: **Er hinterlegt 100 % seines Angebots in seinem Band**. Er hat weder eine Vault-Reserve noch eine Teamzuteilung. Der Hook verlangt eine Einlage von mindestens 80 % des Angebots und platziert die gesamte Einlage im Band. [Momentum und Forge](../v2/momentum-forge.md).

## Das Band prüfen

Die Ansicht `band()` des Hooks gibt die Ticks und die Liquidität der Position zurück; das Ereignis `BandBootstrapped` wird beim Start emittiert. Der Lens stellt `bandEth` und `bandTokens` bereit, also die vom Band zum aktuellen Preis gehaltenen ETH und CUBIT, ohne LP-Gebühren. [Verträge und Integration](../developper/integration.md).

<p class="source-note">Quellen: <code>CubitHook._bootstrap</code>, <code>afterInitialize</code>, <code>band()</code>, <code>MIN_POOL_SUPPLY</code>, <code>CubitLens.bandEth</code> / <code>bandTokens</code> und <code>periphery/CubitForge.sol</code>. Designentscheidungen vom 14. September 2026.</p>
