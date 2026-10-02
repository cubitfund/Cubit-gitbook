---
description: "Manual test plan on Sepolia for the new version: band, swaps, taxes, walls, vaults, replacements, expected rejections and a numbered record sheet."
section: "05 / VERIFY"
reading: "NUMBERED TEST PLAN"
search:
  keywords: ["acceptance testing", "test", "testnet", "Sepolia", "manual", "checklist", "plan", "severity", "severity", "record", "record", "rejection"]
---

# Manual test plan on Sepolia

This page is a **checklist to be executed by hand**, on the Sepolia test network, by a person equipped with a wallet. Each case has a stable number of the form `T-01`, which can be cited in a report.

> **Before you start.** This plan covers the new version. The repository’s public manifest describes the Sepolia deployment **in service**, with LP fees of `100`: this plan applies to it. A case that does not apply to the tested version is recorded as “out of version scope”, never as “failure”.

The values cited come from the new version’s code, under `contracts/src/`, and from the design decisions of September 14, 2026. A behavior that could not be established is marked **“to be confirmed during testing”**.

## How to use this plan

Each section presents its cases in a six-column table. The last two columns are filled in during testing.

| Column | What to write in it |
| --- | --- |
| Case | The stable identifier, `T-01` to `T-110` |
| Preconditions | What must be true before starting |
| Steps | The actions, in order |
| Expected result | What the code and the decisions provide for |
| Observed result | What happened, with the transaction hash or the read block |
| Severity | Empty if compliant; otherwise Blocking, Major, Minor or Cosmetic |

| Severity | Criterion |
| --- | --- |
| Blocking | Loss or locking of funds, tax not collected, wall lost, reward paid from principal |
| Major | Behavior contrary to the sources, missing rejection, wrong displayed figure |
| Minor | Display discrepancy with no on-chain consequence, imprecise message |
| Cosmetic | Typography, layout, label |

A transaction **rejected in accordance with a rejection case is a success**. A hash only means that the transaction was submitted: only the receipt indicates success.

**Some cases do not go through the interface.** In its current sources, the dapp reads the ABI of the version in service and exposes neither exact-output orders, nor `claimTeam()`, nor detailed wall reads. These cases are marked “direct call”: they are executed with a contract-call tool, on the addresses in the tested deployment’s manifest.

## 1. Preparation

Record these items **before** the first swap: they serve as the reference for all later comparisons.

- The network: Sepolia, chain ID `11155111`.
- The tested deployment’s addresses, read from its manifest: token, hook, PoolManager, `poolId`, router, Lens, V2 registry, Vault, launcher; then, once the launchpad is added, governance vault and Forge. **Do not copy any private key into your notes.**
- The fixed parameters: `fee`, `tickSpacing`, `LAUNCH_ETH`, `MIN_POOL_SUPPLY`, `launchTimestamp`, `moduleRevision`.
- The initial state: the Lens’s `snapshot()`, the hook’s `band()`, the token’s `totalSupply()` and `totalBurned()`, `pendingFloorEth`, `pendingAbsorbedTokens`, `wallCount()`, `activeWallCount()`, `teamAccrued`, `teamPaidCumulative`, the Vault’s `rewardReserve()`, and the read **block number**.

Plan for test ETH **in addition to** the amounts swapped: each transaction pays its gas, and several cases require rejected transactions, which also consume gas.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-01 | Wallet installed | Select Sepolia; open the dapp connected to the tested version | The network is recognized; no prompt to sign on another chain |  |  |
| T-02 | New account | Fund it with test ETH from a Sepolia faucet | Balance visible in the wallet and in the dapp after refreshing |  |  |
| T-03 | Manifest at hand | Compare each displayed address with the one in the manifest | Identical identities; `poolId`, `fee` and `tickSpacing` match |  |  |
| T-04 | No swap issued yet | Read `snapshot()` and note the block | Reference values recorded, block identified |  |  |
| T-05 | Direct call | Read the hook’s `poolKey()` | `currency0` equal to the zero address, `fee = 100`, `tickSpacing = 10`, `hooks` equal to the hook |  |  |
| T-06 | V2 registry readable | Read `moduleRevision()` and the module addresses | Revision noted; any change during testing requires re-checking before each signature |  |  |

