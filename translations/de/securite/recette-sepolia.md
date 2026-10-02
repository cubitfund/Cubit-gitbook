---
description: "Manueller Testplan auf Sepolia für die neue Version: Band, Swaps, Steuern, Walls, Vaults, Austausch, erwartete Ablehnungen und nummerierter Erfassungsbogen."
section: "05 / PRÜFEN"
reading: "NUMMERIERTER TESTPLAN"
search:
  keywords: [Abnahme, Test, Testnet, Sepolia, manuell, Checkliste, Plan, Schweregrad, Erfassung, Erfassungsbogen, Ablehnung]
---

# Manueller Testplan auf Sepolia

Diese Seite ist eine **von Hand ausführbare Checkliste** für das Sepolia-Testnetz, gedacht für eine Person mit einem Wallet. Jeder Fall trägt eine feste Nummer der Form `T-01`, die in einem Bericht zitiert werden kann.

> **Bevor Sie beginnen.** Dieser Plan bezieht sich auf die neue Version. Das öffentliche Manifest des Repositorys beschreibt das **im Einsatz befindliche** Sepolia-Deployment mit LP-Gebühren `100`: Dieser Plan gilt dafür. Ein Fall, der auf die getestete Version nicht zutrifft, wird als „außerhalb des Versionsumfangs“ vermerkt, niemals als „Fehlschlag“.

Die genannten Werte stammen aus dem Code der neuen Version unter `contracts/src/` und aus den Designentscheidungen vom 14. September 2026. Ein Verhalten, das nicht ermittelt werden konnte, ist mit **„beim Test zu bestätigen“** markiert.

## So verwenden Sie diesen Plan

Jeder Abschnitt stellt seine Fälle in einer Tabelle mit sechs Spalten dar. Die letzten beiden werden während der Abnahme ausgefüllt.

| Spalte | Was dort eingetragen wird |
| --- | --- |
| Fall | Die feste Kennung, `T-01` bis `T-110` |
| Vorbedingungen | Was vor dem Beginn zutreffen muss |
| Schritte | Die Aktionen in ihrer Reihenfolge |
| Erwartetes Ergebnis | Was Code und Entscheidungen vorsehen |
| Beobachtetes Ergebnis | Was geschehen ist, mit Transaktionshash oder Abfrageblock |
| Schweregrad | Leer, wenn konform; sonst Blockierend, Schwerwiegend, Geringfügig oder Kosmetisch |

| Schweregrad | Kriterium |
| --- | --- |
| Blockierend | Verlust oder Blockierung von Mitteln, nicht erhobene Steuer, verlorene Wall, aus dem Kapital gezahlte Belohnung |
| Schwerwiegend | Verhalten entgegen den Quellen, fehlende Ablehnung, falsch angezeigte Zahl |
| Geringfügig | Anzeigeabweichung ohne Folgen auf der Blockchain, ungenaue Meldung |
| Kosmetisch | Typografie, Layout, Beschriftung |

Eine **gemäß einem Ablehnungsfall abgelehnte Transaktion ist ein Erfolg**. Ein Hash bedeutet nur, dass die Transaktion eingereicht wurde: Nur der Beleg gibt Auskunft über den Erfolg.

**Manche Fälle laufen nicht über die Oberfläche.** In ihren aktuellen Quellen liest die dApp die ABI der im Einsatz befindlichen Version und stellt weder Aufträge mit exakter Ausgabe noch `claimTeam()` noch die detaillierten Abfragen der Walls bereit. Diese Fälle sind als „Direktaufruf“ markiert: Sie werden mit einem Werkzeug für Vertragsaufrufe auf den Adressen aus dem Manifest des getesteten Deployments ausgeführt.

## 1. Vorbereitung

Erfassen Sie diese Elemente **vor** dem ersten Swap: Sie dienen als Referenz für alle späteren Vergleiche.

- Das Netzwerk: Sepolia, Chain-ID `11155111`.
- Die Adressen des getesteten Deployments, aus seinem Manifest gelesen: Token, Hook, PoolManager, `poolId`, Router, Lens, V2-Registry, Vault, Launcher; dann, sobald das Launchpad hinzugefügt ist, Governance-Vault und Forge. **Kopieren Sie keinen privaten Schlüssel in Ihre Notizen.**
- Die festgeschriebenen Parameter: `fee`, `tickSpacing`, `LAUNCH_ETH`, `MIN_POOL_SUPPLY`, `launchTimestamp`, `moduleRevision`.
- Der Anfangszustand: `snapshot()` des Lens, `band()` des Hooks, `totalSupply()` und `totalBurned()` des Tokens, `pendingFloorEth`, `pendingAbsorbedTokens`, `wallCount()`, `activeWallCount()`, `teamAccrued`, `teamPaidCumulative`, `rewardReserve()` des Vaults und die **Blocknummer** der Abfrage.

Planen Sie Test-ETH **zusätzlich** zu den getauschten Beträgen ein: Jede Transaktion zahlt ihr Gas, und mehrere Fälle erfordern abgelehnte Transaktionen, die ebenfalls Gas verbrauchen.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-01 | Wallet installiert | Sepolia auswählen; die mit der getesteten Version verbundene dApp öffnen | Das Netzwerk wird erkannt; keine Aufforderung, auf einer anderen Blockchain zu signieren |  |  |
| T-02 | Neues Konto | Über einen Sepolia-Faucet mit Test-ETH ausstatten | Guthaben nach Aktualisierung im Wallet und in der dApp sichtbar |  |  |
| T-03 | Manifest liegt vor | Jede angezeigte Adresse mit der im Manifest vergleichen | Identitäten stimmen überein; `poolId`, `fee` und `tickSpacing` passen zusammen |  |  |
| T-04 | Noch kein Swap ausgeführt | `snapshot()` lesen und den Block notieren | Referenzwerte festgehalten, Block identifiziert |  |  |
| T-05 | Direktaufruf | `poolKey()` des Hooks lesen | `currency0` gleich der Nulladresse, `fee = 100`, `tickSpacing = 10`, `hooks` gleich dem Hook |  |  |
| T-06 | V2-Registry lesbar | `moduleRevision()` und die Moduladressen lesen | Revision notiert; jede Änderung während der Abnahme erfordert eine erneute Prüfung vor jeder Signatur |  |  |

