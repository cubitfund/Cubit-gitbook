---
description: "Poolidentitäten, austauschbare Module, Liquiditätsband, Walls und Übertragung der aufgenommenen CUBIT, Vaults, entfernte Funktionen, Einheiten und Integrationsereignisse."
section: "04 / ENTWICKELN"
reading: "10 MIN LESEZEIT"
search:
  keywords: [API, ABI, Integration, Vertrag, Adresse, band, Band, BAND_SALT, MIN_POOL_SUPPLY, bandEth, bandTokens, Walls, WallLib, wallCount, deliverAbsorbed, pendingAbsorbedTokens]
---

# Verträge und Integration

Eine Integration muss **die Blockchain, den Poolkern, die ABI und die Modulrevision** identifizieren. Eine aus einem früheren Bericht kopierte Routeradresse kann ausgetauscht werden; eine neue ABI kann mit dem historischen Pool inkompatibel sein.

> Die folgende ABI ist die des Codes der neuen Version. Exportieren Sie die ABI der validierten Veröffentlichung und prüfen Sie die Runtimes, bevor Sie einen Client anbinden.

## Poolidentität

Die `PoolKey` enthält `currency0`, `currency1`, `fee`, `tickSpacing` und `hooks`. Bei CUBIT ist natives ETH `currency0` und der CUBIT-Token `currency1`.

| Feld | Erwarteter Wert |
| --- | --- |
| `currency0` | Nulladresse, die natives ETH darstellt |
| `currency1` | Token des identifizierten Deployments |
| `fee` | `100` in der im Einsatz befindlichen Version, also 0,01 % |
| `tickSpacing` | `10` in den gelesenen Quellen |
| `hooks` | Hook des identifizierten Deployments |

Die poolId hängt von diesem gesamten Schlüssel ab. Nur `fee` in einem Frontend zu ändern, verwandelt einen früheren Pool nicht in ein neues Deployment.

## Module am selben Block auflösen

Lesen Sie zuerst die in `hook.v2()` verankerte Registry. Lösen Sie dann die Adressen der verfügbaren Module und `moduleRevision` am selben Block auf. Prüfen Sie ihre Anbindung an den Kern.

Das folgende Fragment dient **ausschließlich zum Lesen** und setzt einen bereits konfigurierten viem-Client sowie eine geprüfte Registry-Adresse voraus:

```ts
import { parseAbi, type Address, type PublicClient } from "viem";

const registryAbi = parseAbi([
  "function router() view returns (address)",
  "function moduleRevision() view returns (uint256)",
]);

export async function readRelease(
  client: PublicClient,
  registry: Address,
) {
  const blockNumber = await client.getBlockNumber();
  const [router, revision] = await Promise.all([
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "router", blockNumber }),
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "moduleRevision", blockNumber }),
  ]);
  return { blockNumber, router, revision };
}
```

Dieses Fragment prüft allein nicht alle Verknüpfungen und berechtigt zu keiner Signatur. Das Frontend des Repositorys prüft sie in `resolveRelease`, `readRelease` und `assertCurrentDeployment`.

Vergleichen Sie vor jeder Signatur die Module und die Revision mit dem bereits vom Nutzer geprüften Kontext. Leiten Sie eine Freigabe nicht stillschweigend um.

## Das Band abfragen