## 2. Launch and band

At pool initialization, the hook places **its entire deposit** in a single position `[minUsableTick, tickUpper]`, identified by `BAND_SALT`. `tickUpper` is the opening tick rounded down to the spacing, so that the position contains only CUBIT. The hook rejects a deposit below `MIN_POOL_SUPPLY`, i.e. 80% of the supply, and burns the rounding dust.

The complete launch also allocates 20% of the supply to the Vault reserve and makes a 0.1 ETH purchase in the same transaction.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-07 | Launch completed, direct call | Read `band()` | `lower = −887 270`; `upper` equal to the opening tick rounded down to the multiple of 10, i.e. `155 390` for an FDV of 3.75 ETH; non-zero liquidity |  |  |
| T-08 | Launch transaction known | Read its events | `BandBootstrapped(lower, upper, liquidity, tokens)` emitted once, with the values of `band()`; `tokens` equal to the deposit minus rounding dust |  |  |
| T-09 | Launch without an initial purchase | Read `bandEth` and `bandTokens` in `snapshot()` before any swap | `bandEth = 0`; `bandTokens` equal to the deposit, up to rounding |  |  |
| T-10 | Launch completed, direct call | Read `token.balanceOf(hook)` | Zero, excluding a direct transfer by a third party: the hook keeps no raw CUBIT after initialization |  |  |
| T-11 | Direct call | Try to add liquidity to the pool | Rejected with `ExternalLiquidityForbidden`: the hook is the sole liquidity provider |  |  |
| T-12 | Rehearsal deployment | Initialize the pool with a deposit below `MIN_POOL_SUPPLY` | Rejected with `SupplyNotDeposited`; no band placed |  |  |
| T-13 | Complete launch | Read the Vault’s `rewardReserve()` after the launch transaction | Reserve equal to 20% of the supply, i.e. 4.2 million CUBIT; no team allocation or airdrop |  |  |
| T-14 | Complete launch | Read the deployer buy in the launch transaction | 0.1 ETH purchase; `BuyTaxed` with 3% for the team; CUBIT received freely transferable |  |  |
| T-15 | Purchase confirmed, direct call | Recalculate the expected output from the band’s virtual reserves | Output consistent with the x·y=k curve after the 3% tax and LP fees; at the start, 16.8 million CUBIT against 3 virtual ETH — to be confirmed during testing |  |  |
| T-16 | Purchase, then resale of the CUBIT bought | Read `bandEth` before, in between and after | `bandEth` increases on the purchase, then returns toward its starting value; it never exceeds the ETH actually brought in by purchases |  |  |

## 3. Buying and selling workflows

The router exposes `swapExactIn(key, zeroForOne, amountIn, amountOutMin, recipient, deadline)` and `swapExactOut(key, zeroForOne, amountOut, amountInMax, recipient, deadline)`. `zeroForOne = true` buys CUBIT with ETH.

**In the dapp’s current sources, the interface uses exact input only.** The user always enters the amount they pay; the amount received is a read-only field. Exact-output workflows must therefore be tested by a direct call to the router.

A purchase sends native ETH as `msg.value`. A sale sends a zero value and requires an **ERC-20 approval** of CUBIT to the router: the interface requests authorization **for the exact amount**, never unlimited, so a larger sale requires a new authorization.

The router rejects partial fills: an exact input that is not fully consumed triggers `IncompleteInput`, an exact output that is not fully served triggers `InsufficientOutput`. Since the tax is sized on the requested amount, the revert protects the user.

