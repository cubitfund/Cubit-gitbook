---
description: "Die festen Identitäten des Kerns, das Fehlen eines Administrators des Hooks und die dauerhaften Befugnisse der Teamadresse über die Module der Registry."
section: "05 / PRÜFEN"
reading: "5 MIN LESEZEIT"
search:
  keywords: [Berechtigungen, Team, Setter, Austausch, Administrator, Authority, Admin, Governance]
---

# Berechtigungen und Austausch

CUBIT unterscheidet zwischen einem Kern mit festen Identitäten ohne Administrator und einer Teamadresse, die die Peripheriemodule verwaltet. **Die Befugnisse der Teamadresse sind dauerhaft.**

## Was fest bleibt

Token, Haupthook, PoolManager, poolId und Registry-Anker werden durch die Peripherie-Setter nicht ersetzt.

Der Token autorisiert seinen Hook über eine einmalige Anbindung. Die Sätze des Kerns, die Start-FDV und die Geometrie des Bandes haben keinen Setter, und das Band wird nach seiner Platzierung nie abgezogen. Neue Regeln, die den Kern ändern, erfordern eine neue Version, ihre Validierung und ihr Deployment; sie aktualisieren einen früheren Pool nicht automatisch.

## Kein Administrator des Hooks

Der Hook hat **keinen Administrator**, und niemand kann die Swaps oder den Mechanismus der Walls pausieren.

Keine Adresse kann daher einen Verkauf oder die Platzierung einer Wall aussetzen. Die Regeln des Hooks gelten so, wie sie bereitgestellt wurden.

## Die Rolle des Teams

Die Teamadresse, `TEAM_ADDRESS`, ist im Hook festgeschrieben und dient der Registry `CubitV2` als `authority()`. Ihre Befugnisse sind dauerhaft: Sie erhält den Teamanteil der Steuern, 3 % beim Kauf und 3 % beim Verkauf, und sie tauscht die Module der Registry aus und aktiviert sie anschließend. Sie kann den Vault, den Router, den Lens oder die Forge **jederzeit und sofort** austauschen, ohne Ankündigungsfrist. Die vier austauschbaren Adressen sind:

| Setter | Wesentliche Anbindungsprüfungen | Folge |
| --- | --- | --- |
| `setVault(next)` | Code vorhanden, gleicher Hook und gleicher Token, neuer Vault ohne Stake | Neuer Referenzvertrag für zukünftige Einlagen und für die danach gesendeten aufgenommenen CUBIT |
| `setRouter(next)` | Code vorhanden, gleicher Hook/PoolManager/poolId | Aktueller Router ausgetauscht: der von der Dapp genutzte |
| `setLens(next)` | Code vorhanden, gleicher Hook/PoolManager/poolId/Token | Aktueller Abfragevertrag ausgetauscht |
| `setForge(next)` | Code vorhanden, gleicher Hook, Governance-Vault mit Code | Referenz-Launchpad, beim Start nicht vorhanden, für zukünftige Starts registriert oder ausgetauscht, samt dem Governance-Vault, der deren Gebühren erhält |

Jede Änderung emittiert `ModuleUpdated`, erhöht `moduleRevision` und schließt die betroffene Funktion, bis das Team sie wieder öffnet: Der Austausch von Vault, Lens oder Forge schließt jeweils Vault, Momentum oder Forge; der Austausch des Routers schließt keine Funktion. Prüfen Sie vor einem Vorgang die neue Adresse und ihren Code.

## Die Tragweite eines Austauschs

Ein Austausch wirkt ab seiner Transaktion. Er ermöglicht es, festzulegen:

- wohin die von den Walls von CUBIT aufgenommenen CUBIT bei den folgenden Übertragungen gehen: Der Hook liefert sie an den registrierten Vault;
- wohin zukünftige Startgebühren gehen: Die registrierte Forge zahlt sie an ihren eigenen Governance-Vault;
- welchen Router die Dapp nutzt.

Er berührt nicht:

- den Kern: Token, Hook, Band, Walls und Steuern;
- die bereits in bestehenden Vaults liegenden Guthaben, Einlagen und Belohnungsreserve.

Das Team schützt den privaten Schlüssel dieser Adresse.

## Die Grenzen der Kompatibilitätsprüfungen

Getter, die die richtigen Adressen zurückgeben, belegen eine erwartete Anbindung, nicht die Sicherheit des gesamten Kandidatencodes. Sie beweisen weder die Abwesenheit eines Proxys noch bösartigen Verhaltens in einer zukünftigen Implementierung.

Das Team wählt somit den für zukünftige Vorgänge verwendeten Peripheriecode. Diese Befugnis macht es erforderlich, jeden Austausch, seinen Bytecode und seine Wechselwirkungen zu prüfen.

## Bereits hinterlegte Mittel

Ein Vault-Austausch überträgt weder die hinterlegten CUBIT noch die Belohnungsreserve des früheren Vertrags. Seine Positionen, Fristen und Auszahlungswege bleiben in diesem früheren Vault. Die Registry bewahrt die Liste der Vaults, und das Frontend muss diese Positionen weiterhin anzeigen.

Ein früherer Router bleibt für Swaps nutzbar und unterliegt weiterhin den Hook-Steuern; eine dem früheren Router erteilte Freigabe gilt nicht für den neuen.

Der Austausch von Forge betrifft zukünftige Starts; bereits erstellte Kindmärkte behalten ihre Verträge und den Governance-Vault der Forge, die sie gestartet hat.

Diese Setter reparieren einen fehlerhaften Vertrag nicht rückwirkend und verschieben keine Mittel, die er halten könnte. Die Möglichkeit, eine Auszahlung On-Chain aufzurufen, und ihre Verfügbarkeit im Frontend müssen getrennt geprüft werden.

## Der Governance-Vault des Launchpads

Der Governance-Vault hat weder einen Administrator noch eine vorzeitige Auszahlung. Er erhält die Startgebühren in ETH und die von den Walls der Kindmärkte aufgenommenen Token: Jede Einlage bleibt dort ab ihrem Eingang 30 Tage gesperrt; danach kann **nur sein Deployer** sie abrufen. Dieses Recht gilt dauerhaft, und keine Funktion kann es übertragen: Es ist ein ausdrückliches Vertrauen in dieses Konto. Dieser Deployer kann die Sperre des gesamten Vaults, für bestehende und künftige Einlagen, jederzeit verlängern; keine Funktion verkürzt sie.

## Freigaben und Signaturen

Eine Freigabe ist an einen **bestimmten Spender** gebunden. Sie folgt nicht der aktuellen Adresse der Registry. Das Frontend muss den Vorgang erneut validieren, wenn sich Revision oder Module ändern, insbesondere zwischen einer Freigabe und einem Swap.

Jede Aktion des Protokolls ist eine Transaktion: Prüfen Sie ihre Zieladresse und die Blockchain, bevor Sie sie signieren.

<p class="source-note">Quellen: <code>CubitV2.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>contracts/docs/MODULE_SETTERS.md</code> und die Frontend-Prüfungen <code>releases.ts</code> / <code>vault.ts</code>.</p>