| Element | Ergebnis / Nutzung |
| --- | --- |
| `band()` | `(int24 lower, int24 upper, uint128 liquidity)` der einzigen Handelsposition |
| `MIN_POOL_SUPPLY()` | Bei der Initialisierung akzeptierte Mindesteinlage: 80 % des Angebots |
| `BAND_SALT()` | Salt der Bandposition, `keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | Einmalig bei der Initialisierung des Pools emittiertes Ereignis |
| Lens `bandEth()` / `bandTokens()` | Vom Band zum aktuellen Preis gehaltene ETH und CUBIT, ohne LP-Gebühren |

`lower` entspricht `minUsableTick` bei einem Abstand von 10, also −887 270. `upper` ist der auf den Abstand abgerundete Eröffnungstick des Pools: Bei einer Start-FDV von 3,75 ETH beträgt er 155 390. Eine Aufrundung würde die Position aktiv machen und ETH erfordern.

Der Hook legt **seine gesamte Einlage** in das Band. `afterInitialize` lehnt eine Einlage unterhalb von `MIN_POOL_SUPPLY` mit `SupplyNotDeposited` ab: Der Start des übergeordneten Marktes hinterlegt genau dieses Minimum, ein Forge-Kindmarkt hinterlegt sein gesamtes Angebot. Der Rundungsstaub wird verbrannt, sodass der Hook nach der Initialisierung weder rohe Token noch einen CUBIT-Claim behält.

Der Snapshot des Lens ersetzt die früheren Felder der Ladder und der Keeper durch `bandEth` und `bandTokens`. Diese Werte beziehen sich auf das Kapital der Position: Die im Band aufgelaufenen LP-Gebühren werden weder eingesammelt noch mitgezählt.

## Mehrere Walls abfragen

| Hook-Ansicht | Ergebnis / Nutzung |
| --- | --- |
| `wallCount()` | Anzahl historischer Kennungen, abweichend von der Anzahl aktiver Positionen |
| `activeWallCount()` | Anzahl aktiver Walls im abgefragten Zustand |
| `activeWallId(index)` | Dauerhafte ID an einem Index der aktuellen aktiven Liste |
| `latestWallId()` | ID der zuletzt finanzierten Wall; zuerst prüfen, ob eine Wall existiert |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | Summe der den Walls zugeordneten ETH-Restbestände |

Die Verkäufe erstellen, verstärken und leeren die Walls. Eine geleerte Wall verlässt die aktive Liste, behält aber ihre Kennung und ihren Tick.

Die Indizes der aktiven Liste können sich nach einer Aufnahme ändern. **Verwenden Sie die Wall-ID als Identität**, nicht ihren Durchlaufindex. Lesen Sie die Anzahl und die Elemente am selben Block.

`fundedEth` stellt die Summe der tatsächlich an diesem Tick platzierten Mittel dar; sie darf nicht als verbleibende Tiefe angezeigt werden. `idleEth` bezeichnet einen an die Wall gebundenen Restbestand, getrennt von ihrer platzierten Liquidität. Die obere Grenze einer Wall ist `lower + tickSpacing`. Die für die Walls bestimmten Mittel, die nicht platziert werden konnten, bleiben getrennt in `pendingFloorEth`.

Die historischen Felder `floorPrice` und `netFloorPrice` des Lens beschreiben die zuletzt finanzierte Wall; sie fassen nicht alle Niveaus zusammen. Für die dem Markt am nächsten liegende aktive Wall lesen Sie `bestWallPrice` und `netBestWallPrice`.

## Durchlaufene Walls und Übertragung der CUBIT

Bei jedem Verkauf, mit exakter Eingabe wie mit exakter Ausgabe, ruft `afterSwap` zuerst `_collectCrossedWalls()` und dann `_placeWall()` auf. Alle Walls, die der Preis vollständig durchlaufen hat, werden geleert, von der nächstgelegenen bis zur entferntesten: Ihre CUBIT kommen zu `pendingAbsorbedTokens` hinzu, und ihre restlichen ETH, realisierte Gebühren und Staub, fließen zurück in `pendingFloorEth`. `_placeWall()` platziert anschließend alle wartenden ETH an dem anhand des Preises nach dem Verkauf berechneten Ziel. Liegt dieses Ziel nicht strikt oberhalb des Pool-Ticks, was auf oder unter dem Startpreis geschieht, platziert es die Wall mit `BandLib.underMarketWallTarget` 1 % unter dem aktuellen Preis. Nur ein Betrag, der zu klein für eine Position ist, und der Extremfall eines Preises ganz oben im Tick-Bereich, wo keine Wall unter den Preis passt, bleiben in `pendingFloorEth`.

| Element | Ergebnis / Nutzung |
| --- | --- |
| `pendingAbsorbedTokens()` | CUBIT durchlaufener Walls, bis zu ihrer Übertragung isoliert im Hook als Claims des PoolManagers gehalten |
| `deliverAbsorbed()` | Öffentliche, für alle offene Übertragung dieser CUBIT an `absorbedTokenSink()`; der Aufrufer wählt weder Empfänger noch Betrag |
| `absorbedTokenSink()` | Vault der Registry bei CUBIT; bei einem Forge-Kindmarkt `governanceVault()` der Forge, die seinen Token bereitgestellt hat |
| `WallFunded(id, lower, addedEth, liquidity)` | Am Ziel-Tick erstellte oder verstärkte Wall |
| `WallAbsorbed(id, cubit, ethRemaining)` | Vollständig durchlaufene und geleerte Wall |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | Von einem Verkauf zur Übertragung vorgemerkte CUBIT |
| `AbsorbedDelivered(sink, amount)` | An ihren Empfänger gesendete CUBIT |

Bei CUBIT ruft `deliverAbsorbed()` die Funktion `fundRewardReserve` des Vaults auf. Bei einem Forge-Kindmarkt, der keine Registry hat, überträgt es die Token an den Governance-Vault und ruft dann `lockUntracked` auf. Der CUBIT-Router ruft es nach jedem Verkauf in einem try/catch auf: Eine fehlschlagende Übertragung blockiert den Verkauf nie, und jeder kann die Übertragung erneut anstoßen. Der Lens summiert die Walls nicht mehr in `snapshot()`: `wallAmountsPage(start, count)` liefert das ETH und die CUBIT eines Wall-Abschnitts, und die auf Übertragung wartenden CUBIT werden über das Feld `pendingAbsorbedTokens` genau einmal zur Summe der Seiten addiert.

Jede durchlaufene Wall kostet etwa 185 000 Gas. Mit dem durch EIP-7825 festgelegten Limit von 16 777 216 Gas pro Transaktion durchläuft ein Verkauf höchstens etwa 88 Walls; darüber hinaus schlägt er ohne Verlust fehl und muss aufgeteilt werden.

## Die entfernten Funktionen

Die neue Version entfernt die API der Ladder, der Wartung, des WETH-Flusses und der Finanzierung der Walls durch die Forge und benennt die der aufgenommenen Token um. Ein Client, der diese Elemente noch aufruft, zielt auf die frühere Version.

| Vertrag | Entfernte Elemente |
| --- | --- |
| Hook, Funktionen | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| Hook, umbenannte Funktionen | `burnAbsorbed()` wird zu `deliverAbsorbed()`; `pendingBurnTokens()` wird zu `pendingAbsorbedTokens()` |
| Hook, Konstanten | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| Hook, Ereignisse und Fehler | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens, Funktionen | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens, Snapshot-Felder | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| Registry | `weth()` |

Intern sind `_fundWall` und `_planRaise` zugunsten von `_collectCrossedWalls` und `_placeWall` weggefallen. Die Belohnung des Vaults wird ausschließlich in CUBIT gezahlt und mit `claimCubit()` abgerufen, und die Deployment-Skripte verwenden keine Variable `WETH` mehr.

## Der Vault und der Governance-Vault

| Vertrag | Nützliche Funktionen |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`, `depositEth()`, `lockUntracked(token)`, `claimable(token)`, `locked(token)`, `lockExtension()`, dann `claim(token, maxTranches)` und `extendLock(extra)`, dem Deployer vorbehalten, ohne Möglichkeit, dieses Recht zu übertragen |
| `CubitForge` | `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)`, für alle offen mit der exakten Gebühr, `launchFee()` unveränderlich bei 0,005 ETH, Salts an den startenden Account gebunden; `governanceVault()`, bei der Erstellung festgelegte Adresse, erhält die Startgebühr über `depositEth()` |