Interface settings read in the dapp’s sources, to be checked during acceptance testing: slippage tolerance **1.0% by default**, input limited to **two decimal places** and to the range `0` to `99.99`; minimum received calculated in integers and **rounded up to the wei**; quote **fresh for 30 seconds**; on-chain deadline = chain timestamp **plus 120 seconds minus the quote’s age**.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-17 | Sufficient ETH balance | Buy a small amount, for example 0.001 ETH | Successful receipt; CUBIT credited; `BuyTaxed` event emitted |  |  |
| T-18 | Large ETH balance | Buy a large amount | Successful receipt; the price impact shows in the quote, not in the tax rate |  |  |
| T-19 | CUBIT in the wallet | Approve, then sell | Two separate transactions; net ETH received; `SellTaxed` emitted |  |  |
| T-20 | Previous sale confirmed | Sell an amount **larger** than the previous one | A new authorization is requested: the approval covered the exact amount |  |  |
| T-21 | Swap screen open | Read the proposed tolerance without changing it | Default value **1.0%** |  |  |
| T-22 | Swap screen open | Enter `0.005`, then `100`, then a negative value | Inputs rejected with a message about the 0–99.99 range and the two decimal places |  |  |
| T-23 | Fresh quote | Set the tolerance to its lowest accepted value, wait for a price movement, then sign | Rejected with `TooLittleReceived(received, minimum)`; no token lost; the interface does not suggest removing the protection |  |  |
| T-24 | Quote displayed | Let more than 30 seconds pass without any action, then try to sign | The quote is considered stale and recalculated before any signature |  |  |
| T-25 | Quote almost stale | Sign just before expiry and read the deadline passed | The deadline is 120 seconds **minus** the quote’s age: a 30-second-old quote leaves about 90 seconds |  |  |
| T-26 | Direct call | Call `swapExactIn` with a deadline already passed | Rejected with `Expired`; no movement of funds |  |  |
| T-27 | Direct call | Call `swapExactOut` for a purchase, with a comfortable input cap | Exact amount received; surplus ETH refunded to the caller in the same transaction |  |  |
| T-28 | Direct call | Call `swapExactOut` with an input cap one wei below the required amount | Rejected with `TooMuchRequested(required, maximum)` |  |  |
| T-29 | CUBIT balance larger than what the band and the walls can buy back, for example CUBIT received as rewards | Sell this balance as exact input through the router | Rejected with `IncompleteInput`; the tax is cancelled along with the transaction — to be confirmed during testing |  |  |
| T-30 | Direct call | Request, as exact output, more ETH than the book can serve | Rejected with `InsufficientOutput`; no partial settlement |  |  |
| T-31 | Direct call | Successively send a zero amount, a zero recipient, an inconsistent `msg.value`, then another pool key | Respective rejections `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` |  |  |
| T-32 | Compatible third-party router | Buy, then sell through a third-party route | The hook’s taxes apply |  |  |
| T-33 | Calling contract or batch of transactions | Chain a purchase and then a sale in the **same transaction** | Both legs are taxed separately |  |  |

## 4. Taxes and accounting

| Operation | Base | Allocation |
| --- | --- | --- |
| Purchase | 3% of the gross ETH leg | 100% team share; the wall allocation is explicitly zero |
| Sale | 15% of gross ETH output | 12% to walls, 3% to the team |

With exact input, the buy tax is **included** in the amount supplied and rounded up to the wei. With exact output, it is added on top of the pool leg, so that the tax relative to the total remains 3%.

For an exact-output sale, the tax is `ceil(output × 1500 / 8500)`: the pool produces the requested output **plus** the tax. For an exact-input sale, it is `ceil(gross × 15%)`. In the allocation, the team share is rounded down and **the entire wei remainder goes to the walls**.

In the dapp’s current sources, the interface requires reading these rates on-chain before allowing a swap: as long as they are not verified, the button stays pending.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-34 | Purchase confirmed | Read `BuyTaxed(ethIn, toFloor, toTeam)` | `toFloor` is zero; `toTeam` is 3% of the gross input, rounded up to the wei |  |  |
| T-35 | Purchase confirmed | Compare `teamAccrued` before and after | Increase equal to the team share |  |  |
| T-36 | Sale confirmed | Read `SellTaxed(ethOut, toFloor, toTeam)` | `toFloor + toTeam` equals 15% of gross; `toTeam` is 3% of gross; the sum is exact to the wei |  |  |
| T-37 | `teamAccrued` non-zero, direct call | Call `claimTeam()` from any account | Funds go to the fixed team address; `TeamPaid(amount, cumulative)` emitted; `teamAccrued` reset to zero |  |  |
| T-38 | `teamAccrued` zero, direct call | Call `claimTeam()` | The call does not revert and transfers nothing |  |  |
| T-39 | A purchase, then a sale of the same amount | Compare the starting ETH and the final ETH, excluding gas | The retained factor approaches `0.97 × 0.85 = 0.8245`; the difference is explained by LP fees, impact and rounding |  |  |
| T-40 | Two sales of very different sizes | Compare the taxes relative to the gross amounts | The rate remains 15% in both cases; no tiers or exemptions |  |  |

