---
description: "Identità del pool, moduli sostituibili, banda di liquidità, muri e invio dei CUBIT assorbiti, vault, funzioni rimosse, unità ed eventi d’integrazione."
section: "04 / SVILUPPARE"
reading: "10 MIN DI LETTURA"
search:
  keywords: ["API", "ABI", "integrazione", "integrazione", "contratto", "indirizzo", "banda", "BAND_SALT", "MIN_POOL_SUPPLY", "bandEth", "bandTokens", "muri", "WallLib", "wallCount", "deliverAbsorbed", "pendingAbsorbedTokens"]
---

# Contratti e integrazione

Un’integrazione deve identificare **catena, nucleo del pool, ABI e revisione dei moduli**. Un indirizzo di router copiato da un vecchio rapporto può essere sostituito; una nuova ABI può essere incompatibile con il pool storico.

> L’ABI seguente è quella del codice della nuova versione. Esporta l’ABI della release validata e verifica i runtime prima di collegare un client.

## Identità del pool

La `PoolKey` contiene `currency0`, `currency1`, `fee`, `tickSpacing` e `hooks`. Per CUBIT, ETH nativo è `currency0` e il token CUBIT è `currency1`.

| Campo | Lettura prevista |
| --- | --- |
| `currency0` | Indirizzo zero, che rappresenta ETH nativo |
| `currency1` | Token del deployment identificato |
| `fee` | `100` nella versione in servizio, ossia lo 0,01% |
| `tickSpacing` | `10` nelle fonti lette |
| `hooks` | Hook del deployment identificato |

Il poolId dipende dall’intera chiave. Sostituire solo `fee` in un frontend non trasforma un vecchio pool in un nuovo deployment.

## Risolvere i moduli allo stesso blocco

Leggi prima il registro ancorato in `hook.v2()`. Poi risolvi gli indirizzi dei moduli disponibili e `moduleRevision` allo stesso blocco. Verifica il loro collegamento al nucleo.

Ecco un frammento di **sola lettura**, da usare con un client viem già configurato e un indirizzo di registro verificato:

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

Questo frammento non verifica da solo tutti i collegamenti e non autorizza alcuna firma. Il frontend del repository li controlla in `resolveRelease`, `readRelease` e `assertCurrentDeployment`.

Prima di ogni firma, confronta moduli e revisione con il contesto già esaminato dall’utente. Non reindirizzare silenziosamente un’approvazione.

## Leggere la banda