## 2. Start und Band

Bei der Initialisierung des Pools platziert der Hook **seine gesamte Einlage** in einer einzigen Position `[minUsableTick, tickUpper]`, identifiziert durch `BAND_SALT`. `tickUpper` ist der auf den Abstand abgerundete Eröffnungstick, sodass die Position nur CUBIT enthält. Der Hook lehnt eine Einlage unterhalb von `MIN_POOL_SUPPLY`, also 80 % des Angebots, ab und verbrennt den Rundungsstaub.

Der vollständige Start überträgt außerdem 20 % des Angebots an die Reserve des Vaults und tätigt in derselben Transaktion einen Kauf über 0,1 ETH.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-07 | Start erfolgt, Direktaufruf | `band()` lesen | `lower = −887 270`; `upper` gleich dem auf das Vielfache von 10 abgerundeten Eröffnungstick, also `155 390` bei einer FDV von 3,75 ETH; Liquidität ungleich null |  |  |
| T-08 | Starttransaktion bekannt | Ihre Ereignisse lesen | `BandBootstrapped(lower, upper, liquidity, tokens)` einmal emittiert, mit den Werten von `band()`; `tokens` gleich der Einlage abzüglich Rundungsstaub |  |  |
| T-09 | Start ohne anfänglichen Kauf | `bandEth` und `bandTokens` in `snapshot()` vor jedem Swap lesen | `bandEth = 0`; `bandTokens` gleich der Einlage, bis auf Rundungen |  |  |
| T-10 | Start erfolgt, Direktaufruf | `token.balanceOf(hook)` lesen | Null, abgesehen von direkten Übertragungen Dritter: Der Hook behält nach der Initialisierung keine rohen CUBIT |  |  |
| T-11 | Direktaufruf | Versuchen, dem Pool Liquidität hinzuzufügen | Ablehnung `ExternalLiquidityForbidden`: Der Hook ist der einzige Liquiditätsanbieter |  |  |
| T-12 | Probe-Deployment | Den Pool mit einer Einlage unterhalb von `MIN_POOL_SUPPLY` initialisieren | Ablehnung `SupplyNotDeposited`; kein Band platziert |  |  |
| T-13 | Vollständiger Start | `rewardReserve()` des Vaults nach der Starttransaktion lesen | Reserve gleich 20 % des Angebots, also 4,2 Millionen CUBIT; keine Teamzuteilung und kein Airdrop |  |  |
| T-14 | Vollständiger Start | Den Kauf des Deployers in der Starttransaktion lesen | Kauf über 0,1 ETH; `BuyTaxed` mit 3 % für das Team; erhaltene CUBIT frei übertragbar |  |  |
| T-15 | Kauf bestätigt, Direktaufruf | Die erwartete Ausgabe aus den virtuellen Reserven des Bandes neu berechnen | Ausgabe konsistent mit der x·y=k-Kurve nach Steuer von 3 % und LP-Gebühren; zu Beginn 16,8 Millionen CUBIT gegenüber 3 virtuellen ETH — beim Test zu bestätigen |  |  |
| T-16 | Kauf und anschließender Verkauf der gekauften CUBIT | `bandEth` davor, dazwischen und danach lesen | `bandEth` steigt beim Kauf und kehrt dann zu seinem Ausgangswert zurück; es übersteigt nie die tatsächlich durch Käufe eingebrachten ETH |  |  |

## 3. Kauf- und Verkaufsabläufe

Der Router stellt `swapExactIn(key, zeroForOne, amountIn, amountOutMin, recipient, deadline)` und `swapExactOut(key, zeroForOne, amountOut, amountInMax, recipient, deadline)` bereit. `zeroForOne = true` kauft CUBIT mit ETH.

**In den aktuellen Quellen der dApp verwendet die Oberfläche nur die exakte Eingabe.** Der Nutzer gibt immer den Betrag ein, den er zahlt; die erhaltene Menge ist ein schreibgeschütztes Feld. Abläufe mit exakter Ausgabe müssen daher per Direktaufruf des Routers getestet werden.

Ein Kauf sendet native ETH als `msg.value`. Ein Verkauf sendet den Wert null und erfordert eine **ERC-20-Freigabe** der CUBIT an den Router: Die Oberfläche fordert eine Genehmigung **über den exakten Betrag** an, nie unbegrenzt, sodass ein größerer Verkauf eine neue Genehmigung verlangt.

Der Router lehnt Teilausführungen ab: Eine nicht vollständig verbrauchte exakte Eingabe löst `IncompleteInput` aus, eine nicht vollständig erfüllte exakte Ausgabe löst `InsufficientOutput` aus. Da die Steuer auf den angeforderten Betrag bemessen wird, schützt der Abbruch den Nutzer.