Beim Vault beträgt `DAILY_REWARD_BPS` 300 und `REWARD_PERIOD` einen Tag: `pendingCubit` wächst anteilig über 24 Stunden und bleibt dann gedeckelt, ohne `rewardReserve` zu überschreiten. Beim Governance-Vault beträgt `LOCK_DURATION` 30 Tage für jede Einlage, und ETH wird unter dem Schlüssel `ETH()`, der Nulladresse, verbucht. `extendLock(extra)` fügt der Sperre aller bestehenden und künftigen Einlagen `extra` Sekunden hinzu, und `lockExtension()` wächst nur.

Der Lens stellt außerdem `rewardReserve()` bereit, die Summe der Belohnungsreserven aller registrierten Vaults, aktueller wie ausgemusterter. Seit dem Austausch des Lens am 19. September 2026 werden die Wall-Summen und die Angebotsgrößen nicht mehr on chain berechnet: Die Getter `wallEth()`, `wallTokens()`, `circulatingSupply()` und `heldSupply()` sowie die gleichnamigen Snapshot-Felder sind entfallen; der Snapshot liefert stattdessen `totalSupply`, `activeWallCount` und `pendingAbsorbedTokens`. Der Aufrufer leitet die Zahlen selbst ab, alle Seiten im selben Block gelesen: `wallTokens` ist die Summe der CUBIT der Seiten plus `pendingAbsorbedTokens`, dann `circulatingSupply = totalSupply − wallTokens − rewardReserve` und `heldSupply = circulatingSupply − bandTokens`, wobei jede Subtraktion bei null endet. Gestakte CUBIT bleiben Teil des Umlaufangebots. `bestWallPrice()` und `netBestWallPrice()` liefern den Brutto- und Nettopreis der dem Markt am nächsten liegenden aktiven Wall, gelesen mit `nearestWallTick()` des Hooks, oder null, wenn keine Wall steht. Der Snapshot endet mit `blockNumber`, `bestWallPrice` und `netBestWallPrice`.

