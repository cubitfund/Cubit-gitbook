---
description: "Das Ereignisrelais betreiben: Dry-Run, Cursor, Modulrevisionen und Wortwahl zu den Walls; der Keeper hat keine Verwendung mehr."
section: "04 / ENTWICKELN"
reading: "4 MIN LESEZEIT"
---

# Dienste und Betrieb

Das Repository enthält zwei Node-Prozesse: einen **Keeper**, der zum früheren Modell gehört, und ein **Ereignisrelais**, das Veröffentlichungen vorbereiten kann. Eine lokale Konfiguration beweist nicht, dass ein Dienst durchgehend läuft.

## Kein Keeper mehr in der neuen Version

Der frühere Keeper rief `rebalance`, `raiseFloor` und den Burn der aufgenommenen Token auf. Diese Wartungsfunktionen sind weggefallen: Das Band wird nie neu geordnet, die Walls werden während der Verkäufe platziert und geleert, und der CUBIT-Router sendet die aufgenommenen CUBIT an den Vault.

Der Dienst `services/keeper` bleibt im Repository, hat aber keinen Zweck mehr und darf nicht gegen die neue Version betrieben werden. Es wird keine Prämie gezahlt: Warten aufgenommene CUBIT noch auf ihre Übertragung, etwa nach einem Verkauf über einen anderen Router, kann jedes Konto `deliverAbsorbed()` aufrufen.

## Das Ereignisrelais

`services/floor-bot` liest die Ereignisse, bereitet einen Text vor und speichert einen Cursor sowie die Deduplizierungsschlüssel `transactionHash:logIndex`.

Dry-Run- und Veröffentlichungsmodus haben getrennte Zustände. Die Cursor enthalten den Blockchain- und Hook-Kontext; auf den vom Dienst vorgesehenen Netzwerken werden finalisierte Blöcke verwendet. Eine Reorganisation oder ein inkonsistenter Checkpoint muss vor der Wiederaufnahme abgeglichen werden.

Das Relais speichert vor der Veröffentlichung einen `pendingPost` dauerhaft. Akzeptiert der externe Dienst die Nachricht, während der Prozess vor dem Speichern des Erfolgs stoppt, muss vor einem erneuten Versuch geprüft werden, ob die Nachricht bereits existiert: Eine lokale Datenbank und ein soziales Netzwerk können nicht gemeinsam committen.

Das GitBook führt keine Veröffentlichungen aus. Die tatsächliche Inbetriebnahme des Relais unterliegt einer getrennten betrieblichen Konfiguration und Autorisierung.

## Weiterentwicklung der Module

Der aktuelle Lens wird aus der Registry aufgelöst. Bewahren Sie während des gesamten Vorgangs die Identität des Kerns und den Revisionskontext.

Die Dienste lesen die ABI und die Ereignisse der beschriebenen Version. Ein an das frühere Modell angepasstes Relais darf ohne entsprechende Abnahme nicht als für die neue Version validiert dargestellt werden.

## Die Wortwahl an die Walls anpassen

Das frühere Relais meldete `FloorRaised`-Ereignisse, die es nicht mehr gibt. In der neuen Version kann bei jedem Verkauf eine Wall erstellt oder verstärkt werden (`WallFunded`), manchmal zu einem niedrigeren Preis als die vorherige Wall, und eine vollständig durchlaufene Wall wird geleert (`WallAbsorbed`), bevor ihre CUBIT an die Reserve des Vaults gehen (`AbsorbedDelivered`).

Das Relais muss daher die **betroffene Wall, ihr Niveau und die hinzugefügten oder aufgenommenen Mittel** nennen, ohne aus dem Namen eines Ereignisses einen globalen Anstieg abzuleiten. Frühere Meldungen wie „der Floor steigt immer“ beschreiben diese Regel nicht, und keine Ankündigung darf die Walls als Preisgarantie darstellen.

## Hilfreiche Betriebskontrollen

Verfolgen Sie RPC-Fehler, Konfigurationsabweichungen, die Cursor, das Alter des zuletzt verarbeiteten Blocks und ausstehende Veröffentlichungen. Bewahren Sie Wiederanlaufprotokolle und Versionsidentitäten ohne private Signaturdaten auf.

Eine Überwachung, die Prozesse neu startet, ersetzt nicht die Klärung eines inkonsistenten Checkpoints oder einer Registry-Änderung.

<p class="source-note">Quellen: <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> und <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