## 5. Automatic walls

On every sale, with exact input as with exact output, the hook calls `_collectCrossedWalls()` and then `_placeWall()`. It first empties all the walls that the price has fully crossed, from nearest to farthest, then places all pending ETH at the target `0.4 × current price + 0.6 × launch price`, calculated on the price **after** the sale and rounded to the tick. If that target is not strictly above the pool tick, which happens at or below the launch price, the wall is placed 1% below the current price.

An emptied wall adds its CUBIT to `pendingAbsorbedTokens` and returns its remaining ETH, fees and dust, to `pendingFloorEth`. A wall that is only partially consumed stays in place. Only an amount too small to create liquidity and the extreme case of a price at the very top of the tick range, where no wall fits below the price, leave funds waiting in `pendingFloorEth`: the sale is never rejected for that. The CUBIT router then calls `deliverAbsorbed()` in a try/catch.

The Lens’s `floorPrice()` reference describes the **last funded wall**, not a global minimum. Each crossed wall costs about 185 000 gas: a sale crosses at most about 88 walls within a transaction’s 16 777 216 gas limit.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-41 | Price above the launch price | Sell, then read the walls | `WallFunded(id, lower, addedEth, liquidity)` emitted; a wall is created or thickened at the target tick with the pending ETH, including the sale’s 12%, up to rounding; `pendingFloorEth` keeps only the unplaced remainder |  |  |
| T-42 | Previous situation | Recalculate the target from the price **after** the sale and the launch price | The wall’s `lower` matches the 40/60 target calculated on that price, rounded to the tick |  |  |
| T-43 | Two sales whose target lands on the same tick | Read `wallCount()` and `walls(id)` | A single wall: both `WallFunded` events carry the same `id`, the liquidity increases, no identifier is created |  |  |
| T-44 | Several walls at different ticks | Sell and buy several times, then reread `walls(id)` | Each wall’s `lower` remains unchanged; no wall is moved |  |  |
| T-45 | Active wall below the price | Sell an amount that partially consumes the wall without crossing it | The wall remains active with ETH and CUBIT; no `WallAbsorbed`; `pendingAbsorbedTokens` unchanged |  |  |
| T-46 | Partially consumed wall | Buy until the price moves back above the wall | The wall has sold its CUBIT back and regained ETH; its identifier and tick are unchanged |  |  |
| T-47 | Active wall, sale through the CUBIT router | Sell an amount that fully crosses the wall | `WallAbsorbed(id, cubit, ethRemaining)` and `TokensAbsorbed(amount, pendingAbsorbedTokens)`, then `AbsorbedDelivered(sink, amount)` and `RewardReserveFunded` in the same transaction; `rewardReserve()` increases by this CUBIT; `pendingAbsorbedTokens` returns to zero; `totalSupply()` and `totalBurned()` are unchanged |  |  |
| T-48 | Price close to the launch price, 40/60 target not below the market | Sell a small servable amount, then read the walls | The sale succeeds; `WallFunded` emitted; the wall is placed 1% below the price after the sale, rounded to the tick; `pendingFloorEth` keeps only the unplaced remainder |  |  |
| T-49 | T-48 situation | Sell a small servable amount again, then read `pendingFloorEth` | `WallFunded` emitted 1% below the new price; `pendingFloorEth` keeps only rounding dust: no backlog builds up from one sale to the next |  |  |
| T-50 | Compatible third-party router | Sell through a third-party route, fully crossing a wall, then call `deliverAbsorbed()` from any account | Taxes applied; `TokensAbsorbed` emitted and the CUBIT stays in `pendingAbsorbedTokens` until the call, which emits `AbsorbedDelivered` |  |  |
| T-51 | Several funded walls | Read the Lens’s `floorPrice()` and `netFloorPrice()`, then `wallAmountsPage(0, 500)` and the following pages up to `activeWallCount`, all at the same block | Reference of the last funded wall, presented as such; the CUBIT in the walls is the sum of the pages plus `pendingAbsorbedTokens`, added once |  |  |
| T-52 | Forge child, fully crossed wall | Read the child hook’s `absorbedTokenSink()`, then the sale’s events | Destination equal to the Forge’s `governanceVault()`; `AbsorbedDelivered` emitted; `Deposited(token, from, amount, unlockAt)` batch locked for 30 days |  |  |
| T-106 | Many walls to cross in one sale | Estimate the sale’s gas, then send it | About 185 000 gas per crossed wall; beyond about 88 walls, the sale exceeds 16 777 216 gas and fails without loss: split it |  |  |
| T-107 | Rehearsal deployment whose CUBIT destination rejects the transfer | Sell through the CUBIT router, crossing a wall, then call `deliverAbsorbed()` again | The sale succeeds; the CUBIT stays in `pendingAbsorbedTokens`; the call is open to any account and fails as long as the destination refuses |  |  |

