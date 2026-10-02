---
description: "Die Grundlagen: CUBIT-Token, Uniswap-v4-Hook, Liquiditätsband und bei jedem Verkauf mit ETH finanzierte Walls."
section: "01 / VERSTEHEN"
reading: "5 MIN LESEZEIT"
---

# CUBIT in 5 Minuten

CUBIT ist ein ERC-20-Token mit einem ETH/CUBIT-Markt auf Uniswap v4. Das Protokoll stellt die Liquidität seines Pools selbst bereit: Sein **Hook** ist deren einziger Anbieter und wendet die Steuern nach den Regeln des Vertrags an.

Das Angebot ist auf **21 Millionen CUBIT** festgelegt, die einmalig erzeugt werden. Es gibt keine Funktion, um weitere zu erstellen. In der neuen Version werden die von den Walls zurückgekauften CUBIT **nicht mehr verbrannt**: Sie fließen in die Belohnungsreserve des Vaults.

> Diese Seite beschreibt die neue Version. Siehe [Versionsstatus](../securite/etat.md).

## Die beiden Bücher des Marktes

| Buch | Aufgabe | Was sich ändern kann |
| --- | --- | --- |
| Band | Eine einzige breite Position, beim Start mit 80 % des Angebots platziert; sie verkauft CUBIT an Käufer und kauft sie von Verkäufern zurück | Ihre Aufteilung zwischen CUBIT und ETH folgt dem Preis; die Position wird nie abgezogen |
| Walls | ETH-Positionen unterhalb des aktuellen Preises, finanziert durch Verkäufe | Ihr Inhalt ändert sich, wenn der Preis sie durchläuft; ihr Tick ändert sich nie |

Teamguthaben und die Belohnungsreserve des Vaults werden getrennt verbucht. Ein Gesamtsaldo reicht daher nicht aus, um die tatsächlich in den Walls verfügbaren ETH zu beschreiben.

## Was Swaps finanzieren

Für einen **Exact-Input-Kauf von 1 ETH**, ohne Gas:

- **0,97 ETH** fließen in den Swap-Anteil zum Pool, vor dessen eigenen LP-Gebühren.
- **0,03 ETH** gehen an den Teambereich.

Bei einem **Verkauf, der brutto 1 ETH erzielt**, erhält der Verkäufer **0,85 ETH**, **0,12 ETH** finanzieren die Walls und **0,03 ETH** gehen an das Team. Gas wird getrennt bezahlt.

Die neue Version zielt auf **0,01 % LP-Gebühren** ab. Diese Poolgebühr ist von den Steuern in Höhe von 3 % beim Kauf und 15 % beim Verkauf getrennt. [Die Steuern im Detail](taxes.md).

## Wie Walls entstehen

Bei **jedem Verkauf** leert der Hook zuerst die Walls, die der Preis vollständig durchlaufen hat, und platziert dann die wartenden ETH, darunter die 12 % des Verkaufs, in einer Wall am Ziel `0,4 × prix courant + 0,6 × prix de lancement`, das anhand des Preises nach dem Verkauf berechnet und auf den Tick gerundet wird. Zwei Finanzierungen, die auf denselben Tick fallen, summieren sich in einer einzigen Wall. Keine Wall wird danach verschoben.

Auf oder unter dem Startpreis läge dieses Ziel über dem Markt: Die Wall wird dann 1 % unter dem aktuellen Preis platziert, statt die Mittel auf einen späteren Verkauf warten zu lassen. Kein Wartungsaufruf ist nötig: Die Erstellung und das Leeren der Walls sind Teil des Verkaufs.

**Die Formel bestimmt den Standort der Wall; die Verkäufe bestimmen ihre Größe.** Ein angezeigtes Niveau beweist nicht, dass alle Inhaber auf diesem Niveau verkaufen könnten. [Das Ziel und die festen Walls](murs.md).

## Was beim Start geschieht

Der Start erfolgt in einer einzigen Transaktion:

- **80 % des Angebots**, also 16,8 Millionen CUBIT, werden im Band hinterlegt;
- **20 %**, also 4,2 Millionen CUBIT, fließen in die Belohnungsreserve des Vaults;
- der Deployer tätigt einen **Kauf über 0,1 ETH**, der wie jeder Kauf mit 3 % besteuert wird und dessen CUBIT nicht gesperrt sind.

Es gibt weder einen Airdrop noch eine Teamzuteilung. [Das Liquiditätsband](ladder.md).

## V1 und V2

**V1** ist der Markt: Token, Hook, Band, Walls und Swaps. **V2** fügt Vault, Momentum und Forge hinzu, die das Team öffnet, wann es dies beschließt: Momentum und die Forge sind seit dem 23. September 2026 geöffnet, der Vault seit dem 26. September 2026.

Die Teamadresse erhält den Teamanteil der Steuern und tauscht kompatible Peripheriemodule der Registry aus, die sie anschließend aktiviert; diese Befugnisse sind dauerhaft. Der Hook hat keinen Administrator: Niemand kann die Swaps oder den Mechanismus der Walls pausieren, und der Poolkern behält seine eigenen festen Identitäten.

Die nächsten Schritte stehen in der [Roadmap](../roadmap.md).

<p class="source-note">Quellen im Repository: <code>contracts/src/CubitToken.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitV2.sol</code> und die Designentscheidungen vom 14. September 2026, festgehalten in <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
