---
description: "Markt, Band, Ziel, Walls, wartende Mittel und On-Chain-Daten im CUBIT-Dashboard unterscheiden."
section: "02 / NUTZEN"
reading: "4 MIN LESEZEIT"
search:
  keywords: [Proof, Nachweise, Dashboard, Daten, floor, Simulation, Tiefe, Band]
---

# Die Daten der dApp lesen

Die Proof-Seite dient dazu, angezeigte Zahlen mit den Zuständen und Ereignissen des Protokolls abzugleichen. Beginnen Sie mit **Netzwerk, Deployment, Version und Abfrageblock**, bevor Sie einen Betrag interpretieren.

> Die öffentliche dApp liest das im Einsatz befindliche Ethereum-Deployment und dessen ABI. Die folgenden Daten beschreiben, was eine Oberfläche unterscheiden muss.

## Die zu unterscheidenden Zahlen

| Angabe | Was sie beschreibt |
| --- | --- |
| Marktpreis | Aktueller Poolpreis, der vom Nettoergebnis für eine konkrete Menge abweicht |
| ETH des Bandes | Vom Band zum aktuellen Preis tatsächlich gehaltene ETH, von Käufern eingebracht |
| CUBIT des Bandes | CUBIT, die das Band noch zum Kauf anbietet |
| Ziel der nächsten Wall | Mit dem aktuellen Preis berechnetes Niveau, von einer finanzierten Position zu unterscheiden |
| Aktive Walls | Bereits finanzierte Positionen, jeweils mit ID, Tick und verbleibender Liquidität |
| Wartende ETH | Nicht platzierte Mittel der Walls: Staub, der zu klein für eine Position ist, oder ein Preis ganz oben im Tick-Bereich |
| Auf Übertragung wartende CUBIT | CUBIT durchlaufener Walls, isoliert im Hook bis zu ihrer Übertragung an den Vault |
| Belohnungsreserve | Vom Vault gehaltene CUBIT zur Bezahlung der Einleger, getrennt von den Einlagen |
| Umlaufangebot | Gesamtangebot abzüglich der CUBIT in den Walls, der auf ihre Übertragung wartenden CUBIT und der Belohnungsreserve der Vaults; im Vault hinterlegte CUBIT bleiben im Umlauf |

Das Niveau einer Wall und ihre verbleibenden ETH müssen zusammen betrachtet werden. Die ETH des Bandes und die der Walls gehören zu zwei getrennten Büchern.

## Was sich mit der neuen Version ändert

Die frühere Ansicht zeigte eine Ladder, einen Cushion, eine Burn-Warteschlange und eine Wartungsseite. Die neue Version ersetzt sie durch ein einziges Band, bei jedem Verkauf platzierte und geleerte Walls und eine Belohnungsreserve im Vault. Es gibt keine Keepers-Seite mehr.

Die historische Bezeichnung `floorPrice` beschreibt die zuletzt finanzierte Wall: Sie darf nicht als globales Marktminimum gelesen werden. Eine neue Wall kann niedriger als die vorherige platziert werden, wenn der Preis gefallen ist.

Die neuen Felder werden in der [Integration](../developper/integration.md) erläutert. Die an Ethereum angebundene dApp liest die Felder der aktuellen Version.

## Bruttopreis, Nettopreis und Quotierung

Eine Bruttoreferenz stellt ein Preisniveau der Position dar. Eine Nettoreferenz kann eine Bereichsgrenze, die LP-Gebühren, die Verkaufssteuer und eine Annahme zu v4-Protokollgebühren einbeziehen.

Der tatsächliche Verkauf hängt von der Menge, den durchlaufenen Positionen, Rundungen und Gas ab. Eine „net floor“-Referenz ist keine Berechnung der Wertentwicklung Ihres Wallets und ersetzt keine Quotierung.

## Die Datenmodi

| Anzeige | Interpretation |
| --- | --- |
| On-Chain, identifizierter Block | Auf dem angegebenen Deployment abgefragte Daten |
| Wird geladen | Erste Abfrage noch unvollständig |
| Veraltete Daten oder RPC-Ausfall | Letzter bekannter Zustand; keine Erlaubnis zum Signieren |
| Simulation oder Demonstration | Lokale Veranschaulichung des Mechanismus |

Prüfen Sie bei zukünftigen Veröffentlichungen die angekündigte Verfügbarkeit und die Adressen der dem Nutzer angebotenen Module.

## Die Prüfung wiederholen

Prüfen Sie die Identitäten von Token, Hook und Pool, danach die aktuellen Module der Registry und ihre `moduleRevision`. Gleichen Sie die Ereignisse mit dem Transaktionshash und ihrem kanonischen Block ab.

Die Proof-Seite ermöglicht es, Steuern und Walls zu verfolgen. Ein Screenshot oder früherer Bericht ersetzt diese Versionsidentifikation nicht. [Tatsächlicher Versionsstatus](../securite/etat.md).

<p class="source-note">Quellen: <code>CubitLens.sol</code>, <code>interfaces/ICubitLens.sol</code> und, für das Frontend, <code>dapp/src/chain/snapshot.ts</code>, <code>releases.ts</code> und <code>events.ts</code>.</p>
