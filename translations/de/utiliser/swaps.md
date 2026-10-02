---
description: "Der Ablauf für CUBIT-Käufe und -Verkäufe: Poolversion, Nettoquotierung, Slippage, Freigaben und Transaktionsbeleg."
section: "02 / NUTZEN"
reading: "5 MIN LESEZEIT"
---

# Kaufen und verkaufen

Die dApp bietet einen ETH/CUBIT-Tausch über den Router des ausgewählten Deployments. Die Steuern werden im Hook angewandt; der geschätzte Empfangsbetrag sollte die in der Quotierung enthaltenen Steuern bereits abziehen.

> Die an Ethereum angebundene dApp verwendet die aktuelle Version mit **0,01 % LP-Gebühren** und liest die ABI dieser Version. Solange der Markt nicht eröffnet ist, ist kein Tausch möglich. Eine Demonstration oder ein Simulationsmodus stellt keinen On-Chain-Zustand dar.

## Vor der Vorbereitung eines Swaps

Prüfen Sie das Netzwerk des Wallets, das angezeigte Deployment und den Datenblock. Planen Sie zusätzlich zum Tauschbetrag ETH für Gas ein. Die dApp muss einen nicht verfügbaren RPC oder veraltete Daten melden und eine Signatur auf Grundlage eines ungeprüften Zustands verhindern.

Eine Änderung von Konto, Netzwerk, Betrag oder Routeradresse erfordert eine neue Quotierung. Die Peripherieadressen können sich über die V2-Registry ändern.

## CUBIT kaufen

1. Wählen Sie einen ETH-Betrag. Bei Exact-Input ist die Kaufsteuer von 3 % in diesem Betrag enthalten.
2. Lesen Sie die geschätzte Nettoanzahl an CUBIT, die Gebühren und den durch die Slippage-Toleranz festgelegten Mindestempfang.
3. Prüfen Sie die Simulation und die vom Wallet angezeigten Details und signieren Sie anschließend.
4. Warten Sie auf einen erfolgreichen Beleg und die Aktualisierung der On-Chain-Guthaben.

Der Kauf verwendet native ETH über `msg.value`. Der CUBIT-Router nutzt für diesen Ablauf kein Permit2. In der neuen Version entnimmt ein Kauf CUBIT aus dem Band entlang seiner x·y=k-Kurve.

## CUBIT verkaufen

Der Verkauf kann eine **ERC-20-Freigabe** erfordern, mit der der Router die gewählte CUBIT-Menge übertragen darf. Das Frontend bereitet eine Genehmigung für den angeforderten Betrag vor.

Nach Bestätigung der Freigabe prüft die dApp vor dem Swap erneut das Konto, das Netzwerk, die Registry-Revision und die Aktualität der Quotierung. Waren die bestehenden Berechtigungen unzureichend, sind Freigabe und Verkauf zwei getrennte Transaktionen.

Der Verkauf zahlt ETH nach Abzug der Steuer von 15 % aus: 12 % der Brutto-ETH finanzieren die Walls und 3 % gehen an das Team. In der neuen Version leert der Verkauf die Walls, die er vollständig durchläuft, und platziert die wartenden ETH in einer Wall; der CUBIT-Router sendet anschließend die aufgenommenen CUBIT an die Reserve des Vaults.

## Mindestempfang und Frist

**Slippage** begrenzt die gegenüber der Quotierung akzeptierte Abweichung. Eine bereits in der Quotierung enthaltene Steuer ist kein Grund, willkürlich 15 Prozentpunkte Slippage hinzuzufügen.

In den gelesenen Frontend-Quellen ist eine Quotierung **30 Sekunden** lang aktuell. Die Transaktionsfrist wird aus dem Zeitstempel der Blockchain berechnet. Diese Prüfungen können eine Signatur nach langem Warten auf eine Freigabe verhindern; dann muss eine aktuelle Quotierung erneut geprüft werden.

Eine durch die Grenzen abgelehnte Transaktion schützt den vereinbarten Mindest- oder Höchstbetrag. Ihr Scheitern bedeutet nicht, dass diese Grenze entfernt werden sollte.

## Wenn die Transaktion nicht durchgeht

| Situation | Hilfreiche Handlung |
| --- | --- |
| Falsches Netzwerk oder geändertes Konto | Zum gewünschten Kontext zurückkehren und eine neue Quotierung anfordern |
| Abgelaufene Quotierung | Nettobetrag und Mindestempfang neu berechnen |
| Geänderter Router oder geänderte Revision | Aktuelle Adresse und neue Aktion prüfen; die alte Freigabe bleibt an den früheren Spender gebunden |
| Unzureichende Liquidität | Eine Quotierung für einen kleineren Betrag und die vorhandenen Positionen prüfen |
| Verkauf, der sehr viele Walls durchläuft | Den Verkauf aufteilen: Bei mehr als etwa 88 durchlaufenen Walls überschreitet er das Gaslimit einer Transaktion |
| RPC nicht verfügbar | Vor dem Signieren auf eine gültige On-Chain-Abfrage warten |
| Transaktion bereits gesendet | Hash und Beleg prüfen, bevor eine weitere vorbereitet wird |

Der Router lehnt eine nicht vollständig verbrauchte Eingabe und eine nicht vollständig erfüllte exakte Ausgabe ab. Die für eine zurückgesetzte Transaktion ausgegebenen Mittel werden von der EVM rückgängig gemacht, mit Ausnahme von Gas.

## Das Ergebnis kontrollieren

Ein Hash bedeutet, dass die Transaktion eingereicht wurde; nur der Beleg gibt Auskunft über ihren Erfolg. Prüfen Sie das Netzwerk des Explorers, den Status, den Empfänger und die Ereignisse `BuyTaxed` oder `SellTaxed`.

Die Referenzpreise der Walls ersetzen keine Quotierung für einen konkreten Auftrag. [Die Daten der dApp lesen](preuves.md).

<p class="source-note">Quellen: <code>dapp/src/chain/swap.ts</code>, <code>executeSwap.ts</code>, <code>deployment.ts</code> und <code>contracts/src/periphery/CubitRouter.sol</code>. Die Abnahme mit Browser- und mobilen Wallets bleibt von automatisierten Tests getrennt.</p>