## 6. mCUBIT Vault

The Vault pays a reward **in CUBIT**, taken only from `rewardReserve`. It is `DAILY_REWARD_BPS = 300`, i.e. 3% of the deposit per 24-hour period (`REWARD_PERIOD`), calculated pro rata and **capped at one period**: beyond that, the excess is lost. It never exceeds the reserve balance and is never paid from principal.

Each deposit restarts a **24-hour** lock (`LOCK_DURATION`) on the wallet’s entire position; withdrawal before expiry is rejected with `Locked`. A deposit, a withdrawal or a claim first pays the accrued reward and restarts the period. Any account can fund the reserve with `fundRewardReserve(amount)`. Expiry is assessed against the chain timestamp, not the browser clock.

The reward is **only in CUBIT**, claimed with `claimCubit()`: the Vault exposes no WETH reward function.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-53 | Vault available, CUBIT in the wallet | Approve, then deposit | `Staked(user, amount, unlockAt)` emitted; `unlockAt` equal to the block timestamp plus 24 hours |  |  |
| T-54 | Existing position | Deposit again before expiry | The lock is **restarted for the entire position**; the accrued reward, if non-zero, is paid with `CubitRewardClaimed` and the period restarts |  |  |
| T-55 | Lock in progress | Request a withdrawal | Rejected with `Locked` |  |  |
| T-56 | Lock expired | Withdraw part of the deposit | Partial withdrawal accepted; `Withdrawn` emitted; the accrued reward is paid first; the remaining balance stays deposited |  |  |
| T-57 | Deposit of 1 000 CUBIT, sufficient reserve | Read `pendingCubit` after 12 hours, then after 24 hours | About 15 CUBIT, then 30 CUBIT |  |  |
| T-58 | Previous situation | Wait 48 hours without claiming, then read `pendingCubit` | Still 30 CUBIT: the second day is lost |  |  |
| T-59 | Accrued reward | Call `claimCubit()` | CUBIT transferred; `CubitRewardClaimed` emitted; `rewardReserve` decreases by the amount paid; `pendingCubit` returns to zero |  |  |
| T-60 | Rehearsal deployment with a small reserve | Claim a reward larger than the reserve | Only the reserve balance is paid; the reserve drops to zero; the principal is not touched |  |  |
| T-61 | Direct call | Call `fundRewardReserve(0)`, then `fundRewardReserve(x)` from any account after approval | Rejected with `InvalidAmount`, then `RewardReserveFunded(from, x)`; `rewardReserve` increases by `x` |  |  |
| T-62 | Direct call | Compare `token.balanceOf(vault)` with `totalStaked + rewardReserve` at several moments | The Vault’s balance is never lower than this sum |  |  |
| T-63 | Zero amount, direct call | Call `stake(0)`, then `withdraw(0)` | Rejected with `InvalidAmount` in both cases |  |  |
| T-64 | Vault not connected to the current registry | Try a deposit | Rejected with `Inactive` |  |  |
| T-65 | Open position | Read the displayed lock duration | Displayed in hours, derived from `LOCK_DURATION`: 24 hours |  |  |
| T-66 | Dapp open | Look for a WETH reward workflow | None: only the CUBIT reward is offered |  |  |

## 7. Launchpad governance vault

