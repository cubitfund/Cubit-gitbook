---
description: "Map of the CUBIT codebase: contracts, band and walls, vaults, dapp and services."
section: "04 / BUILD"
reading: "6 MIN READ"
---

# Architecture and codebase

The repository brings together Solidity contracts, a React/Vite dapp and two Node services. This GitBook is self-contained in `gitbook/`: its build reads neither private configuration nor protocol network data.

> The version described here is on the `redesign/tide-lp-autowalls-vault` branch.

## Directories

| Directory | Responsibility |
| --- | --- |
| `contracts/src` | Token, hook, libraries, interfaces and peripheral contracts |
| `contracts/test` | Historical Foundry tests on the old API; tests for the new version in `test/redesign` |
| `contracts/audit` | Additional verification harnesses and campaigns |
| `contracts/script` | Foundry deployment scripts and scenarios replayable on a local node |
| `contracts/scripts` | ABI export, checks and deployment procedures |
| `contracts/deployments` | Public version manifests and history |
| `dapp/src/chain` | Configuration, ABI, reads, quotes and transactions |
| `dapp/src/pages` | Swap, Proof, Staking, roadmap and V2 modules |
| `services/shared` | Shared configuration, clients, ABI and execution tracking |
| `services/keeper` | Service for the old maintenance, not applicable in the new version |
| `services/floor-bot` | Reading events and preparing posts |
| `audit/reports` | Dated reports and evidence attached to revisions |
| `gitbook/docs` | French sources of this documentation |

## Core contracts

| Component | Responsibility |
| --- | --- |
| `CubitToken` | ERC-20 with a single initial issuance of 21 M; only the hook may burn |
| `CubitHook` | Taxes, liquidity band, placing and emptying walls, team accounts, V2 connection |
| `BandLib` | Prices, tick conversions and rounding, wall target |
| `WallLib` | Per-tick walls: permanent identifier, index of active walls, funding and emptying of crossed walls |
| `PoolManager` v4 | Pool state, liquidity positions, swaps and settlement |

The hook is the sole liquidity provider for the CUBIT pool: any other liquidity addition is rejected. Funds are tracked in positions and through the PoolManager’s ERC-6909 claims; the hook address’s native ETH balance is therefore not a sufficient measure of reserves.

The band is a single position identified by `BAND_SALT`. Each wall occupies one `tickSpacing` cell under its own salt. `WallLib` works on the hook’s storage: claims and positions remain allocated to the hook.

## Peripheral contracts

| Component | Responsibility |
| --- | --- |
| `CubitRouter` | Exact-input/output swaps, slippage limit, deadline, settlement and transfer of absorbed CUBIT after each sale |
| `CubitLens` | Derived views: market, band, walls, accounts, circulating supply, held CUBIT and best wall |
| `CubitV2` | Stable module registry, revision and vault history |
| `CubitVault` | CUBIT deposits, 24-hour lock and CUBIT reward paid from a reserve |
| `CubitGovernanceVault` | Launchpad governance vault: launch fees in ETH and tokens from children’s walls, locked for 30 days per deposit, plus any extension; claiming and extending reserved for the deployer, permanently |
| `CubitForge` | Public launchpad of isolated child markets, added after launch; launch fee of 0.005 ETH paid to the governance vault, whose address is fixed at construction |
| `CubitLaunch` | Launch in a single transaction: 80% of the supply in the band, 20% in the vault reserve and the deployer buy |

The team address can replace Router, Lens, Vault and Forge in the registry at any time, without delay, and then activate them; these powers are permanent, and each replacement deactivates the affected feature until it is activated again. The token, hook, pool identities and registry anchor do not follow this replacement mechanism, and the hook has no administrator: nobody can pause the swaps or the wall mechanism.

## The read workflow

```text
Frontend or service
    → public manifest: network, core, registry
    → registry at a given block: modules + revision
    → module connection checks
    → Lens and hook views at the same block
    → display or action simulation
```

In the frontend, `releases.ts` resolves modules and `vault.ts` preserves reads from old Vaults. A missing RPC response must not authorize signing. The dapp’s data layer reads the ABI of the version in service.

## The swap workflow

The frontend obtains a quote and then a simulation. The router opens the PoolManager’s settlement context; the hook applies taxes on the ETH leg, and the swap follows the curve of the band and of the walls crossed. The router then settles the deltas.

On every sale, in `afterSwap`, the hook empties fully crossed walls and then places the pending ETH in a wall at the target calculated on the price after the sale, or 1% below the current price when that target is not below the market, at or below the launch price. At the end of the sale, the CUBIT router calls `deliverAbsorbed()` to send the absorbed CUBIT to the vault reserve; a failure of this transfer does not block the sale.

Boundaries matter: the router callback is accessible only to the PoolManager during the expected operation, and the payer comes from the router’s authenticated caller.

## What the new version changed

The band replaces the ladder, and `rebalance`, `raiseFloor`, the sweep and the bounties are removed. Walls are placed and emptied during sales, and the CUBIT from crossed walls joins the vault reserve instead of being burned.

The historical `contracts/test` suite uses the old API and does not compile with the new version; the new version’s tests are in `test/redesign`. The next steps appear in the [roadmap](../roadmap.md), and the tested components in [version status](../securite/etat.md).

<p class="source-note">Sources: named repository files, especially <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> and service READMEs.</p>