Aus den Quellen der dApp gelesene Einstellungen der Oberfläche, während der Abnahme zu prüfen: Slippage-Toleranz **standardmäßig 1,0 %**, Eingabe auf **zwei Dezimalstellen** und den Bereich `0` bis `99,99` begrenzt; Mindestempfang in Ganzzahlen berechnet und **auf den nächsten Wei aufgerundet**; Quotierung **30 Sekunden aktuell**; On-Chain-Frist = Zeitstempel der Blockchain **plus 120 Sekunden minus Alter der Quotierung**.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-17 | Ausreichendes ETH-Guthaben | Einen kleinen Betrag kaufen, zum Beispiel 0,001 ETH | Erfolgreicher Beleg; CUBIT gutgeschrieben; Ereignis `BuyTaxed` emittiert |  |  |
| T-18 | Hohes ETH-Guthaben | Einen hohen Betrag kaufen | Erfolgreicher Beleg; die Preiswirkung zeigt sich in der Quotierung, nicht im Steuersatz |  |  |
| T-19 | CUBIT im Wallet | Freigeben, dann verkaufen | Zwei getrennte Transaktionen; Netto-ETH erhalten; `SellTaxed` emittiert |  |  |
| T-20 | Vorheriger Verkauf bestätigt | Einen **größeren** Betrag als zuvor verkaufen | Eine neue Genehmigung wird angefordert: Die Freigabe galt dem exakten Betrag |  |  |
| T-21 | Swap-Bildschirm geöffnet | Die vorgeschlagene Toleranz ablesen, ohne sie zu ändern | Standardwert **1,0 %** |  |  |
| T-22 | Swap-Bildschirm geöffnet | `0.005`, dann `100`, dann einen negativen Wert eingeben | Eingaben abgelehnt, mit einer Meldung zum Bereich 0–99,99 und zu den zwei Dezimalstellen |  |  |
| T-23 | Aktuelle Quotierung | Die Toleranz auf ihren niedrigsten akzeptierten Wert setzen, eine Preisbewegung abwarten, dann signieren | Ablehnung `TooLittleReceived(received, minimum)`; kein Token verloren; die Oberfläche fordert nicht dazu auf, den Schutz zu entfernen |  |  |
| T-24 | Quotierung angezeigt | Mehr als 30 Sekunden ohne Aktion verstreichen lassen, dann signieren wollen | Die Quotierung gilt als veraltet und wird vor jeder Signatur neu berechnet |  |  |
| T-25 | Quotierung fast veraltet | Kurz vor dem Ablauf signieren und die übermittelte Frist ablesen | Die Frist beträgt 120 Sekunden **minus** das Alter der Quotierung: Eine 30 Sekunden alte Quotierung lässt etwa 90 Sekunden |  |  |
| T-26 | Direktaufruf | `swapExactIn` mit einer bereits abgelaufenen Frist aufrufen | Ablehnung `Expired`; keine Mittelbewegung |  |  |
| T-27 | Direktaufruf | `swapExactOut` für einen Kauf mit großzügiger Eingabeobergrenze aufrufen | Exakte Menge erhalten; ETH-Überschuss in derselben Transaktion an den Aufrufer erstattet |  |  |
| T-28 | Direktaufruf | `swapExactOut` mit einer Eingabeobergrenze aufrufen, die einen Wei unter dem erforderlichen Betrag liegt | Ablehnung `TooMuchRequested(required, maximum)` |  |  |
| T-29 | CUBIT-Guthaben größer als das, was Band und Walls zurückkaufen können, zum Beispiel als Belohnung erhaltene CUBIT | Dieses Guthaben mit exakter Eingabe über den Router verkaufen | Ablehnung `IncompleteInput`; die Steuer wird mit der Transaktion rückgängig gemacht — beim Test zu bestätigen |  |  |
| T-30 | Direktaufruf | Mit exakter Ausgabe mehr ETH anfordern, als das Buch bedienen kann | Ablehnung `InsufficientOutput`; keine Teilabrechnung |  |  |
| T-31 | Direktaufruf | Nacheinander einen Betrag null, einen Nullempfänger, einen inkonsistenten Wert `msg.value` und dann einen anderen Poolschlüssel senden | Jeweilige Ablehnungen `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` |  |  |
| T-32 | Kompatibler Drittanbieter-Router | Über eine Drittanbieter-Route kaufen und dann verkaufen | Die Hook-Steuern gelten |  |  |
| T-33 | Aufrufvertrag oder Transaktionsbündel | Einen Kauf und dann einen Verkauf in **derselben Transaktion** ausführen | Beide Teile werden getrennt besteuert |  |  |

## 4. Steuern und Buchhaltung

| Vorgang | Grundlage | Verteilung |
| --- | --- | --- |
| Kauf | 3 % des Brutto-ETH-Anteils | 100 % Teamanteil; die Zuweisung an die Walls ist ausdrücklich null |
| Verkauf | 15 % der Brutto-ETH-Ausgabe | 12 % an die Walls, 3 % an das Team |

Bei exakter Eingabe ist die Kaufsteuer im bereitgestellten Betrag **enthalten** und auf den nächsten Wei aufgerundet. Bei exakter Ausgabe kommt sie zum Pool-Anteil hinzu, sodass die auf die Gesamtsumme bezogene Steuer 3 % bleibt.

Bei einem Verkauf mit exakter Ausgabe beträgt die Steuer `ceil(sortie × 1500 / 8500)`: Der Pool erzeugt die angeforderte Ausgabe **plus** die Steuer. Bei einem Verkauf mit exakter Eingabe beträgt sie `ceil(brut × 15 %)`. Bei der Verteilung wird der Teamanteil abgerundet, und **der gesamte Rest in Wei geht an die Walls**.

In den aktuellen Quellen der dApp verlangt die Oberfläche, diese Sätze auf der Blockchain abzufragen, bevor sie einen Swap zulässt: Solange sie nicht geprüft sind, bleibt die Schaltfläche im Wartezustand.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-34 | Kauf bestätigt | `BuyTaxed(ethIn, toFloor, toTeam)` lesen | `toFloor` ist null; `toTeam` beträgt 3 % der Bruttoeingabe, auf den nächsten Wei aufgerundet |  |  |
| T-35 | Kauf bestätigt | `teamAccrued` davor und danach vergleichen | Anstieg gleich dem Teamanteil |  |  |
| T-36 | Verkauf bestätigt | `SellTaxed(ethOut, toFloor, toTeam)` lesen | `toFloor + toTeam` ergibt 15 % des Bruttobetrags; `toTeam` beträgt 3 % des Bruttobetrags; die Summe ist auf den Wei genau |  |  |
| T-37 | `teamAccrued` ungleich null, Direktaufruf | `claimTeam()` von einem beliebigen Konto aufrufen | Die Mittel gehen an die festgeschriebene Teamadresse; `TeamPaid(amount, cumulative)` emittiert; `teamAccrued` auf null zurückgesetzt |  |  |
| T-38 | `teamAccrued` gleich null, Direktaufruf | `claimTeam()` aufrufen | Der Aufruf schlägt nicht fehl und überträgt nichts |  |  |
| T-39 | Ein Kauf und dann ein Verkauf desselben Betrags | Anfangs- und End-ETH ohne Gas vergleichen | Der erhaltene Faktor nähert sich `0,97 × 0,85 = 0,8245`; die Abweichung erklärt sich durch LP-Gebühren, Preiswirkung und Rundungen |  |  |
| T-40 | Zwei Verkäufe sehr unterschiedlicher Größe | Die Steuern im Verhältnis zu den Bruttobeträgen vergleichen | Der Satz bleibt in beiden Fällen 15 %; keine Staffelung und keine Befreiung |  |  |

