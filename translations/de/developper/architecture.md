---
description: "Übersicht der CUBIT-Codebasis: Verträge, Band und Walls, Vaults, dApp und Dienste."
section: "04 / ENTWICKELN"
reading: "6 MIN LESEZEIT"
---

# Architektur und Codebasis

Das Repository umfasst Solidity-Verträge, eine React/Vite-dApp und zwei Node-Dienste. Dieses GitBook ist in `gitbook/` eigenständig: Sein Build liest weder private Konfigurationen noch Netzwerkdaten des Protokolls.

> Die hier beschriebene Version befindet sich auf dem Branch `redesign/tide-lp-autowalls-vault`.

## Die Verzeichnisse

| Verzeichnis | Zuständigkeit |
| --- | --- |
| `contracts/src` | Token, Hook, Bibliotheken, Schnittstellen und Peripherieverträge |
| `contracts/test` | Historische Foundry-Tests auf der früheren API; Tests der neuen Version in `test/redesign` |
| `contracts/audit` | Ergänzende Testumgebungen und Prüfungskampagnen |
| `contracts/script` | Foundry-Deployment-Skripte und auf einem lokalen Knoten wiederholbare Szenarien |
| `contracts/scripts` | ABI-Export, Prüfungen und Deployment-Verfahren |
| `contracts/deployments` | Öffentliche Versionsmanifeste und Historie |
| `dapp/src/chain` | Konfiguration, ABI, Abfragen, Quotierungen und Transaktionen |
| `dapp/src/pages` | Swap, Proof, Staking, Roadmap und V2-Module |
| `services/shared` | Gemeinsame Konfiguration, Clients, ABI und Ausführungsverfolgung |
| `services/keeper` | Dienst der früheren Wartung, in der neuen Version gegenstandslos |
| `services/floor-bot` | Abfragen von Ereignissen und Vorbereiten von Veröffentlichungen |
| `audit/reports` | Datierte Berichte und den Revisionen zugeordnete Nachweise |
| `gitbook/docs` | Französische Quellen dieser Dokumentation |

## Die Kernverträge

| Komponente | Zuständigkeit |
| --- | --- |
| `CubitToken` | ERC-20 mit einmaliger anfänglicher Ausgabe von 21 Mio.; Burn dem Hook vorbehalten |
| `CubitHook` | Steuern, Liquiditätsband, Platzierung und Leeren der Walls, Teamkonten, V2-Anbindung |
| `BandLib` | Preise, Umrechnungen und Rundung auf Ticks, Ziel der Walls |
| `WallLib` | Walls pro Tick: dauerhafte Kennung, Index der aktiven Walls, Finanzierung und Leeren durchlaufener Walls |
| `PoolManager` v4 | Poolzustand, Liquiditätspositionen, Swaps und Abrechnung |

Der Hook ist der einzige Liquiditätsanbieter des CUBIT-Pools: Jede andere Hinzufügung von Liquidität wird abgelehnt. Die Mittel werden in Positionen und über ERC-6909-Claims des PoolManagers verfolgt; das native ETH-Guthaben der Hook-Adresse ist daher kein ausreichendes Maß für die Reserven.

Das Band ist eine einzelne, durch `BAND_SALT` identifizierte Position. Jede Wall belegt eine Zelle von `tickSpacing` unter ihrem eigenen Salt. `WallLib` arbeitet auf dem Speicher des Hooks: Claims und Positionen bleiben dem Hook zugeordnet.

## Die Peripherieverträge