## Einheiten und Ausrichtung

CUBIT- und ETH-Mengen verwenden 18 Dezimalstellen. Die abgeleiteten Preise des Lens werden in **ETH pro CUBIT mit dem Maßstab 1e18** angegeben. Der v4-Tick folgt der Ausrichtung CUBIT pro ETH; er sinkt, wenn der Preis in ETH pro CUBIT steigt.

Verwenden Sie vor der Formatierung `bigint`-Ganzzahlen für Beträge und Berechnungen. Eine zu frühe Umwandlung in `Number` kann Genauigkeit verlieren. Die Start-FDV wird beim Deployment in `LAUNCH_ETH()` festgeschrieben: 3,75 ETH für die neue Version, auf 21 Millionen CUBIT. Vermischen Sie USD, Wei und Tokeneinheiten nicht.

## Die Methoden des Routers

```text
swapExactIn(
    PoolKey key, bool zeroForOne,
    uint256 amountIn, uint256 amountOutMin,
    address recipient, uint256 deadline
)

swapExactOut(
    PoolKey key, bool zeroForOne,
    uint256 amountOut, uint256 amountInMax,
    address recipient, uint256 deadline
)
```

`zeroForOne = true` kauft CUBIT mit ETH. Geben Sie bei Exact-Input `amountIn` als value an; bei einem Exact-Output-Kauf `amountInMax`, wobei der Überschuss erstattet wird. Ein Verkauf verwendet `zeroForOne = false`, value null und eine CUBIT-Freigabe an den Router.

Die zurückgegebenen Beträge folgen den Netto-/Bruttogrenzen des Routers: Nettoausgabe bei Exact-Input, Bruttoeingabe bei Exact-Output. Der Vertrag prüft unvollständige Ausführungen. Die Quotierung muss mit dem richtigen Poolschlüssel und seiner Version simuliert werden. Nach einem Verkauf ruft der Router außerdem `deliverAbsorbed()` auf, wenn noch aufgenommene CUBIT auf ihre Übertragung warten.

## Ereignisse und Fehler

Zu den Ereignissen des Hooks gehören `BuyTaxed`, `SellTaxed`, `BandBootstrapped`, `TeamPaid` sowie für die Walls `WallFunded`, `WallAbsorbed`, `TokensAbsorbed` und `AbsorbedDelivered`. `ModuleUpdated` ermöglicht das Verfolgen von Modulaustauschen.

Verfolgen Sie bei den Vaults `Staked`, `Withdrawn`, `RewardReserveFunded` und `CubitRewardClaimed`, dann `Deposited`, `Claimed` und `LockExtended` für den Governance-Vault.

Die Logs von `WallLib` werden im Kontext des Hooks emittiert: Indexieren Sie sie über die Hook-Adresse mit den entsprechenden ABI-Signaturen. Das frühere Ereignis `FloorRaised` existiert nicht mehr.

Behandeln Sie im Router insbesondere `Expired`, `WrongPool`, `TooLittleReceived`, `TooMuchRequested`, `InsufficientOutput` und `IncompleteInput`. Beim Hook lehnt `ExternalLiquidityForbidden` jede Liquidität Dritter ab und `SupplyNotDeposited` eine unzureichende Starteinlage. Lesen Sie die Codes und die ABI der validierten Veröffentlichung erneut.

<p class="source-note">Quellen: <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code> und die Git-Historie der neuen Version, darunter der Commit <code>4aa063ac</code>.</p>