## 5. Automatische Walls

Bei jedem Verkauf, mit exakter Eingabe wie mit exakter Ausgabe, ruft der Hook `_collectCrossedWalls()` und danach `_placeWall()` auf. Er leert zuerst alle Walls, die der Preis vollständig durchlaufen hat, von der nächstgelegenen bis zur entferntesten, und platziert dann alle wartenden ETH am Ziel `0,4 × prix courant + 0,6 × prix de lancement`, das anhand des Preises **nach** dem Verkauf berechnet und auf den Tick gerundet wird. Liegt dieses Ziel nicht strikt oberhalb des Pool-Ticks, was auf oder unter dem Startpreis geschieht, wird die Wall 1 % unter dem aktuellen Preis platziert.

Eine geleerte Wall fügt ihre CUBIT zu `pendingAbsorbedTokens` hinzu und gibt ihre restlichen ETH, Gebühren und Staub, an `pendingFloorEth` zurück. Eine nur teilweise aufgebrauchte Wall bleibt bestehen. Nur ein Betrag, der zu klein ist, um Liquidität zu erzeugen, und der Extremfall eines Preises ganz oben im Tick-Bereich, wo keine Wall unter den Preis passt, lassen Mittel in `pendingFloorEth` warten: Der Verkauf wird deswegen nie abgelehnt. Der CUBIT-Router ruft anschließend `deliverAbsorbed()` in einem try/catch auf.

Die Referenz `floorPrice()` des Lens beschreibt die **zuletzt finanzierte Wall**, kein globales Minimum. Jede durchlaufene Wall kostet etwa 185 000 Gas: Innerhalb des Limits von 16 777 216 Gas einer Transaktion durchläuft ein Verkauf höchstens etwa 88 Walls.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-41 | Preis oberhalb des Startpreises | Verkaufen, dann die Walls lesen | `WallFunded(id, lower, addedEth, liquidity)` emittiert; mit den wartenden ETH, darunter den 12 % des Verkaufs, wird am Ziel-Tick eine Wall erstellt oder verstärkt, bis auf Rundungen; `pendingFloorEth` behält nur den nicht platzierten Restbestand |  |  |
| T-42 | Vorherige Situation | Das Ziel aus dem Preis **nach** dem Verkauf und dem Startpreis neu berechnen | Der Wert `lower` der Wall entspricht dem mit diesem Preis berechneten 40/60-Ziel, auf den Tick gerundet |  |  |
| T-43 | Zwei Verkäufe, deren Ziel auf denselben Tick fällt | `wallCount()` und `walls(id)` lesen | Eine einzige Wall: Beide Ereignisse `WallFunded` tragen dieselbe `id`, die Liquidität steigt, keine neue Kennung wird erstellt |  |  |
| T-44 | Mehrere Walls an verschiedenen Ticks | Mehrmals verkaufen und kaufen, dann `walls(id)` erneut lesen | Der Wert `lower` jeder Wall bleibt unverändert; keine Wall wird verschoben |  |  |
| T-45 | Aktive Wall unterhalb des Preises | Einen Betrag verkaufen, der die Wall teilweise aufbraucht, ohne sie zu durchlaufen | Die Wall bleibt aktiv, mit ETH und CUBIT; kein `WallAbsorbed`; `pendingAbsorbedTokens` unverändert |  |  |
| T-46 | Teilweise aufgebrauchte Wall | Kaufen, bis der Preis wieder über der Wall liegt | Die Wall hat ihre CUBIT verkauft und wieder ETH erhalten; ihre Kennung und ihr Tick sind unverändert |  |  |
| T-47 | Aktive Wall, Verkauf über den CUBIT-Router | Einen Betrag verkaufen, der die Wall vollständig durchläuft | `WallAbsorbed(id, cubit, ethRemaining)` und `TokensAbsorbed(amount, pendingAbsorbedTokens)`, dann `AbsorbedDelivered(sink, amount)` und `RewardReserveFunded` in derselben Transaktion; `rewardReserve()` steigt um diese CUBIT; `pendingAbsorbedTokens` fällt auf null zurück; `totalSupply()` und `totalBurned()` sind unverändert |  |  |
| T-48 | Preis nahe dem Startpreis, 40/60-Ziel nicht unter dem Markt | Einen kleinen, bedienbaren Betrag verkaufen, dann die Walls lesen | Der Verkauf gelingt; `WallFunded` emittiert; die Wall wird 1 % unter dem Preis nach dem Verkauf platziert, auf den Tick gerundet; `pendingFloorEth` behält nur den nicht platzierten Restbestand |  |  |
| T-49 | Situation aus T-48 | Erneut einen kleinen, bedienbaren Betrag verkaufen, dann `pendingFloorEth` lesen | `WallFunded` 1 % unter dem neuen Preis emittiert; `pendingFloorEth` behält nur Rundungsstaub: Von einem Verkauf zum nächsten sammelt sich kein Rückstand an |  |  |
| T-50 | Kompatibler Drittanbieter-Router | Über eine Drittanbieter-Route verkaufen und dabei eine Wall vollständig durchlaufen, dann `deliverAbsorbed()` von einem beliebigen Konto aufrufen | Steuern angewandt; `TokensAbsorbed` emittiert, und die CUBIT bleiben bis zum Aufruf, der `AbsorbedDelivered` emittiert, in `pendingAbsorbedTokens` |  |  |
| T-51 | Mehrere finanzierte Walls | `floorPrice()` und `netFloorPrice()` des Lens lesen, dann `wallAmountsPage(0, 500)` und die folgenden Seiten bis `activeWallCount`, alle im selben Block | Referenz der zuletzt finanzierten Wall, als solche dargestellt; die CUBIT der Walls sind die Summe der Seiten plus `pendingAbsorbedTokens`, genau einmal addiert |  |  |
| T-52 | Forge-Kindmarkt, vollständig durchlaufene Wall | `absorbedTokenSink()` des Kind-Hooks lesen, dann die Ereignisse des Verkaufs | Empfänger gleich `governanceVault()` der Forge; `AbsorbedDelivered` emittiert; Tranche `Deposited(token, from, amount, unlockAt)` 30 Tage gesperrt |  |  |
| T-106 | Viele in einem Verkauf zu durchlaufende Walls | Den Gasbedarf des Verkaufs schätzen, dann den Verkauf senden | Etwa 185 000 Gas pro durchlaufener Wall; bei mehr als etwa 88 Walls überschreitet der Verkauf 16 777 216 Gas und schlägt ohne Verlust fehl: den Verkauf aufteilen |  |  |
| T-107 | Probe-Deployment, dessen CUBIT-Empfänger die Übertragung ablehnt | Über den CUBIT-Router verkaufen und dabei eine Wall durchlaufen, dann `deliverAbsorbed()` erneut aufrufen | Der Verkauf gelingt; die CUBIT bleiben in `pendingAbsorbedTokens`; der Aufruf steht jedem Konto offen und schlägt fehl, solange der Empfänger ablehnt |  |  |