| Elemento | Risultato / utilizzo |
| --- | --- |
| `band()` | `(int24 lower, int24 upper, uint128 liquidity)` dell’unica posizione di trading |
| `MIN_POOL_SUPPLY()` | Deposito minimo accettato all’inizializzazione: 80% dell’offerta |
| `BAND_SALT()` | Salt della posizione della banda, `keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | Evento emesso una sola volta, all’inizializzazione del pool |
| Lens `bandEth()` / `bandTokens()` | ETH e CUBIT detenuti dalla banda al prezzo corrente, escluse le commissioni LP |

`lower` vale `minUsableTick` per uno spacing di 10, ossia −887 270. `upper` è il tick di apertura del pool arrotondato per difetto allo spacing: con una FDV di lancio di 3,75 ETH, vale 155 390. Un arrotondamento per eccesso renderebbe la posizione attiva e richiederebbe ETH.

L’hook mette nella banda **tutto il suo deposito**. `afterInitialize` rifiuta un deposito inferiore a `MIN_POOL_SUPPLY` con `SupplyNotDeposited`: il lancio del padre deposita esattamente questo minimo, un figlio Forge deposita tutta la propria offerta. La polvere di arrotondamento viene bruciata, così l’hook non conserva né token grezzi né claim di CUBIT dopo l’inizializzazione.

Lo snapshot del Lens sostituisce i vecchi campi del ladder e dei keeper con `bandEth` e `bandTokens`. Questi valori riguardano il capitale della posizione: le commissioni LP accumulate nella banda non vengono né raccolte né conteggiate.

## Leggere più muri

| Vista dell’hook | Risultato / utilizzo |
| --- | --- |
| `wallCount()` | Numero di identificatori storici, distinto dal numero di posizioni attive |
| `activeWallCount()` | Numero di muri attivi nello stato letto |
| `activeWallId(index)` | ID permanente a un indice dell’elenco attivo corrente |
| `latestWallId()` | ID dell’ultimo muro finanziato; verificare prima che esista un muro |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | Totale dei residui ETH assegnati ai muri |

Le vendite creano, ispessiscono e svuotano i muri. Un muro svuotato esce dall’elenco attivo ma conserva il proprio identificatore e il proprio tick.

Gli indici dell’elenco attivo possono cambiare dopo un assorbimento. **Conserva l’ID del muro come identità**, non il suo indice di iterazione. Leggi il conteggio e gli elementi allo stesso blocco.

`fundedEth` rappresenta il totale cumulativo dei fondi effettivamente collocati a quel tick; non va mostrato come profondità residua. `idleEth` rappresenta un residuo legato al muro, distinto dalla sua liquidità collocata. Il limite superiore di un muro è `lower + tickSpacing`. I fondi dei muri che non è stato possibile collocare restano separati in `pendingFloorEth`.

I campi storici `floorPrice` e `netFloorPrice` del Lens descrivono l’ultimo muro finanziato; non riassumono tutti i livelli. Per il muro attivo più vicino al mercato, leggi `bestWallPrice` e `netBestWallPrice`.

## Muri attraversati e invio dei CUBIT

A ogni vendita, sia in ingresso esatto sia in uscita esatta, `afterSwap` chiama `_collectCrossedWalls()` e poi `_placeWall()`. Tutti i muri che il prezzo ha interamente attraversato vengono svuotati, dal più vicino al più lontano: i loro CUBIT si aggiungono a `pendingAbsorbedTokens` e i loro ETH residui, commissioni realizzate e polvere, tornano a `pendingFloorEth`. `_placeWall()` colloca poi tutti gli ETH in attesa all’obiettivo calcolato sul prezzo dopo la vendita. Se quell’obiettivo non è strettamente sopra il tick del pool, cosa che accade al prezzo di lancio o al di sotto, colloca il muro l’1% sotto il prezzo corrente con `BandLib.underMarketWallTarget`. Restano in `pendingFloorEth` solo un importo troppo piccolo per creare una posizione e il caso estremo di un prezzo in cima all’intervallo di tick, dove nessun muro trova posto sotto il prezzo.

| Elemento | Risultato / utilizzo |
| --- | --- |
| `pendingAbsorbedTokens()` | CUBIT dei muri attraversati, isolati nell’hook come claim del PoolManager fino al loro invio |
| `deliverAbsorbed()` | Invio pubblico e senza permessi di questi CUBIT a `absorbedTokenSink()`; il chiamante non sceglie né destinatario né importo |
| `absorbedTokenSink()` | Vault del registro per CUBIT; per un figlio Forge, `governanceVault()` della Forge che ha distribuito il suo token |
| `WallFunded(id, lower, addedEth, liquidity)` | Muro creato o ispessito al tick obiettivo |
| `WallAbsorbed(id, cubit, ethRemaining)` | Muro interamente attraversato e svuotato |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | CUBIT messi in attesa di invio da una vendita |
| `AbsorbedDelivered(sink, amount)` | CUBIT inviati alla loro destinazione |

Per CUBIT, `deliverAbsorbed()` chiama `fundRewardReserve` del vault. Per un figlio Forge, senza registro, trasferisce i token al vault di governance e poi chiama `lockUntracked`. Il router CUBIT lo chiama dopo ogni vendita in un try/catch: un invio che fallisce non blocca mai la vendita, e chiunque può rilanciare l’invio. Il Lens non totalizza più i muri in `snapshot()`: `wallAmountsPage(start, count)` restituisce gli ETH e i CUBIT di un tratto di muri, e i CUBIT in attesa di invio si aggiungono una sola volta alla somma delle pagine, tramite il campo `pendingAbsorbedTokens`.

Ogni muro attraversato costa circa 185 000 gas. Con il limite di 16 777 216 gas per transazione fissato da EIP-7825, una vendita attraversa al massimo circa 88 muri; oltre, fallisce senza perdite e deve essere suddivisa.

## Le funzioni rimosse

La nuova versione rimuove l’API del ladder, della manutenzione, del flusso WETH e del finanziamento dei muri da parte della Forge e rinomina quella dei token assorbiti. Un client che chiama ancora questi elementi punta alla vecchia versione.

| Contratto | Elementi rimossi |
| --- | --- |
| Hook, funzioni | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| Hook, funzioni rinominate | `burnAbsorbed()` diventa `deliverAbsorbed()`; `pendingBurnTokens()` diventa `pendingAbsorbedTokens()` |
| Hook, costanti | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| Hook, eventi ed errori | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens, funzioni | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens, campi dello snapshot | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| Registro | `weth()` |

Internamente, `_fundWall` e `_planRaise` sono scomparse a favore di `_collectCrossedWalls` e `_placeWall`. La ricompensa del Vault è esclusivamente in CUBIT, riscossa con `claimCubit()`, e gli script di deployment non usano più una variabile `WETH`.

## Il Vault e il vault di governance

| Contratto | Funzioni utili |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`, `depositEth()`, `lockUntracked(token)`, `claimable(token)`, `locked(token)`, `lockExtension()`, poi `claim(token, maxTranches)` ed `extendLock(extra)`, riservate al deployer, senza possibilità di trasferire questo diritto |
| `CubitForge` | `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)`, aperto a tutti con la commissione esatta, `launchFee()` immutabile a 0,005 ETH, salt legati a chi lancia; `governanceVault()`, indirizzo fissato alla costruzione, riceve la commissione di lancio con `depositEth()` |

