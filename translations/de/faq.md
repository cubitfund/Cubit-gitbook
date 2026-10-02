---
description: "Antworten auf häufige Fragen zum Band, zu den bei jedem Verkauf finanzierten Walls, Gebühren, Vault, Berechtigungen und Versionen."
section: "05 / PRÜFEN"
reading: "KURZE ANTWORTEN"
---

# Häufige Fragen

## Was genau ist eine Wall?

Eine mit ETH finanzierte Liquiditätsposition im Pool an einem festgelegten Tick unterhalb des aktuellen Preises. Die Formel bestimmt ihren Standort, und die 12 % der Verkäufe bestimmen ihre Größe.

## Was ist das Band?

Die einzige Handelsposition: 80 % des Angebots, beim Start platziert, die alle Preise oberhalb des Startpreises abdeckt und nie abgezogen wird. Käufe und Verkäufe folgen ihrer x·y=k-Kurve. [Das Liquiditätsband](comprendre/ladder.md).

## Folgt das Ziel dem historischen Höchststand?

Nein. Es verwendet den Preis, den jeder Verkauf hinterlässt: `0,4 × prix courant + 0,6 × prix de lancement`. Bei einer beispielhaften Basis von 7 000 ergibt eine Rückkehr von 100k auf 60k **28,2k**. [Die Berechnung ansehen](comprendre/murs.md).

## Sinken bestehende Walls mit dem neuen Ziel?

Nein. Eine Wall bleibt an ihrem Tick. Eine Finanzierung, die auf denselben Tick fällt, verstärkt sie; ein Verkauf kann allerdings ihre ETH aufbrauchen.

## Werden die 12 % bei jedem Verkauf platziert?

Ja: Jeder Verkauf platziert die wartenden ETH, darunter seine 12 %, in einer Wall an dem Ziel, das anhand des Preises nach dem Verkauf berechnet wird. Auf oder unter dem Startpreis läge dieses Ziel über dem Markt: Die Wall wird dann 1 % unter dem aktuellen Preis platziert. Nur Staub, der zu klein für eine Position ist, und der Extremfall eines Preises ganz oben im Tick-Bereich warten auf einen späteren Verkauf.

## Sind die LP-Gebühren in den 15 % enthalten?

Nein. Die 15 % sind die Verkaufssteuer des Hooks; die Kaufsteuer beträgt 3 %. Der LP-Satz der neuen Version beträgt 0,01 % mit einer eigenen Berechnungsgrundlage des Pools. Der angebundene Ethereum-Pool wendet denselben Satz an. [Gebühren im Detail](comprendre/taxes.md).

## Was wird aus einer durchlaufenen Wall?

Eine nur teilweise aufgebrauchte Wall bleibt bestehen und füllt sich wieder mit ETH auf, wenn der Preis steigt. Eine vollständig durchlaufene Wall wird von dem Verkauf geleert, der sie durchlaufen hat: Ihre CUBIT fließen in die Belohnungsreserve des Vaults. [Die Erklärung ansehen](comprendre/burn.md).

## Kann ein Verkauf beliebig viele Walls durchlaufen?

Nein. Jede durchlaufene Wall kostet etwa 185 000 Gas, und eine Transaktion ist auf 16 777 216 Gas begrenzt: Ein Verkauf durchläuft höchstens etwa 88 Walls. Darüber hinaus schlägt er ohne Verlust fehl und muss aufgeteilt werden. [Risiken und Grenzen](securite/risques.md).

## Ist CUBIT deflationär?

In der neuen Version nicht mehr. Das Angebot bleibt ohne Minting auf 21 Millionen festgelegt, aber die von den Walls zurückgekauften CUBIT werden nicht mehr verbrannt: Sie speisen die Belohnungsreserve des Vaults.

## Braucht es noch Keeper?

Nein. `rebalance` und `raiseFloor` sind entfernt, und die Walls werden während der Verkäufe platziert und geleert. An einen Aufrufer wird keine Prämie gezahlt.

## Kann jemand Verkäufe blockieren?

Nein. Der Hook hat keinen Administrator, und niemand kann die Swaps oder den Mechanismus der Walls pausieren.

## Behält das Team Befugnisse?

Ja, dauerhaft. Die Teamadresse erhält den Teamanteil der Steuern und kann die Peripheriemodule der Registry jederzeit ohne Verzögerung austauschen und anschließend aktivieren. Diese Austausche berühren weder den Kern noch die bereits in den Vaults liegenden Guthaben. [Die Berechtigungen](securite/permissions.md).

## Sind die V2-Funktionen verfügbar?

Ja: Momentum und die Forge seit dem 23. September 2026, der Vault seit dem 26. September 2026. [Die V2-Funktionen](v2/prochaines-fonctionnalites.md).

## Was passiert, wenn ich meine Belohnung nicht täglich abrufe?

Der abrufbare Betrag ist auf einen Tag gedeckelt, also 3 % der Einlage. Nach mehr als 24 Stunden ohne Abruf verfällt der Überschuss. Die Belohnung ist außerdem durch den Saldo der Reserve begrenzt.

## Verlängert eine neue Einlage die Vault-Sperre?

Ja. Eine zusätzliche Einlage startet die Sperre von 24 Stunden für die gesamte Position dieses Wallets in diesem Vertrag neu. Die erworbene Belohnung kann unabhängig von der Auszahlungssperre abgerufen werden.

## Was passiert mit meinen Mitteln, wenn der Vault ausgetauscht wird?

Sie bleiben im früheren Vault, zusammen mit seiner Belohnungsreserve und Ihrem Entsperrzeitpunkt. Wählen Sie diesen früheren Vertrag, um Ihre Position abzufragen und Auszahlungen vorzunehmen. Die Mittel werden nicht automatisch an das neue Modul übertragen.

## Wohin gehen die von den Walls eines Forge-Kindmarkts aufgenommenen Token?

In den Governance-Vault des Launchpads, der auch die Startgebühren der Forge in ETH erhält. Jede Einlage ist dort ab ihrer Verbuchung 30 Tage gesperrt — sofort bei einer Einzahlung oder einer Startgebühr, bei direkt gesendeten Token erst beim Aufruf von `lockUntracked` —, zuzüglich einer etwaigen Verlängerung; danach kann nur der Deployer dieses Vaults sie abrufen: Dieses Recht ist endgültig und nicht übertragbar. Dieser Deployer kann die Sperre verlängern, aber nie verkürzen. [Momentum und Forge](v2/momentum-forge.md).

## Wer kann auf der Forge einen Token starten?

Jedes Konto, gegen Zahlung der exakten Startgebühr von 0,005 ETH, die an den Governance-Vault geht und nie erstattet wird. Die Forge war nicht Teil des CUBIT-Starts: Das Team hat das Launchpad am 23. September 2026 hinzugefügt und geöffnet. [Momentum und Forge](v2/momentum-forge.md).