## 6. mCUBIT Vault

Der Vault zahlt eine Belohnung **in CUBIT**, die ausschließlich aus `rewardReserve` entnommen wird. Sie beträgt `DAILY_REWARD_BPS = 300`, also 3 % der Einlage pro Zeitraum von 24 Stunden (`REWARD_PERIOD`), anteilig berechnet und **auf einen Zeitraum gedeckelt**: Darüber hinaus verfällt der Überschuss. Sie übersteigt nie den Saldo der Reserve und wird nie aus dem Kapital gezahlt.

Jede Einlage startet eine Sperre von **24 Stunden** (`LOCK_DURATION`) für die gesamte Position des Wallets neu; eine Auszahlung vor Ablauf wird mit `Locked` abgelehnt. Eine Einlage, eine Auszahlung oder ein Abruf zahlt zuerst die erworbene Belohnung aus und startet den Zeitraum neu. Jedes Konto kann die Reserve mit `fundRewardReserve(amount)` speisen. Der Ablauf richtet sich nach dem Zeitstempel der Blockchain, nicht nach der Uhr des Browsers.

Die Belohnung wird **ausschließlich in CUBIT** gezahlt und mit `claimCubit()` abgerufen: Der Vault stellt keine Funktion für Belohnungen in WETH bereit.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-53 | Vault verfügbar, CUBIT im Wallet | Freigeben, dann hinterlegen | `Staked(user, amount, unlockAt)` emittiert; `unlockAt` gleich dem Zeitstempel des Blocks plus 24 Stunden |  |  |
| T-54 | Bestehende Position | Vor Ablauf erneut hinterlegen | Die Sperre wird **für die gesamte Position neu gestartet**; die erworbene Belohnung wird, sofern ungleich null, mit `CubitRewardClaimed` ausgezahlt, und der Zeitraum startet neu |  |  |
| T-55 | Sperre läuft | Eine Auszahlung anfordern | Ablehnung `Locked` |  |  |
| T-56 | Sperre abgelaufen | Einen Teil der Einlage auszahlen | Teilauszahlung akzeptiert; `Withdrawn` emittiert; die erworbene Belohnung wird zuerst ausgezahlt; der verbleibende Saldo bleibt hinterlegt |  |  |
| T-57 | Einlage von 1 000 CUBIT, ausreichende Reserve | `pendingCubit` nach 12 Stunden und dann nach 24 Stunden lesen | Etwa 15 CUBIT, dann 30 CUBIT |  |  |
| T-58 | Vorherige Situation | 48 Stunden ohne Abruf warten, dann `pendingCubit` lesen | Weiterhin 30 CUBIT: Der zweite Tag verfällt |  |  |
| T-59 | Erworbene Belohnung | `claimCubit()` aufrufen | CUBIT übertragen; `CubitRewardClaimed` emittiert; `rewardReserve` sinkt um den ausgezahlten Betrag; `pendingCubit` fällt auf null zurück |  |  |
| T-60 | Probe-Deployment mit kleiner Reserve | Eine Belohnung abrufen, die größer als die Reserve ist | Nur der Saldo der Reserve wird ausgezahlt; die Reserve fällt auf null; das Kapital wird nicht angetastet |  |  |
| T-61 | Direktaufruf | `fundRewardReserve(0)` und dann nach Freigabe `fundRewardReserve(x)` von einem beliebigen Konto aufrufen | Ablehnung `InvalidAmount`, dann `RewardReserveFunded(from, x)`; `rewardReserve` steigt um `x` |  |  |
| T-62 | Direktaufruf | `token.balanceOf(vault)` zu mehreren Zeitpunkten mit `totalStaked + rewardReserve` vergleichen | Das Guthaben des Vaults liegt nie unter dieser Summe |  |  |
| T-63 | Betrag null, Direktaufruf | `stake(0)` und dann `withdraw(0)` aufrufen | Ablehnung `InvalidAmount` in beiden Fällen |  |  |
| T-64 | Vault nicht an die aktuelle Registry angebunden | Eine Einlage versuchen | Ablehnung `Inactive` |  |  |
| T-65 | Offene Position | Die angezeigte Sperrdauer ablesen | Anzeige in Stunden, abgeleitet aus `LOCK_DURATION`: 24 Stunden |  |  |
| T-66 | dApp geöffnet | Nach einem Ablauf für Belohnungen in WETH suchen | Keiner: Nur die Belohnung in CUBIT wird angeboten |  |  |

## 7. Governance-Vault des Launchpads