Lato Vault, `DAILY_REWARD_BPS` vale 300 e `REWARD_PERIOD` un giorno: `pendingCubit` cresce in proporzione nell’arco di 24 ore e poi raggiunge il tetto, senza superare `rewardReserve`. Lato vault di governance, `LOCK_DURATION` vale 30 giorni per ogni deposito, e l’ETH è contabilizzato sotto la chiave `ETH()`, l’indirizzo zero. `extendLock(extra)` aggiunge `extra` secondi al blocco di tutti i depositi, presenti e futuri, e `lockExtension()` può solo crescere.

Il Lens espone anche `rewardReserve()`, la somma delle riserve di ricompense di tutti i vault registrati, attuali e ritirati. Dalla sostituzione del Lens del 19 settembre 2026, i totali dei muri e l’offerta non sono più calcolati on chain: i getter `wallEth()`, `wallTokens()`, `circulatingSupply()` e `heldSupply()` e i campi omonimi sono spariti dallo snapshot, che fornisce invece `totalSupply`, `activeWallCount` e `pendingAbsorbedTokens`. È il chiamante a derivare i numeri, con tutte le pagine lette allo stesso blocco: `wallTokens` è la somma dei CUBIT delle pagine più `pendingAbsorbedTokens`, poi `circulatingSupply = totalSupply − wallTokens − rewardReserve` e `heldSupply = circulatingSupply − bandTokens`, con ogni sottrazione che si ferma a zero. I CUBIT in stake restano nell’offerta in circolazione. `bestWallPrice()` e `netBestWallPrice()` danno il prezzo lordo e il prezzo netto del muro attivo più vicino al mercato, letto con `nearestWallTick()` dell’hook, oppure zero se non resta alcun muro. Lo snapshot termina con `blockNumber`, `bestWallPrice` e `netBestWallPrice`.

## Unità e orientamento

Le quantità di CUBIT ed ETH usano 18 decimali. I prezzi derivati dal Lens sono espressi in **ETH per CUBIT su scala 1e18**. Il tick v4 segue l’orientamento CUBIT per ETH; diminuisce quando il prezzo ETH per CUBIT aumenta.

Usa interi `bigint` per importi e calcoli prima della formattazione. Una conversione troppo precoce in `Number` può perdere precisione. La FDV di lancio è fissata al deployment in `LAUNCH_ETH()`: 3,75 ETH scelti per la nuova versione, su 21 milioni di CUBIT. Non mescolare USD, wei e unità di token.

## I metodi del router

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

`zeroForOne = true` compra CUBIT con ETH. Per exact-input, fornisci `amountIn` come value; per un acquisto exact-output, fornisci `amountInMax`, con rimborso dell’eccedenza. Una vendita usa `zeroForOne = false`, value zero e un’approvazione CUBIT al router.

Gli importi restituiti seguono i limiti netti/lordi del router: uscita netta per exact-input, ingresso lordo per exact-output. Il contratto controlla i riempimenti incompleti. La quotazione va simulata con la chiave corretta del pool e la relativa versione. Dopo una vendita, il router chiama anche `deliverAbsorbed()` se restano CUBIT assorbiti in attesa.

## Eventi ed errori

Gli eventi dell’hook comprendono `BuyTaxed`, `SellTaxed`, `BandBootstrapped`, `TeamPaid` e, per i muri, `WallFunded`, `WallAbsorbed`, `TokensAbsorbed` e `AbsorbedDelivered`. `ModuleUpdated` permette di seguire le sostituzioni dei moduli.

Lato vault, segui `Staked`, `Withdrawn`, `RewardReserveFunded` e `CubitRewardClaimed`, poi `Deposited`, `Claimed` e `LockExtended` per il vault di governance.

I log di `WallLib` vengono emessi nel contesto dell’hook: indicizzali sull’indirizzo dell’hook con le firme ABI corrispondenti. Il vecchio evento `FloorRaised` non esiste più.

Nel router, gestisci in particolare `Expired`, `WrongPool`, `TooLittleReceived`, `TooMuchRequested`, `InsufficientOutput` e `IncompleteInput`. Lato hook, `ExternalLiquidityForbidden` rifiuta qualsiasi liquidità di terzi e `SupplyNotDeposited` un deposito di lancio insufficiente. Rileggi codici e ABI della release validata.

<p class="source-note">Fonti: <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code> e la cronologia Git della nuova versione, tra cui il commit <code>4aa063ac</code>.</p>
