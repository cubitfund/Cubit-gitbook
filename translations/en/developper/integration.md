---
description: "Pool identities, replaceable modules, liquidity band, walls and transfer of absorbed CUBIT, vaults, removed functions, units and integration events."
section: "04 / BUILD"
reading: "10 MIN READ"
search:
  keywords: ["API", "ABI", "integration", "integration", "contract", "address", "band", "BAND_SALT", "MIN_POOL_SUPPLY", "bandEth", "bandTokens", "walls", "WallLib", "wallCount", "deliverAbsorbed", "pendingAbsorbedTokens"]
---

# Contracts and integration

An integration must identify **the chain, pool core, ABI and module revision**. A router address copied from an old report can be replaced; a new ABI may be incompatible with the historical pool.

> The ABI below is that of the new version’s code. Export the validated release’s ABI and verify runtimes before connecting a client.

## Pool identity

The `PoolKey` contains `currency0`, `currency1`, `fee`, `tickSpacing` and `hooks`. For CUBIT, native ETH is `currency0` and the CUBIT token is `currency1`.

| Field | Expected value |
| --- | --- |
| `currency0` | Zero address, representing native ETH |
| `currency1` | Token of the identified deployment |
| `fee` | `100` in the version in service, i.e. 0.01% |
| `tickSpacing` | `10` in the sources reviewed |
| `hooks` | Hook of the identified deployment |

The poolId depends on this entire key. Changing only `fee` in a frontend does not turn an old pool into a new deployment.

## Resolving modules at the same block

First read the registry anchored in `hook.v2()`. Then resolve available module addresses and `moduleRevision` at the same block. Check their connections to the core.

Here is a **read-only** fragment to use with an already configured viem client and a verified registry address:

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

This fragment alone does not verify all connections and authorizes no signing. The repository frontend checks them in `resolveRelease`, `readRelease` and `assertCurrentDeployment`.

Before each signature, compare the modules and revision with the context already reviewed by the user. Do not silently redirect an approval.

## Reading the band