Der Governance-Vault erhält die Startgebühren der Forge in ETH und die von den Walls der Forge-Kindmärkte aufgenommenen Token. **Jede Einlage ist 30 Tage gesperrt** (`LOCK_DURATION`), gerechnet ab ihrem eigenen Eingang. **Nur der Deployer** kann abrufen, dauerhaft und ohne Möglichkeit, dieses Recht zu übertragen, und nur die Tranchen, deren Datum verstrichen ist, von der ältesten zur neuesten. ETH wird unter dem Schlüssel `ETH()`, der Nulladresse, verbucht. Lesen Sie die ABI des getesteten Deployments vor der Abnahme erneut. Der Deployer kann die Sperre aller bestehenden und künftigen Einlagen mit `extendLock` verlängern; `lockExtension()` wächst nur und wird zu jedem Datum addiert.

Die automatische Übertragung aus den Walls der Kindmärkte wird durch T-52 geprüft, die Einlage der Startgebühr durch T-81. Die Fälle T-67 bis T-73 hinterlegen Test-Token per Direktaufruf; T-108 ruft das ETH einer Gebühr ab.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-67 | Test-Token, Direktaufruf | Freigeben, dann `deposit(token, amount)` aufrufen | `Deposited(token, from, amount, unlockAt)` emittiert; `unlockAt` gleich dem Zeitstempel des Blocks plus 30 Tage; `held(token)` steigt entsprechend |  |  |
| T-68 | Einlage jünger als 30 Tage | `claim(token, n)` vom Deployer aufrufen | Ablehnung `NothingToClaim` |  |  |
| T-69 | Entsperrte Tranche | `claim(token, n)` von einem anderen Konto aufrufen | Ablehnung `NotDeployer` |  |  |
| T-70 | Eine Einlage pro Tag über 7 Tage | Ab dem 30. Tag nach der ersten Einlage täglich abrufen | Pro Tag wird eine Tranche ausgezahlt, von der ältesten zur neuesten; die letzte 30 Tage nach der siebten Einlage; `Claimed(token, amount, tranches)` bei jedem Abruf |  |  |
| T-71 | Mehrere entsperrte Tranchen | `claim(token, 1)` aufrufen | Nur eine Tranche ausgezahlt; die nächste bleibt abrufbar |  |  |
| T-72 | Per einfacher Übertragung gesendete Token | `lockUntracked(token)` aufrufen und dann ohne neue Übertragung erneut aufrufen | Neue Tranche, ab dem ersten Aufruf 30 Tage gesperrt; der zweite Aufruf wird mit `NothingToLock` abgelehnt |  |  |
| T-73 | Gesperrte und entsperrte Tranchen | `claimable(token)` und `locked(token)` lesen | Der abrufbare Betrag plus der gesperrte Betrag ergibt `held(token)` |  |  |
| T-108 | Startgebühr aus T-81 vor mehr als 30 Tagen eingezahlt | `claim(address(0), 1)` von einem anderen Konto, dann vom Deployer aufrufen | Ablehnung `NotDeployer`, dann ETH an den Deployer ausgezahlt; `Claimed(address(0), amount, 1)` emittiert; `held(address(0))` sinkt um den ausgezahlten Betrag |  |  |
| T-109 | Gesperrte Tranchen | `extendLock(extra)` von einem anderen Konto, dann vom Deployer aufrufen | Ablehnung `NotDeployer`, dann `LockExtended(extra, lockExtension)` emittiert; jedes mit `tranche(token, i)` gelesene Datum verschiebt sich um `extra`; keine Funktion verkürzt die Sperre |  |  |

## 8. Forge

Die Forge ist ein öffentliches Launchpad, das als zukünftige Veröffentlichung vorgestellt wird. Sie ist nicht Teil des CUBIT-Starts: Sie wird danach zusammen mit ihrem Governance-Vault hinzugefügt. Notieren Sie ihre Adressen, sobald das Launchpad hinzugefügt ist.

Jedes Konto startet einen Kindmarkt gegen Zahlung der exakten Gebühr. Ein Forge-Kindmarkt hinterlegt sein gesamtes Angebot in seinem Band, die Forge erhält die Adresse des Governance-Vaults bei ihrer Erstellung, und jeder Start zahlt seine Gebühr von 0,005 ETH an diesen Vault, der sie behält: Der startende Account erhält sie nie zurück. Die Deployment-Salts sind an den startenden Account gebunden.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-81 | Forge verfügbar, beliebiges Konto | Einen Kindmarkt mit der exakten Gebühr von 0,005 ETH starten | `ChildLaunched(token, hook, launcher, team, fee)` emittiert; `BandBootstrapped` des Kindmarkts zeigt eine Einlage gleich seinem gesamten Angebot, bis auf Rundungen; der Governance-Vault emittiert `Deposited(address(0), forge, fee, unlockAt)`, mit `unlockAt` gleich dem Block-Zeitstempel plus 30 Tage und einer etwaigen Verlängerung; `pendingFloorEth` des übergeordneten Hooks unverändert |  |  |
| T-82 | Forge verfügbar | Einen Start mit falschem Wert, leerem Namen, Null-Team oder anderer Vorlage versuchen | Ablehnung: `wrong launch fee`, `invalid name`, `invalid team` oder `template mismatch` |  |  |
| T-110 | Salts eines Starts, von einem anderen Konto gesehen | Von einem zweiten Konto mit denselben Salts starten | Die Adressen des ersten Starts werden nicht übernommen: Die Salts sind an den startenden Account gebunden, und der zweite Start wird mit `child deployment failed` abgelehnt, wenn seine Hook-Adresse die Berechtigungen nicht trägt |  |  |

## 9. Austausch und Befugnisse

Die Authority der Registry kann vier Peripherieadressen jederzeit ohne Verzögerung austauschen: Vault, Router, Lens und Forge. Jeder Austausch emittiert `ModuleUpdated`, **erhöht `moduleRevision`** und schließt die betroffene Funktion, bis das Team sie wieder öffnet: Vault, Momentum oder Forge; der Austausch des Routers schließt keine Funktion. Ein Kandidat, der bereits registriert ist, an einen anderen Hook oder Token angebunden ist oder bereits Stake hält, wird mit `InvalidModule` abgelehnt.

