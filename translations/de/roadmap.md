---
description: "Die Schritte der Neugestaltung, die kommenden CUBIT-Veröffentlichungen, ihre Zeitfenster und die Validierungsbedingungen."
section: "05 / PRÜFEN"
reading: "5 MIN LESEZEIT"
search:
  keywords: [Roadmap, Zeitplan, Öffnung, V1, V2, Neugestaltung, Schritte, Launchpad]
---

# Roadmap und Freigabekriterien

Der Zeitplan beschreibt eine Veröffentlichungsabsicht. **Die Veröffentlichungsfrequenz ersetzt keine Codevalidierung.** Eine Funktion, die Mittel bewegt, muss vor ihrer Freigabe vorbereitet, getestet und abgenommen werden.

Die Referenzen `roadmapdev.md` und die frühere Roadmap der dApp enthalten überholte Regeln. Diese Seite greift die Meilensteine auf und unterscheidet dabei beschlossene Arbeiten, geschriebenen Code und bereits bestätigte Versionen.

## Die aktuelle Voraussetzung

Das Protokoll wird derzeit neu gestaltet: **Ein einziges Liquiditätsband** ersetzt die Ladder, **die Walls werden bei jedem Verkauf platziert und geleert**, und der Vault zahlt eine Belohnung in CUBIT aus einer Reserve aus. Die festgelegte Start-FDV beträgt **3,75 ETH**.

Diese neue Version ist im Ethereum-Mainnet bereitgestellt, der Markt ist seit dem 22. September 2026 eröffnet. Das Sepolia-Deployment dient den Tests.

## Die Schritte der Neugestaltung

| Schritt | Inhalt | Status |
| --- | --- | --- |
| 1 | Breites Band beim Start; Entfernung der Ladder, von `rebalance`, von `raiseFloor` und der Keeper | Programmiert und lokal getestet |
| Vaults | Vault mit 3 % pro Tag in CUBIT und Governance-Vault des Launchpads | Programmiert und lokal getestet |
| 2 | Bei jedem Verkauf erstellte Walls; CUBIT durchlaufener Walls an den Vault; Token der Kindmärkte an den Governance-Vault | Programmiert und lokal getestet |
| 3 | Bereinigung: Entfernung des WETH-Flusses, der Pause und des Guardians sowie der ungenutzten Fehler | Programmiert und lokal getestet |
| 4 | Start in einer Transaktion: 80 % in das Band, 20 % in die Reserve des Vaults, Kauf über 0,1 ETH | Programmiert und lokal getestet |
| 5 | Neufassung der Tests und Invarianten | Noch nicht erfolgt |

## Die Meilensteine

| Meilenstein | Funktion | Status und Bedingung |
| --- | --- | --- |
| Tag 0 | V1-Markt | Neue Version auf Ethereum bereitgestellt, Markt am 22. September 2026 in Block 26.035.793 eröffnet |
| 23. September 2026 | Momentum | Geöffnet: schreibgeschützte App-Seite mit den aktiven, teilweise aufgebrauchten und durchlaufenen Walls jedes Tokens |
| 23. September 2026 | Öffentliche Forge | Geöffnet: für alle offenes Launchpad, an diesem Tag mit seinem Governance-Vault hinzugefügt, Startgebühr von 0,005 ETH |
| 26. September 2026 | mCUBIT Vault | Geöffnet: Sperre von 24 Stunden, Belohnung von 3 % pro Tag in CUBIT aus der Reserve |
| Noch festzulegen | Token des Launchpads | Noch nicht konzipiert; die Bestände des Governance-Vaults werden ihm als NAV dienen |

Keine Funktion öffnet sich von selbst: Das Team hat Momentum und die Forge am 23. September 2026 geöffnet, dann den Vault am 26. September 2026, jeweils durch ausdrückliche Transaktionen. Die Moduladministration durch die Teamadresse ist dauerhaft.

## Bedingungen für den Vault

Die Buchhaltung der Belohnungen muss Einlagen, Auszahlungen, Abrufen, der Obergrenze von einem Tag, Rundungen und Austausch standhalten, ohne CUBIT-Erzeugung, ohne Zahlung aus dem Kapital und ohne Zugriff auf die Mittel der Walls. Die Reserve wird beim Start gespeist, danach durch die durchlaufenen Walls.

## Bedingungen für Momentum und Forge

Momentum bleibt schreibgeschützt: die aktiven, teilweise aufgebrauchten und durchlaufenen Walls jedes Tokens. Die Forge muss die Isolierung der Kindmärkte und die Kontrolle der Vorlage bewahren; die Übertragung der Token ihrer Walls an den Governance-Vault ist seit dem 23. September 2026 auf Ethereum im Einsatz. Nichts öffnet sich durch bloßen Zeitablauf: Das Team hat das Launchpad durch ausdrückliche Transaktionen hinzugefügt und dann geöffnet.

## Bedingungen für eine Produktionsversion

Die Veröffentlichung muss ihre Identitäten, Kompilierungsparameter, verknüpften Bibliotheken, erwarteten Bytecodes und Berechtigungen offenlegen. Die Tests müssen die endgültigen Quellen prüfen und dieser Veröffentlichung zugeordnet sein.

Die Anpassung der dApp, einschließlich der Aufteilung von Verkäufen, die viele Walls durchlaufen, echte Wallet-Abläufe, Aggregatoren, Dienste und Überwachung ergänzen die lokalen Tests. Ein Deployment stellt keine automatische Abnahme dieser neuen Änderungen dar.

## Historische Ankündigungen neu einordnen

Ein „Floor, der nur steigt“, das Erreichen des Breakeven bei einer vorgegebenen Kapitalisierung, ein durch den Burn der Walls „deflationärer“ Token oder eine „vollständige Unveränderlichkeit“ beschreiben die neue Version und ihre Berechtigungen nicht.

Mitteilungen müssen die finanzierte Wall, ihr Ziel, die platzierten Mittel und die Protokollversion angeben. Historische Ergebnisse bleiben als solche in den [Quellen](sources.md) einsehbar.
