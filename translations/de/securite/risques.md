---
description: "Konkrete Grenzen: endliche Tiefe von Band und Walls, Gas durchlaufener Walls, Belohnungsreserve, Integrationen, Modulaustausch und Versionsnachweise."
section: "05 / PRÜFEN"
reading: "5 MIN LESEZEIT"
search:
  keywords: [Sicherheit, Risiken, Grenzen, Verluste, Audit, Reserve, Entnahme, Gas]
---

# Risiken und Grenzen

Das Band und die Walls sind LP-Positionen. Ihre Existenz definiert verfügbare Liquidität, ohne das Ergebnis eines Trades unabhängig von Preis, Gebühren oder Poolzustand zu machen.

> Die folgenden Grenzen sind nicht abschließend. Der Code kann Fehler enthalten, die von den Tests nicht aufgedeckt wurden.

## Preis und Ausführung

Das Band hält nur die von Käufern eingebrachten ETH: Seine Tiefe von 3 ETH beim Start ist virtuell. Kehrt der Preis zum Startpreis zurück, enthält es nur noch CUBIT. Die Walls wiederum enthalten nur die ETH, die Verkäufe dort platziert haben.

Der Markt, das Ziel der nächsten Wall, der Preis einer Wall und der bei einem Verkauf erhaltene Nettobetrag sind unterschiedliche Angaben. Verwenden Sie eine Quotierung für den vorgesehenen Betrag. Eine starke Änderung zwischen Quotierung und Ausführung kann zu einer Ablehnung durch den Mindestempfang oder die Eingabeobergrenze führen; Steuern, Poolgebühren und Gas bleiben reale Kosten.

## Walls und Buchhaltung

Jede durchlaufene Wall kostet den Verkauf, der sie leert, etwa 185 000 Gas. Da eine Transaktion durch EIP-7825 auf 16 777 216 Gas begrenzt ist, durchläuft ein Verkauf höchstens etwa 88 Walls: Darüber hinaus schlägt er ohne Verlust fehl und muss in mehrere Verkäufe aufgeteilt werden. Eine fehlgeschlagene Übertragung der aufgenommenen CUBIT blockiert den Verkauf nicht: Sie bleiben isoliert im Hook, und jeder kann die Übertragung erneut anstoßen.

Kein veröffentlichter Nachweis garantiert, dass ein Akteur die in den Walls angesammelten ETH nicht zu einem günstigen Kurs entnehmen kann, etwa indem er früh kauft und dann in Walls verkauft, die durch andere Verkäufe finanziert wurden.

Die Kontentrennung muss nach Käufen, Verkäufen, Aufnahmen, Belohnungen und Austauschen bestehen bleiben. Die Vertragsgrößen, die Verknüpfung der Bibliotheken und die Kompilierungsparameter gehören ebenfalls zum Prüfungsumfang.

## Vault und Reserve

Die Belohnung von 3 % pro Tag wird aus einer endlichen Reserve gezahlt: Bei diesem Tempo kann sich die Reserve erschöpfen, und die Auszahlungen enden. Eine Belohnung, die über einen Tag hinaus nicht abgerufen wird, verfällt.

Die als Belohnungen ausgezahlten CUBIT sind handelbar: Ihr möglicher Verkauf belastet den Markt wie jeder andere Verkauf. Die Startgebühren der Forge und die Token der Walls der Kindmärkte sind für den Governance-Vault bestimmt, dessen entsperrte Tranchen nur der Deployer abrufen kann, dauerhaft und ohne mögliche Übertragung.

## Integrationen und Module

Ein Drittanbieter-Router ruft nach einem Verkauf nicht zwangsläufig `deliverAbsorbed()` auf: Die aufgenommenen CUBIT warten dann bis zu einem öffentlichen Aufruf. Die Kompatibilität eines Aggregators muss mit den Hook-Steuern und der Poolversion getestet werden.

Austauschbare Module erfordern Vertrauen in zukünftige Entscheidungen des Teams: Es kann sie sofort und ohne Verzögerung austauschen und schützt den privaten Schlüssel seiner Adresse. Getter-Prüfungen sind kein Sicherheitsnachweis für den gewählten Code. Eine neue Adresse erfordert eine erneute Prüfung der Freigabe oder Signatur.

Der Hook hat keinen Administrator: Niemand kann die Swaps oder den Mechanismus der Walls pausieren, auch nicht bei einem Zwischenfall. Die Teamadresse behält dagegen dauerhafte Befugnisse über die Module der Registry.

## Frontend und Daten

Eine Anzeige kann eine Simulation, ein früheres Manifest oder veraltete Daten verwenden; die aktuelle dApp liest die im Einsatz befindliche Version. Die Oberfläche muss Netzwerk und Blöcke identifizieren, Ausfälle melden und Signaturen aus einem inzwischen inkonsistenten Kontext verhindern.

USD-Zahlen hängen von der gewählten Umrechnung ab: Die Start-FDV ist in ETH festgelegt und folgt nicht dem Dollar.

## Welche Aussagen Tests erlauben

Tests und Invariantenkampagnen liefern Nachweise für die tatsächlich untersuchten Fälle, Zustände und die geprüfte Revision. Die historischen Kampagnen betreffen das frühere Modell und validieren die neue Version nicht. Eine lange erfolgreiche Kampagne ist kein allgemeiner formaler Beweis.

Diese Ausgabe garantiert nicht, dass Verluste ausgeschlossen sind. Der [tatsächliche Versionsstatus](etat.md) erläutert, was getestet wurde, und die [Roadmap](../roadmap.md) die nächsten Schritte.

<p class="source-note">Quellen: <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>CubitHook.sol</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code> und, für die Historie, <code>audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md</code>.</p>