Der Hook hat **keinen Administrator**, und niemand kann die Swaps oder den Mechanismus der Walls pausieren. Die Teamadresse behält dauerhafte Befugnisse: Sie erhält den Teamanteil der Steuern und tauscht die Module der Registry aus, die sie anschließend aktiviert.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-83 | Einlagen und Reserve im aktuellen Vault | Den Vault austauschen | Hinterlegte CUBIT, Belohnungsreserve und Fristen **bleiben im alten Vault**; keine Mittel verschoben |  |  |
| T-84 | Vault ausgetauscht | Im alten Vault abrufen, dann auszahlen, dann eine Einlage versuchen | Abruf und Auszahlung bleiben verfügbar; die neue Einlage wird mit `Inactive` abgelehnt |  |  |
| T-85 | Kandidat bereits registriert oder mit Stake | Den Wechsel versuchen | Ablehnung `InvalidModule` |  |  |
| T-86 | Austausch erfolgt | `moduleRevision()` und das Ereignis lesen; nach einem Austausch des Vaults eine Einlage in den neuen Vault versuchen | Revision erhöht; `ModuleUpdated(module, previous, current, revision)` stimmt überein; die Einlage wird bis zur erneuten Aktivierung des Vaults mit `Inactive` abgelehnt |  |  |
| T-87 | Freigabe an den alten Router erteilt | Den Router austauschen, dann einen Verkauf versuchen | Die alte Freigabe gilt nicht für den neuen Spender; eine neue Genehmigung wird angefordert |  |  |
| T-88 | Router ausgetauscht | Über den früheren Router tauschen | Der Swap bleibt möglich und die Hook-Steuern gelten; die Dapp nutzt den neuen Router |  |  |
| T-89 | Direktaufruf | Die ABI des bereitgestellten Hooks untersuchen | Keine Funktion erlaubt es, die Swaps oder den Mechanismus der Walls auszusetzen; der Hook hat keinen Administrator |  |  |
| T-90 | Direktaufruf | `snapshot()` des Lens lesen, dann die Wall-Seiten im selben Block | Der Snapshot enthält nur Felder zu Markt, Band, Walls und Konten, das Gesamtangebot, die Belohnungsreserve, die Anzahl aktiver Walls, den Abfrageblock und die beste Wall: keine Wall-Summen, und seine Kosten hängen nicht von der Anzahl der Walls ab; das Umlaufangebot entspricht `totalSupply` abzüglich der CUBIT der Walls und `rewardReserve`, und die gehaltenen CUBIT sind dieses Angebot abzüglich `bandTokens` |  |  |
| T-91 | Jederzeit nach dem Start | Kaufen und verkaufen | Die Swaps funktionieren normal: Kein Konto kann sie blockieren |  |  |

## 10. Erwartete Ablehnungsfälle

Diese Tabelle dient während der gesamten Abnahme als Referenz. Die automatischen Walls fügen dem Verkauf keine Ablehnungen hinzu: Kann eine Wall nicht platziert werden, warten die Mittel, und nach einer fehlgeschlagenen Übertragung warten die CUBIT.

> **Achtung.** In den aktuellen Quellen der dApp werden Vertragsfehler nicht übersetzt: Eine On-Chain-Ablehnung kann als rohe, in der Anzeige abgeschnittene Meldung erscheinen. **Notieren Sie für jede ausgelöste Ablehnung den genau angezeigten Text** und beurteilen Sie, ob er verständlich ist.

| Fehler | Was ihn auslöst | Was die Anwendung zeigen sollte |
| --- | --- | --- |
| `ExternalLiquidityForbidden` | Hinzufügen von Liquidität durch Dritte | Vorgang nicht möglich: Das Protokoll ist der einzige Liquiditätsanbieter |
| `SupplyNotDeposited` | Initialisierung mit einer Einlage unter 80 % des Angebots | Start nicht möglich, Einlage unzureichend |
| `Expired` | Transaktionsfrist überschritten | Quotierung abgelaufen, eine neue berechnen |
| `TooLittleReceived(received, minimum)` | Ausgabe unter dem akzeptierten Minimum | Slippage-Schutz ausgelöst |
| `TooMuchRequested(required, maximum)` | Eingabe über der akzeptierten Obergrenze | Schutz der Eingabeobergrenze ausgelöst |
| `IncompleteInput` | Exakte Eingabe nicht vollständig verbraucht | Betrag zu groß für die verfügbare Liquidität |
| `InsufficientOutput` | Exakte Ausgabe nicht vollständig erfüllt | Das Buch kann diese Ausgabe nicht bedienen |
| `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` | Ungültige Auftragsparameter oder an den Vault gesendeter Betrag null | Eingabefehler, ohne rohen Code |
| `Inactive`, `Locked` | Vault nicht an die aktuelle Registry angebunden oder Auszahlung vor Ablauf | Modul nicht verfügbar oder Entsperrzeitpunkt |
| `NotDeployer`, `NothingToClaim`, `NothingToLock`, `NothingToExtend` | Abruf oder Verlängerung beim Governance-Vault durch Dritte, Abruf vor Ablauf, Sperrung ohne neues Guthaben, Verlängerung um null | Vorbehaltene Aktion, nichts abzurufen, nichts zu sperren oder nichts zu verlängern |
| `NotAuthority`, `InvalidModule` | Austausch durch Dritte angefordert oder inkompatibler Kandidat | Austausch abgelehnt, mit Begründung |

Rein anwendungsseitige Ablehnungen werden ebenfalls erfasst: veraltete Quotierung, geänderter Swap-Kontext, Wallet auf einer anderen Blockchain, gewechseltes Konto, geänderte Modulrevision, noch nicht geprüfte Steuersätze.

## 11. Anwendung

Diese Fälle werden mit der dApp durchgeführt. Die genannten Verhaltensweisen der Oberfläche stammen aus ihren Quellen und werden während der Abnahme geprüft.