The governance vault receives the Forge launch fees, in ETH, and the tokens absorbed by Forge children’s walls. **Each deposit is locked for 30 days** (`LOCK_DURATION`) from its own receipt. **Only the deployer** can claim, permanently and with no way to transfer this right, and only batches whose date has passed, from oldest to newest. ETH is booked under the `ETH()` key, the zero address. Reread the tested deployment’s ABI before testing. The deployer can extend the lock of all deposits, present and future, with `extendLock`; `lockExtension()` only grows and is added to every date.

Automatic transfer from the children’s walls is checked by T-52, and the launch fee deposit by T-81. Cases T-67 to T-73 deposit test tokens by direct call; T-108 claims the ETH of a fee.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-67 | Test token, direct call | Approve, then call `deposit(token, amount)` | `Deposited(token, from, amount, unlockAt)` emitted; `unlockAt` equal to the block timestamp plus 30 days; `held(token)` increases by the same amount |  |  |
| T-68 | Deposit less than 30 days old | Call `claim(token, n)` from the deployer | Rejected with `NothingToClaim` |  |  |
| T-69 | Unlocked batch | Call `claim(token, n)` from another account | Rejected with `NotDeployer` |  |  |
| T-70 | One deposit per day for 7 days | Claim every day starting on the 30th day after the first deposit | One batch comes out per day, from oldest to newest; the last one comes out 30 days after the seventh deposit; `Claimed(token, amount, tranches)` on each claim |  |  |
| T-71 | Several unlocked batches | Call `claim(token, 1)` | A single batch paid; the next one remains claimable |  |  |
| T-72 | Tokens sent by plain transfer | Call `lockUntracked(token)`, then call it again without a new transfer | New batch locked for 30 days from the first call; the second call is rejected with `NothingToLock` |  |  |
| T-73 | Locked and unlocked batches | Read `claimable(token)` and `locked(token)` | The claimable amount plus the locked amount equals `held(token)` |  |  |
| T-108 | Launch fee from T-81 deposited more than 30 days ago | Call `claim(address(0), 1)` from another account, then from the deployer | Rejected with `NotDeployer`, then ETH paid to the deployer; `Claimed(address(0), amount, 1)` emitted; `held(address(0))` decreases by the amount paid |  |  |
| T-109 | Locked batches | Call `extendLock(extra)` from another account, then from the deployer | Rejected with `NotDeployer`, then `LockExtended(extra, lockExtension)` emitted; every date read with `tranche(token, i)` moves back by `extra`; no function shortens the lock |  |  |

## 8. Forge

The Forge is a public launchpad, presented as a future release. It is not part of the CUBIT launch: it is added afterwards, with its governance vault. Record its addresses once the launchpad is added.

Any account launches a child by paying the exact fee. A Forge child deposits its entire supply in its band, the Forge receives the governance vault’s address at construction, and each launch pays its fee of 0.005 ETH to that vault, which keeps it: the launcher never gets it back. Deployment salts are bound to the launcher.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-81 | Forge available, any account | Launch a child with the exact fee of 0.005 ETH | `ChildLaunched(token, hook, launcher, team, fee)` emitted; the child’s `BandBootstrapped` shows a deposit equal to its entire supply, up to rounding; the governance vault emits `Deposited(address(0), forge, fee, unlockAt)`, with `unlockAt` equal to the block timestamp plus 30 days and any extension; the parent hook’s `pendingFloorEth` unchanged |  |  |
| T-82 | Forge available | Try a launch with an incorrect value, an empty name, a zero team or another template | Rejected: `wrong launch fee`, `invalid name`, `invalid team` or `template mismatch` |  |  |
| T-110 | Salts of a launch seen by another account | Launch from a second account with the same salts | The first launch’s addresses are not taken: salts are bound to the launcher, and the second launch is rejected with `child deployment failed` if its hook address lacks the permissions |  |  |

## 9. Replacements and powers

The registry authority can replace four peripheral addresses at any time, without delay: Vault, router, Lens and Forge. Each replacement emits `ModuleUpdated`, **increments `moduleRevision`** and closes the affected feature until the team reopens it: Vault, Momentum or Forge; replacing the router closes no feature. A candidate that is already registered, connected to another hook or another token, or already holding stake, is rejected with `InvalidModule`.