| Komponente | Zuständigkeit |
| --- | --- |
| `CubitRouter` | Exact-Input-/Output-Swaps, Slippage-Grenze, Frist, Abrechnung und Übertragung der aufgenommenen CUBIT nach jedem Verkauf |
| `CubitLens` | Abgeleitete Ansichten: Markt, Band, Walls, Konten, Umlaufangebot, gehaltene CUBIT und beste Wall |
| `CubitV2` | Stabile Modul-Registry, Revision und Verlauf der Vaults |
| `CubitVault` | CUBIT-Einlagen, Sperre von 24 Stunden und aus einer Reserve gezahlte Belohnung in CUBIT |
| `CubitGovernanceVault` | Governance-Vault des Launchpads: Startgebühren in ETH und Token der Walls der Kindmärkte, je Einlage 30 Tage gesperrt, zuzüglich einer etwaigen Verlängerung; Abruf und Verlängerung dauerhaft nur durch den Deployer |
| `CubitForge` | Öffentliches Launchpad für isolierte Kindmärkte, nach dem Start hinzugefügt; Startgebühr von 0,005 ETH an den Governance-Vault, dessen Adresse bei der Erstellung festgelegt wird |
| `CubitLaunch` | Start in einer einzigen Transaktion: 80 % des Angebots in das Band, 20 % in die Reserve des Vaults und Kauf des Deployers |

Die Teamadresse kann Router, Lens, Vault und Forge in der Registry jederzeit ohne Verzögerung austauschen und anschließend aktivieren; diese Befugnisse sind dauerhaft, und jeder Austausch deaktiviert die betroffene Funktion bis zu ihrer erneuten Aktivierung. Token, Hook, Poolidentitäten und der Registry-Anker unterliegen diesem Austauschmechanismus nicht, und der Hook hat keinen Administrator: Niemand kann die Swaps oder den Mechanismus der Walls pausieren.

## Der Ablauf einer Abfrage

```text
Frontend oder Dienst
    → öffentliches Manifest: Netzwerk, Kern, Registry
    → Registry an einem bestimmten Block: Module + Revision
    → Prüfung der Modulverknüpfungen
    → Lens und Hook-Ansichten am selben Block
    → Anzeige oder Simulation einer Aktion
```

Im Frontend löst `releases.ts` die Module auf, und `vault.ts` erhält die Abfrage früherer Vaults. Eine fehlende RPC-Antwort darf keine Signatur erlauben. Die Datenschicht der dApp liest die ABI der im Einsatz befindlichen Version.

## Der Ablauf eines Swaps

Das Frontend holt eine Quotierung und anschließend eine Simulation ein. Der Router öffnet den Abrechnungskontext des PoolManagers; der Hook wendet die Steuern auf den ETH-Anteil an, und der Swap folgt der Kurve des Bandes und der durchlaufenen Walls. Der Router gleicht anschließend die Deltas aus.

Bei jedem Verkauf leert der Hook in `afterSwap` die vollständig durchlaufenen Walls und platziert dann die wartenden ETH in einer Wall an dem Ziel, das anhand des Preises nach dem Verkauf berechnet wird, oder 1 % unter dem aktuellen Preis, wenn dieses Ziel nicht unter dem Markt liegt, also auf oder unter dem Startpreis. Am Ende des Verkaufs ruft der CUBIT-Router `deliverAbsorbed()` auf, um die aufgenommenen CUBIT an die Reserve des Vaults zu senden; ein Fehlschlag dieser Übertragung blockiert den Verkauf nicht.

Die Grenzen sind wesentlich: Der Router-Callback ist nur für den PoolManager während des erwarteten Vorgangs zugänglich, und der Payer stammt vom authentifizierten Aufrufer des Routers.

## Was die neue Version geändert hat

Das Band ersetzt die Ladder, und `rebalance`, `raiseFloor`, der Sweep und die Prämien sind entfernt. Die Walls werden während der Verkäufe platziert und geleert, und die CUBIT durchlaufener Walls fließen in die Reserve des Vaults, statt verbrannt zu werden.

Die historische Suite `contracts/test` verwendet die frühere API und kompiliert nicht mit der neuen Version; die Tests der neuen Version befinden sich in `test/redesign`. Die nächsten Schritte stehen in der [Roadmap](../roadmap.md), die getesteten Komponenten im [Versionsstatus](../securite/etat.md).

<p class="source-note">Quellen: die genannten Dateien im Repository, insbesondere <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> und die README-Dateien der Dienste.</p>
