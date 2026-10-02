---
description: "Stand vom 26. September 2026: neue Version auf Ethereum bereitgestellt, Markt eröffnet, Vault, Momentum und Forge geöffnet."
section: "05 / PRÜFEN"
reading: "4 MIN LESEZEIT"
search:
  keywords: [Version, Status, Ethereum, Mainnet, Testnet, Sepolia, Validierung, Audit, Deployment, bereitgestellt, redesign]
---

# Tatsächlicher Versionsstatus

**Dieser Leitfaden beschreibt die neue Version von CUBIT.** Die angebundene dApp verwendet das Ethereum-Deployment dieser Version mit 0,01 % LP-Gebühren. Der Markt ist seit dem 22. September 2026 eröffnet, in Block 26.035.793.

Diese Ausgabe des Leitfadens ist auf den **26. September 2026** datiert. Sie stützt sich auf die Designentscheidungen, den Code der neuen Version und die Berichte des Repositorys.

## Drei getrennte Zustände

| Bereich | In dieser Ausgabe beschriebener Zustand |
| --- | --- |
| Designentscheidungen, festgeschrieben am 14. September 2026 | Kauf 3 % Team; Verkauf 15 % (12 % Walls, 3 % Team); einziges Band mit 80 % des Angebots; bei jedem Verkauf erstellte Walls; CUBIT durchlaufener Walls in die Reserve des Vaults; Vault mit 3 % pro Tag; Start-FDV von 3,75 ETH |
| Code der neuen Version | In der folgenden Tabelle aufgeführte Komponenten |
| An die dApp angebundenes Ethereum | Aktuelle Version: Kauf 3 %, Verkauf 15 %, davon 12 % für die Walls, LP-Fee 100 = 0,01 %, einzelnes Band mit 80 % und Walls bei jedem Verkauf, mit V2-Registry und austauschbaren Modulen |

Änderungen an lokalen Quellen ändern keine bereits bereitgestellten Verträge. Eine Synchronisierung der Dokumentation verschiebt keine Mittel eines früheren Pools.

## Die Komponenten im Produktivbetrieb

| Teil | Status |
| --- | --- |
| Breites Band beim Start, Entfernung der Ladder und der Wartung | Auf Ethereum im Einsatz |
| Bei jedem Verkauf platzierte und geleerte Walls, Übertragung ihrer CUBIT an den Vault | Auf Ethereum im Einsatz |
| Vault mit 3 % pro Tag in CUBIT, aus der Reserve gezahlt | Seit dem 26. September 2026 auf Ethereum im Einsatz |
| Governance-Vault des Launchpads: Startgebühren in ETH und Token der Forge-Kindmärkte | Seit dem 23. September 2026 auf Ethereum im Einsatz |
| Momentum: aktive, teilweise aufgebrauchte und durchlaufene Walls jedes Tokens | Seit dem 23. September 2026 auf Ethereum im Einsatz |
| Öffentliche Forge: isolierte Kindmärkte, Startgebühr von 0,005 ETH | Seit dem 23. September 2026 auf Ethereum im Einsatz |
| Belohnung des Vaults ausschließlich in CUBIT, Hook ohne Administrator | Im auf Ethereum bereitgestellten Code |
| Start in einer Transaktion: 80 % in das Band, 20 % in die Reserve des Vaults und Kauf über 0,1 ETH | Auf Ethereum im Einsatz |

Diese Komponenten sind seit dem 22. September 2026 auf Ethereum bereitgestellt, das Launchpad und Momentum seit dem 23. September 2026; der Vault ist seit dem 26. September 2026 für Einlagen geöffnet. Sie sind durch die Foundry-Tests, das Fuzzing, die Invarianten, die statische Analyse und die symbolische Verifikation des Repositorys abgedeckt. Die nächsten Schritte stehen in der [Roadmap](../roadmap.md).

## Was die historischen Berichte belegen

Der Sepolia-Bericht beschreibt das Deployment einer früheren Version, Prüfungen von Runtimes und Verknüpfungen, Käufe und Verkäufe zur Abnahme, eine Wall-Platzierung und die Prüfung der Ablehnung unzulässiger Aktionen.

Diese Nachweise gehören zu dieser Version. Sie testen weder das Band noch die bei jedem Verkauf erstellten Walls noch den neuen Vault.

Bei der historischen Revision `991fca9` umfasste die vollständige Solidity-Testsuite **133 erfolgreiche und 15 fehlgeschlagene Tests von insgesamt 148**. Diese Ergebnisse und ihre Grenzen stehen im Bericht zum veröffentlichten Stand. Sie sind keine Validierungszähler der neuen Version.

## Was keine vollständige Validierung darstellt

Eine erfolgreiche Kompilierung prüft die Erzeugung von Bytecode. Sie belegt allein weder Buchhaltungsinvarianten noch das Verhalten einer Reihe durchlaufener Walls, die Konsistenz des Frontends oder eine Transaktion auf dem gewählten Netzwerk.

Ebenso bedeutet der Vergleich von Runtime-Hashes nicht, dass die Quellen auf einem Explorer veröffentlicht wurden. Automatisierte Frontend-Tests ersetzen keine Abnahme mit einem echten Browser- oder mobilen Wallet.

Eine vollständige Validierung der neuen Version umfasst auch die Kontentrennung, das Ausbleiben einer Überentnahme aus dem Vault, den Eingang der CUBIT geleerter Walls in die Reserve und die Unmöglichkeit für einen Akteur, die ETH der Walls zu einem günstigen Kurs zu entnehmen.

## Welcher Quelle folgen

Für die neue Version ist die Referenz das Übergabedokument `contracts/docs/REDESIGN_HANDOFF.md` des Branchs `redesign/tide-lp-autowalls-vault`. Es hält die festgeschriebenen Entscheidungen und deren Umsetzung im Code fest.

Für die Historie bleibt der französische Bericht zur Revision `991fca9` der Ausgangspunkt. Die öffentlichen Manifeste unter `contracts/deployments/` identifizieren die bestehenden Deployments.

Die [Quellenseite](../sources.md) erläutert die Lesereihenfolge und die inzwischen historischen Dokumente.