The hook has **no administrator**, and nobody can pause the swaps or the wall mechanism. The team address keeps permanent powers: it receives the team share of taxes and replaces and then activates the registry modules.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-83 | Deposits and reserve in the current Vault | Replace the Vault | Deposited CUBIT, reward reserve and unlock dates **remain in the old Vault**; no funds moved |  |  |
| T-84 | Vault replaced | On the old Vault, claim, then withdraw, then try a deposit | Claim and withdrawal remain available; the new deposit is rejected with `Inactive` |  |  |
| T-85 | Candidate already registered, or holding stake | Try the rotation | Rejected with `InvalidModule` |  |  |
| T-86 | Replacement completed | Read `moduleRevision()` and the event; after a Vault replacement, try a deposit in the new Vault | Revision incremented; `ModuleUpdated(module, previous, current, revision)` matches; the deposit is rejected with `Inactive` until the Vault is activated again |  |  |
| T-87 | Approval granted to the old router | Replace the router, then try a sale | The old approval does not apply to the new spender; a new authorization is requested |  |  |
| T-88 | Router replaced | Swap through the old router | The swap still works and the hook’s taxes apply; the dapp uses the new router |  |  |
| T-89 | Direct call | Inspect the deployed hook’s ABI | No function can suspend the swaps or the wall mechanism; the hook has no administrator |  |  |
| T-90 | Direct call | Read the Lens’s `snapshot()`, then the wall pages at the same block | The snapshot contains only market, band, wall and account fields, the total supply, the reward reserve, the active wall count, the read block and the best wall: no wall totals, and its cost does not depend on the number of walls; the circulating supply equals `totalSupply` minus the CUBIT in the walls and `rewardReserve`, and the held CUBIT is that supply minus `bandTokens` |  |  |
| T-91 | At any time after launch | Buy and sell | Swaps work normally: no account can block them |  |  |

## 10. Expected rejection cases

This table serves as a reference throughout testing. Automatic walls add no rejection to the sale: a wall that cannot be placed leaves the funds pending, and a failed transfer leaves the CUBIT pending.

> **Point of attention.** In the dapp’s current sources, contract errors are not translated: an on-chain rejection may be displayed as a raw message, truncated on screen. **For each rejection triggered, record the exact text displayed** and judge whether it is understandable.

| Error | What triggers it | What the application should show |
| --- | --- | --- |
| `ExternalLiquidityForbidden` | Liquidity added by a third party | Operation impossible: the protocol is the sole liquidity provider |
| `SupplyNotDeposited` | Initialization with a deposit below 80% of the supply | Launch impossible, insufficient deposit |
| `Expired` | Transaction deadline passed | Quote expired, recalculate one |
| `TooLittleReceived(received, minimum)` | Output below the accepted minimum | Slippage protection triggered |
| `TooMuchRequested(required, maximum)` | Input above the accepted cap | Input cap protection triggered |
| `IncompleteInput` | Exact input not fully consumed | Amount too large for the available liquidity |
| `InsufficientOutput` | Exact output not fully served | The book cannot serve this output |
| `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` | Invalid order parameters, or zero amount sent to the Vault | Input error, without raw code |
| `Inactive`, `Locked` | Vault not connected to the current registry, or withdrawal before expiry | Module unavailable, or unlock date |
| `NotDeployer`, `NothingToClaim`, `NothingToLock`, `NothingToExtend` | Claim or extension on the governance vault by a third party, claim before expiry, locking without a new balance, zero extension | Restricted action, nothing to claim, nothing to lock or nothing to extend |
| `NotAuthority`, `InvalidModule` | Replacement requested by a third party, or incompatible candidate | Replacement rejected, with the reason |

Purely application-level rejections are recorded too: stale quote, modified swap context, wallet on another chain, changed account, changed module revision, tax rates not yet verified.

## 11. Application

These cases are run with the dapp. The interface behaviors cited come from its sources and are checked during acceptance testing.

