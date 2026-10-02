---
description: "3 % beim Kauf, 15 % beim Verkauf, davon 12 % für die Walls, angestrebte 0,01 % LP-Gebühren: die Berechnungsgrundlagen verstehen."
section: "01 / VERSTEHEN"
reading: "5 MIN LESEZEIT"
search:
  keywords: [Steuern, Gebühren, fee, Prozentsatz, Kauf, Verkauf, Team, Wall, Walls]
---

# Steuern und ETH-Flüsse

Die **Steuern des Hooks** und die **LP-Gebühren des Pools** sind zwei unterschiedliche Vorgänge. Sie beziehen sich nicht auf dieselbe Grundlage und lassen sich nicht zu einer einzigen Steuer addieren.

Diese Sätze sind die der neuen Version und gelten im angebundenen Ethereum-Pool. Prüfen Sie den [Versionsstatus](../securite/etat.md) und die Quotierung des verwendeten Pools.

## Die Kaufsteuer

Die Gesamtsteuer beträgt **3 % des Brutto-ETH-Eingangs** und fließt vollständig in den Teamanteil. Bei Exact-Input ist sie in dem an den Router übergebenen Betrag enthalten.

| Bei einem Kauf von 1 ETH | Betrag | Ziel |
| --- | --- | --- |
| Swap-Anteil | 0,97 ETH | Pool, anschließend LP-Gebühren und Umwandlung in CUBIT |
| Teamanteil | 0,03 ETH | Teambuchhaltung |

Benötigt der Pool-Anteil bei einem Exact-Output-Kauf `x` ETH, beträgt die Gesamtsumme vor Gas unter Berücksichtigung ganzzahliger Rundungen ungefähr `x / 0,97`. Der Router wendet die vom Nutzer gewählte Eingabeobergrenze an und erstattet den Überschuss.

## Die Verkaufssteuer

Die Gesamtsteuer beträgt **15 % der Brutto-ETH-Ausgabe**: **12 % für die Walls und 3 % für das Team**.

| Bei einer Bruttoausgabe von 1 ETH | Betrag | Ziel |
| --- | --- | --- |
| Netto-ETH des Verkäufers | 0,85 ETH | Wallet des Empfängers |
| Finanzierung der Walls | 0,12 ETH | Wall am Ziel dieses Verkaufs oder, auf oder unter dem Startpreis, 1 % unter dem aktuellen Preis |
| Teamanteil | 0,03 ETH | Teambuchhaltung |

Der Verkäufer erhält somit **0,85 ETH**, vor den separat gezahlten Gaskosten. Für eine angestrebte Nettoausgabe von `x` ETH bei Exact-Output muss der Pool ungefähr `x / 0,85` ETH brutto bereitstellen, mit ganzzahligen Rundungen und entsprechend der tatsächlichen Quotierung.

**Verkäufe finanzieren direkt die Walls.** Die 12 % und 3 % werden auf die Brutto-ETH des Verkaufs berechnet: Es handelt sich nicht um 12 % der 15 % Steuer. Der Teamanteil geht vollständig an das Team.

## Die LP-Gebühren

Der Uniswap-v4-Parameter `fee` wird in Millionsteln angegeben:

| Version | Parameter | LP-Prozentsatz |
| --- | --- | --- |
| Neue Version | `100` | **0,01 %** |

`tickSpacing` und die Breite einer Wall sind Geometrieparameter und keine andere Darstellung des LP-Gebührensatzes. In den gelesenen Quellen verwendet der CUBIT-Pool einen Abstand von 10 Ticks.

LP-Gebühren werden nach der Mechanik des Pools auf den Swap-Anteil angewandt. Eine reale Quotierung berücksichtigt Rundungen, durchlaufene Ticks, Liquidität und mögliche v4-Protokollgebühren. **Wenden Sie die Steuer nicht erneut auf eine bereits netto angegebene Quotierung an.**

## Wohin die 12 % fließen

Bei jedem Verkauf leert der Hook zuerst die Walls, die der Preis vollständig durchlaufen hat, und platziert dann alle wartenden ETH, darunter diese 12 %, in einer Wall an dem Ziel, das anhand des Preises nach dem Verkauf berechnet wird. Existiert an diesem Tick bereits eine Wall, wird sie verstärkt. Auf oder unter dem Startpreis liegt dieses Ziel meist über dem Markt: Die Wall wird dann 1 % unter dem aktuellen Preis platziert. Nur Staub, der zu klein ist, um Liquidität zu erzeugen, ein Überschuss, wenn die Liquiditätsobergrenze eines Ticks erreicht ist, und der Extremfall eines Preises ganz oben im Tick-Bereich bleiben bis zu einem späteren Verkauf in `pendingFloorEth`.

Es gibt keinen Sweep mehr: Die frühere Übertragung eines Teils der ETH der Ladder in die Walls ist mit der Ladder verschwunden. [Das Ziel und die festen Walls](murs.md).

## Die vorgesehenen Einnahmen für V2

| Modul | Einnahmen | Was nicht zur Finanzierung dient |
| --- | --- | --- |
| Vault | CUBIT-Reserve: 20 % des Angebots beim Start, danach die CUBIT vollständig durchlaufener Walls | Hinterlegtes Kapital, CUBIT-Erzeugung, LP-Gebühren; keine Belohnungen in WETH |
| Forge | Startgebühr von 0,005 ETH, in ETH an den Governance-Vault des Launchpads gezahlt und nie an den startenden Account zurückerstattet | Entnahme von Mitteln der Walls für einen Kindmarkt |

Die Gebühren der Forge werden seit ihrer Öffnung am 23. September 2026 erhoben. Die Reserve des Vaults zahlt die Belohnungen seit der Öffnung des Vaults am 26. September 2026. Ihre Höhe hängt von der tatsächlichen Aktivität ab.

## Ein Kauf mit anschließendem Verkauf kostet nicht genau 18 %

Betrachtet man nur die proportionalen Steuern bei konstantem Preis und ohne Preiswirkung oder andere Gebühren, bleibt der Faktor `0,97 × 0,85 = 0,8245` erhalten. Der entsprechende Verlust beträgt somit **17,55 %**, nicht die mechanische Summe aus 15 und 3, angewandt auf denselben Betrag.

Bei einem tatsächlichen Kauf mit anschließendem Verkauf kommen Poolgebühren, Gas und Preisänderungen hinzu. Für eine konkrete Transaktion bleibt der von der Quotierung zurückgegebene Nettobetrag maßgeblich. [Kaufen und verkaufen](../utiliser/swaps.md).

<p class="source-note">Steuerverteilung: Designentscheidungen vom 14. September 2026. Code: <code>CubitHook._creditBuyTax</code>, <code>_creditSellTax</code>, <code>_placeWall</code> und <code>periphery/CubitRouter.sol</code>.</p>
