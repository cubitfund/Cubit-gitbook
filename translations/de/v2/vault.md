---
description: "Nicht übertragbare CUBIT-Einlage, Sperre von 24 Stunden und tägliche Belohnung von 3 % in CUBIT, ausschließlich aus einer Reserve gezahlt und auf einen Tag gedeckelt."
section: "03 / DIE V2-MODULE"
reading: "5 MIN LESEZEIT"
search:
  keywords: [Vault, Staking, Stake, Sperre, Lock, Auszahlung, Belohnung, Belohnungsreserve, Reserve, Claim, abrufen, mCUBIT]
---

# mCUBIT Vault

Der Vault ermöglicht, CUBIT in einer **nicht übertragbaren** Position zu hinterlegen und eine Belohnung **in CUBIT** zu erhalten. Sein Modell erzeugt keine CUBIT und gewährt keinerlei Recht an den Mitteln der Walls.

Der Name mCUBIT bezeichnet dieses Einlageangebot; der Code erzeugt keinen frei übertragbaren ERC-20-Belegtoken.

> **Seit dem 26. September 2026 auf Ethereum geöffnet.**

## Woher die Belohnung stammt

Die Belohnung wird **ausschließlich aus der Belohnungsreserve** des Vaults gezahlt, nie aus dem hinterlegten Kapital. Diese Reserve wird gespeist durch:

- die **20 % des Angebots**, also 4,2 Millionen CUBIT, die beim Start eingebracht werden;
- die **CUBIT vollständig durchlaufener Walls**, die nach den Verkäufen von `deliverAbsorbed()` gesendet werden;
- jede freiwillige Zuführung: Jedes Konto kann der Reserve mit `fundRewardReserve(amount)` CUBIT hinzufügen.

Die Reserve ist endlich: Ist sie leer, enden die Belohnungen. **Die Belohnung erfolgt ausschließlich in CUBIT**, abgerufen mit `claimCubit()`, und keine Rendite ist garantiert.

## Der Satz und seine Obergrenze

Die Belohnung beträgt **3 % der Einlage pro Tag**, anteilig berechnet nach der seit dem letzten Abruf verstrichenen Zeit.

Der abrufbare Betrag ist **auf einen Tag gedeckelt**: Nach 24 Stunden ohne Abruf steigt er nicht weiter. Um die volle Belohnung zu erhalten, muss täglich abgerufen werden; **der nicht abgerufene Überschuss verfällt**.

| Zeit seit dem letzten Abruf | Abrufbarer Betrag für 1 000 hinterlegte CUBIT |
| --- | --- |
| 12 Stunden | 15 CUBIT |
| 24 Stunden | 30 CUBIT |
| 48 Stunden | 30 CUBIT: Der zweite Tag verfällt |

Diese Beträge setzen eine ausreichende Reserve voraus. Enthält die Reserve weniger als den geschuldeten Betrag, wird nur ihr Saldo ausgezahlt.

## CUBIT hinterlegen

1. Prüfen Sie die Adresse des angebotenen Vaults und seine Anbindung an das Protokoll.
2. Erlauben Sie dem Vault, den gewählten Betrag zu übertragen.
3. Rufen Sie `stake(amount)` auf und warten Sie auf die Bestätigung.
4. Lesen Sie `balanceOf(account)`, `unlockAt(account)` und `pendingCubit(account)` im Einlagevertrag aus.

**Jede zusätzliche Einlage startet die Sperre von 24 Stunden für die gesamte Position dieses Wallets in diesem Vault neu.** Sie zahlt außerdem die bis dahin erworbene Belohnung aus und startet den Abrechnungstag neu.

Die hinterlegten CUBIT bleiben bestehende Token. Eine Einlage ist weder ein Burn noch eine Verringerung des Angebots.

## Abrufen und auszahlen

`claimCubit()` zahlt die erworbene Belohnung aus und startet den Abrechnungstag neu. Die Auszahlungssperre blockiert diesen Abruf nicht.

`withdraw(amount)` gibt die hinterlegten CUBIT zurück, sobald der Zeitstempel der Blockchain `unlockAt` erreicht. Eine Teilauszahlung ist möglich; sie zahlt zuerst die erworbene Belohnung aus.

Niemand kann diese Auszahlungen aussetzen. Sie unterliegen weiterhin den Regeln und der korrekten Funktionsweise des Vertrags, der die Position hält.

## Wenn der Vault ausgetauscht wird

Das Team kann den Vault jederzeit ohne Verzögerung austauschen. Der Austausch betrifft den für neue Einlagen angebotenen Vertrag und den, der die danach gesendeten aufgenommenen CUBIT erhält. **Die hinterlegten CUBIT, die Belohnungsreserve und die bereits verbuchten Entsperrzeitpunkte verbleiben im alten Vault.** Der Austausch verschiebt keine Nutzermittel.

Die Registry bewahrt die Liste der aufeinanderfolgenden Vaults. Prüfen Sie die gewählte Adresse, bevor Sie ein Guthaben abfragen, abrufen oder auszahlen. Eine Freigabe des vorherigen Vaults berechtigt den neuen nicht.

Die Registry verlangt einen neuen Vault, der an denselben Hook und denselben Token angebunden ist und keinen Stake hält. Der Austausch deaktiviert den Vault: Der neue Vertrag nimmt Einlagen erst nach seiner erneuten Aktivierung an.

## Die Grenzen des Moduls

Die Belohnung hängt vom Saldo der Reserve ab: Ein Satz von 3 % pro Tag kann sie erschöpfen, und die Auszahlungen enden dann. Die Prüfungen beim Austausch kontrollieren die erklärte Kompatibilität der Adressen; sie beweisen nicht die Sicherheit jedes Ersatzcodes. Die Buchhaltung der Reserve, die Obergrenze von einem Tag, der Eingang der CUBIT aus den Walls und die Auszahlungen früherer Vaults müssen für jede Veröffentlichung validiert werden.

<p class="source-note">Quellen: <code>periphery/CubitVault.sol</code> (<code>pendingCubit</code>, <code>claimCubit</code>, <code>fundRewardReserve</code>, <code>DAILY_REWARD_BPS</code>, <code>REWARD_PERIOD</code>, <code>LOCK_DURATION</code>), <code>CubitHook.deliverAbsorbed</code>, <code>CubitV2.setVault</code> und die Designentscheidungen vom 14. September 2026.</p>