| Case | Preconditions | Steps | Expected result | Observed result | Severity |
| --- | --- | --- | --- | --- | --- |
| T-92 | Dapp open | Go through the ten languages in the selector | Each language displays translated content, with no missing text or overflow; product names stay in English by choice |  |  |
| T-93 | Language chosen | Reload, then shrink the window below 640 px | The choice is kept from one session to the next; below 640 px, the selector shows only the flag |  |  |
| T-94 | Language other than English | Compare the home title with the English version | The title is deliberately shortened outside English; it must neither overflow nor be cut off |  |  |
| T-95 | Screen of about 400 px | Go through each screen | No horizontal overflow; wide areas scroll within their own container; buttons remain reachable |  |  |
| T-96 | Window between 768 and 1279 px | Open the navigation | The compact menu is used up to 1279 px; it closes after navigating |  |  |
| T-97 | Transaction confirmed | Compare each displayed amount with the on-chain values at the same block | The amounts match; display rounding does not change the signed amount |  |  |
| T-98 | Operation being prepared | Switch networks in the wallet in the middle of the workflow | The quote is invalidated and signing is refused outside the expected network; the button first offers the network switch, then requires a second action to swap |  |  |
| T-99 | Operation being prepared | Switch accounts in the wallet in the middle of the workflow | Balances, authorization and quote are recalculated for the new account; a signature prepared for the old account is refused |  |  |
| T-100 | Authorization granted, swap not signed | Let the module revision change in between | The application revalidates the context and does not silently proceed with a new spender |  |  |
| T-101 | RPC unavailable or old read | Cut RPC access, then observe | The state is flagged as unverified and actions are disabled |  |  |
| T-102 | Transaction sent | Follow the hash, then the receipt | The interface distinguishes “submitted” from “successful”; events can be verified on a Sepolia explorer |  |  |
| T-103 | An on-chain rejection triggered | Record the displayed text, in full | The message must remain understandable for a user; record any raw technical code or truncated message |  |  |
| T-104 | Chinese, Korean and Japanese languages | Display these languages without access to an external font service | The characters display correctly: the fonts are served by the site |  |  |
| T-105 | Proof screen open | Read the band, the walls and the pending funds | `bandEth`, `bandTokens`, the walls, the pending ETH and the CUBIT pending transfer are displayed separately; no screen presents a ladder, keepers or burning of the walls |  |  |

## 12. Record sheet

Each table in the previous sections **is** the record sheet for its section: fill in the “Observed result” and “Severity” columns as you go through the cases. For the observed result, note at least the transaction hash or the read block, then what was observed.

Summary to attach to the report:

| Section | Cases | Compliant | Discrepancies | Highest severity |
| --- | --- | --- | --- | --- |
| 1. Preparation | T-01 to T-06 |  |  |  |
| 2. Launch and band | T-07 to T-16 |  |  |  |
| 3. Buying and selling | T-17 to T-33 |  |  |  |
| 4. Taxes and accounting | T-34 to T-40 |  |  |  |
| 5. Automatic walls | T-41 to T-52, T-106 and T-107 |  |  |  |
| 6. mCUBIT Vault | T-53 to T-66 |  |  |  |
| 7. Governance vault | T-67 to T-73, T-108 and T-109 |  |  |  |
| 8. Forge | T-81, T-82 and T-110 |  |  |  |
| 9. Replacements and powers | T-83 to T-91 |  |  |  |
| 10. Rejection cases | Cross-cutting reference |  |  |  |
| 11. Application | T-92 to T-105 |  |  |  |

A discrepancy refers **to the case number**, never to a screenshot alone. Attach the network, the deployment address, the block, the hash and the application version.

## Limitations of this plan

This plan describes what the new version’s code and the decisions of September 14, 2026 provide for. It **does not constitute a validation**: successful acceptance testing on Sepolia does not replace the test campaigns.

The “to be confirmed during testing” points must be observed, then reported back into this page.

<p class="source-note">Sources: <code>contracts/src/CubitHook.sol</code>, <code>CubitLens.sol</code>, <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>libraries/BandLib.sol</code>, <code>libraries/WallLib.sol</code>, <code>periphery/CubitRouter.sol</code>, <code>CubitV2.sol</code>, <code>CubitVault.sol</code>, <code>CubitGovernanceVault.sol</code>, <code>CubitForge.sol</code>, <code>CubitLaunch.sol</code>, the current workflows in <code>dapp/src</code> and the design decisions of September 14, 2026 recorded in <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