| Element | Result / use |
| --- | --- |
| `band()` | `(int24 lower, int24 upper, uint128 liquidity)` of the single trading position |
| `MIN_POOL_SUPPLY()` | Minimum deposit accepted at initialization: 80% of the supply |
| `BAND_SALT()` | Salt of the band position, `keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | Event emitted only once, at pool initialization |
| Lens `bandEth()` / `bandTokens()` | ETH and CUBIT held by the band at the current price, excluding LP fees |

`lower` equals `minUsableTick` for a spacing of 10, i.e. −887 270. `upper` is the pool’s opening tick rounded down to the spacing: with a launch FDV of 3.75 ETH, it is 155 390. Rounding up would make the position active and require ETH.

The hook puts **its entire deposit** into the band. `afterInitialize` rejects a deposit below `MIN_POOL_SUPPLY` with `SupplyNotDeposited`: the parent launch deposits exactly this minimum, a Forge child deposits its entire supply. The rounding dust is burned, so the hook retains neither raw tokens nor CUBIT claims after initialization.

The Lens snapshot replaces the old ladder and keeper fields with `bandEth` and `bandTokens`. These values cover the position’s principal: LP fees accumulated in the band are neither collected nor counted.

## Reading multiple walls

| Hook view | Result / use |
| --- | --- |
| `wallCount()` | Number of historical identifiers, separate from the number of active positions |
| `activeWallCount()` | Number of active walls in the state read |
| `activeWallId(index)` | Permanent ID at an index in the current active list |
| `latestWallId()` | ID of the last funded wall; first check that a wall exists |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | Total ETH remainders allocated to walls |

Sales create, thicken and empty walls. An emptied wall leaves the active list but keeps its identifier and tick.

Active list indexes can change after absorption. **Keep the wall’s ID as its identity**, not its traversal index. Read the count and elements at the same block.

`fundedEth` represents the cumulative funds actually placed at that tick; it must not be displayed as remaining depth. `idleEth` represents a remainder attached to the wall, separate from its deployed liquidity. A wall’s upper bound is `lower + tickSpacing`. Wall funds that could not be placed remain separate in `pendingFloorEth`.

The Lens’s historical `floorPrice` and `netFloorPrice` fields describe the last funded wall; they do not summarize all levels. For the active wall closest to the market, read `bestWallPrice` and `netBestWallPrice`.

## Crossed walls and CUBIT transfer

On every sale, with exact input as with exact output, `afterSwap` calls `_collectCrossedWalls()` and then `_placeWall()`. All the walls that the price has fully crossed are emptied, from nearest to farthest: their CUBIT is added to `pendingAbsorbedTokens` and their remaining ETH, realized fees and dust, returns to `pendingFloorEth`. `_placeWall()` then places all pending ETH at the target calculated on the price after the sale. If that target is not strictly above the pool tick, which happens at or below the launch price, it places the wall 1% below the current price with `BandLib.underMarketWallTarget`. Only an amount too small to create a position and the extreme case of a price at the very top of the tick range, where no wall fits below the price, remain in `pendingFloorEth`.

| Element | Result / use |
| --- | --- |
| `pendingAbsorbedTokens()` | CUBIT from crossed walls, isolated in the hook as PoolManager claims until it is sent |
| `deliverAbsorbed()` | Public, permissionless transfer of this CUBIT to `absorbedTokenSink()`; the caller chooses neither the recipient nor the amount |
| `absorbedTokenSink()` | The registry’s Vault for CUBIT; for a Forge child, the `governanceVault()` of the Forge that deployed its token |
| `WallFunded(id, lower, addedEth, liquidity)` | Wall created or thickened at the target tick |
| `WallAbsorbed(id, cubit, ethRemaining)` | Wall fully crossed and emptied |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | CUBIT set aside pending transfer by a sale |
| `AbsorbedDelivered(sink, amount)` | CUBIT sent to its destination |

For CUBIT, `deliverAbsorbed()` calls the vault’s `fundRewardReserve`. For a Forge child, which has no registry, it transfers the tokens to the governance vault and then calls `lockUntracked`. The CUBIT router calls it after each sale in a try/catch: a failed transfer never blocks the sale, and anyone can retry the transfer. The Lens no longer totals the walls in `snapshot()`: `wallAmountsPage(start, count)` returns the ETH and the CUBIT of a slice of walls, and the CUBIT awaiting transfer are added once to the sum of the pages, through the `pendingAbsorbedTokens` field.

Each crossed wall costs about 185 000 gas. With the limit of 16 777 216 gas per transaction set by EIP-7825, a sale crosses at most about 88 walls; beyond that, it fails without loss and must be split.

## Removed functions

The new version removes the ladder, maintenance, WETH flow and Forge wall-funding API, and renames the absorbed-token API. A client that still calls these elements targets the old version.

| Contract | Removed elements |
| --- | --- |
| Hook, functions | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| Hook, renamed functions | `burnAbsorbed()` becomes `deliverAbsorbed()`; `pendingBurnTokens()` becomes `pendingAbsorbedTokens()` |
| Hook, constants | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| Hook, events and errors | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens, functions | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens, snapshot fields | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| Registry | `weth()` |

Internally, `_fundWall` and `_planRaise` have given way to `_collectCrossedWalls` and `_placeWall`. The Vault reward is only in CUBIT, claimed with `claimCubit()`, and the deployment scripts no longer use a `WETH` variable.

## The Vault and the governance vault

| Contract | Useful functions |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`, `depositEth()`, `lockUntracked(token)`, `claimable(token)`, `locked(token)`, `lockExtension()`, then `claim(token, maxTranches)` and `extendLock(extra)`, restricted to the deployer, with no way to transfer this right |
| `CubitForge` | `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)`, open to everyone with the exact fee, `launchFee()` immutable at 0.005 ETH, salts bound to the launcher; `governanceVault()`, address fixed at construction, receives the launch fee through `depositEth()` |