| Fall | Vorbedingungen | Schritte | Erwartetes Ergebnis | Beobachtetes Ergebnis | Schweregrad |
| --- | --- | --- | --- | --- | --- |
| T-92 | dApp geöffnet | Die zehn Sprachen der Sprachauswahl durchgehen | Jede Sprache zeigt übersetzte Inhalte ohne fehlenden Text oder Überlauf; Produktnamen bleiben bewusst auf Englisch |  |  |
| T-93 | Sprache gewählt | Neu laden, dann das Fenster unter 640 px verkleinern | Die Wahl bleibt von einer Sitzung zur nächsten erhalten; unter 640 px zeigt die Sprachauswahl nur noch die Flagge |  |  |
| T-94 | Andere Sprache als Englisch | Den Titel der Startseite mit der englischen Version vergleichen | Der Titel ist außerhalb des Englischen bewusst gekürzt; er darf weder überlaufen noch abgeschnitten werden |  |  |
| T-95 | Bildschirm von etwa 400 px | Jeden Bildschirm durchgehen | Kein horizontaler Überlauf; breite Bereiche scrollen in ihrem eigenen Container; die Schaltflächen bleiben erreichbar |  |  |
| T-96 | Fenster zwischen 768 und 1279 px | Die Navigation öffnen | Das kompakte Menü wird bis 1279 px verwendet; es schließt sich nach der Navigation |  |  |
| T-97 | Transaktion bestätigt | Jeden angezeigten Betrag mit den On-Chain-Werten am selben Block vergleichen | Die Beträge stimmen überein; Anzeigerundungen ändern den signierten Betrag nicht |  |  |
| T-98 | Vorgang in Vorbereitung | Mitten im Ablauf das Netzwerk im Wallet wechseln | Die Quotierung wird ungültig und die Signatur außerhalb des erwarteten Netzwerks abgelehnt; die Schaltfläche bietet zuerst den Netzwerkwechsel an und verlangt dann eine zweite Aktion zum Tauschen |  |  |
| T-99 | Vorgang in Vorbereitung | Mitten im Ablauf das Konto im Wallet wechseln | Guthaben, Genehmigung und Quotierung werden für das neue Konto neu berechnet; eine für das alte Konto vorbereitete Signatur wird abgelehnt |  |  |
| T-100 | Genehmigung erteilt, Swap nicht signiert | Die Modulrevision zwischen beiden Schritten ändern lassen | Die Anwendung validiert den Kontext erneut und geht nicht stillschweigend zu einem neuen Spender über |  |  |
| T-101 | RPC nicht verfügbar oder alte Abfrage | Den Zugang zum RPC unterbrechen und beobachten | Der Zustand wird als ungeprüft gemeldet, und die Aktionen werden deaktiviert |  |  |
| T-102 | Transaktion gesendet | Den Hash und dann den Beleg verfolgen | Die Oberfläche unterscheidet „eingereicht“ und „erfolgreich“; die Ereignisse sind in einem Sepolia-Explorer überprüfbar |  |  |
| T-103 | Eine On-Chain-Ablehnung ausgelöst | Den angezeigten Text vollständig erfassen | Die Meldung muss für einen Nutzer verständlich bleiben; jeden rohen technischen Code und jede abgeschnittene Meldung festhalten |  |  |
| T-104 | Chinesisch, Koreanisch und Japanisch | Diese Sprachen ohne Zugriff auf einen externen Schriftartendienst anzeigen | Die Zeichen werden korrekt angezeigt: Die Schriftarten werden von der Website bereitgestellt |  |  |
| T-105 | Proof-Bildschirm geöffnet | Das Band, die Walls und die wartenden Mittel ablesen | `bandEth`, `bandTokens`, die Walls, die wartenden ETH und die auf Übertragung wartenden CUBIT werden getrennt angezeigt; kein Bildschirm zeigt eine Ladder, Keeper oder einen Burn der Walls |  |  |

## 12. Erfassungsbogen

Jede Tabelle der vorherigen Abschnitte **ist** der Erfassungsbogen ihres Abschnitts: Füllen Sie die Spalten „Beobachtetes Ergebnis“ und „Schweregrad“ Fall für Fall aus. Notieren Sie für das beobachtete Ergebnis mindestens den Transaktionshash oder den Abfrageblock und dann das Festgestellte.

Dem Bericht beizufügende Zusammenfassung:

| Abschnitt | Fälle | Konform | Abweichungen | Höchster Schweregrad |
| --- | --- | --- | --- | --- |
| 1. Vorbereitung | T-01 bis T-06 |  |  |  |
| 2. Start und Band | T-07 bis T-16 |  |  |  |
| 3. Kauf und Verkauf | T-17 bis T-33 |  |  |  |
| 4. Steuern und Buchhaltung | T-34 bis T-40 |  |  |  |
| 5. Automatische Walls | T-41 bis T-52, T-106 und T-107 |  |  |  |
| 6. mCUBIT Vault | T-53 bis T-66 |  |  |  |
| 7. Governance-Vault | T-67 bis T-73, T-108 und T-109 |  |  |  |
| 8. Forge | T-81, T-82 und T-110 |  |  |  |
| 9. Austausch und Befugnisse | T-83 bis T-91 |  |  |  |
| 10. Ablehnungsfälle | Übergreifende Referenz |  |  |  |
| 11. Anwendung | T-92 bis T-105 |  |  |  |

Eine Abweichung bezieht sich **auf die Nummer des Falls**, niemals nur auf einen Screenshot. Fügen Sie Netzwerk, Adresse des Deployments, Block, Hash und Version der Anwendung bei.

## Grenzen dieses Plans

Dieser Plan beschreibt, was der Code der neuen Version und die Entscheidungen vom 14. September 2026 vorsehen. Er **stellt keine Validierung dar**: Eine erfolgreiche Abnahme auf Sepolia ersetzt die Testkampagnen nicht.

Die Punkte „beim Test zu bestätigen“ müssen beobachtet und dann in diese Seite übernommen werden.

<p class="source-note">Quellen: <code>contracts/src/CubitHook.sol</code>, <code>CubitLens.sol</code>, <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>libraries/BandLib.sol</code>, <code>libraries/WallLib.sol</code>, <code>periphery/CubitRouter.sol</code>, <code>CubitV2.sol</code>, <code>CubitVault.sol</code>, <code>CubitGovernanceVault.sol</code>, <code>CubitForge.sol</code>, <code>CubitLaunch.sol</code>, die aktuellen Abläufe von <code>dapp/src</code> und die Designentscheidungen vom 14. September 2026, festgehalten in <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