On the Vault side, `DAILY_REWARD_BPS` is 300 and `REWARD_PERIOD` is one day: `pendingCubit` grows pro rata over 24 hours and then caps, without exceeding `rewardReserve`. On the governance vault side, `LOCK_DURATION` is 30 days for each deposit, and ETH is booked under the `ETH()` key, the zero address. `extendLock(extra)` adds `extra` seconds to the lock of every deposit, present and future, and `lockExtension()` only grows.

The Lens also exposes `rewardReserve()`, the sum of the reward reserves of all registered vaults, current and retired. Since the Lens replacement of 19 September 2026, the wall totals and the supply figures are no longer computed on chain: the `wallEth()`, `wallTokens()`, `circulatingSupply()` and `heldSupply()` getters and the snapshot fields of the same names are gone, and the snapshot gives `totalSupply`, `activeWallCount` and `pendingAbsorbedTokens` instead. The caller derives the figures itself, every page read at the same block: `wallTokens` is the sum of the CUBIT of the pages plus `pendingAbsorbedTokens`, then `circulatingSupply = totalSupply − wallTokens − rewardReserve` and `heldSupply = circulatingSupply − bandTokens`, each subtraction stopping at zero. Staked CUBIT remain in the circulating supply. `bestWallPrice()` and `netBestWallPrice()` give the gross and net price of the active wall closest to the market, read with the hook’s `nearestWallTick()`, or zero when no wall stands. The snapshot ends with `blockNumber`, `bestWallPrice` and `netBestWallPrice`.

## Units and orientation

CUBIT and ETH amounts use 18 decimals. Lens-derived prices are expressed in **ETH per CUBIT at 1e18 scale**. The v4 tick follows CUBIT-per-ETH orientation; it decreases when the ETH-per-CUBIT price increases.

Use `bigint` integers for amounts and calculations before formatting. Converting to `Number` too early can lose precision. The launch FDV is fixed at deployment in `LAUNCH_ETH()`: 3.75 ETH adopted for the new version, on 21 million CUBIT. Do not mix USD, wei and token units.

## Router methods

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

`zeroForOne = true` buys CUBIT with ETH. For exact-input, supply `amountIn` as value; for an exact-output purchase, supply `amountInMax`, with a surplus refund. A sale uses `zeroForOne = false`, zero value and CUBIT approval for the router.

Returned amounts follow the router’s net/gross boundaries: net output for exact-input, gross input for exact-output. The contract checks incomplete fills. The quote must be simulated with the correct pool key and version. After a sale, the router also calls `deliverAbsorbed()` if absorbed CUBIT remains pending.

## Events and errors

The hook’s events include `BuyTaxed`, `SellTaxed`, `BandBootstrapped`, `TeamPaid` and, for walls, `WallFunded`, `WallAbsorbed`, `TokensAbsorbed` and `AbsorbedDelivered`. `ModuleUpdated` tracks module replacements.

On the vault side, track `Staked`, `Withdrawn`, `RewardReserveFunded` and `CubitRewardClaimed`, then `Deposited`, `Claimed` and `LockExtended` for the governance vault.

`WallLib` logs are emitted in the hook’s context: index them at the hook’s address with the corresponding ABI signatures. The old `FloorRaised` event no longer exists.

In the router, handle in particular `Expired`, `WrongPool`, `TooLittleReceived`, `TooMuchRequested`, `InsufficientOutput` and `IncompleteInput`. On the hook side, `ExternalLiquidityForbidden` rejects any third-party liquidity and `SupplyNotDeposited` rejects an insufficient launch deposit. Review the codes and ABI of the validated release.

<p class="source-note">Sources: <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code> and the new version’s Git history, including commit <code>4aa063ac</code>.</p>
